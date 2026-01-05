class Retriever():

    def __init__(self,embed_model: EmbeddingModel):
        
        self.embedding_model=embed_model
        
        # The index is a list of (Id(int),chunk); chunk needs the size DIM for the Embeddings
        self.index=[]
        
        
    def add_elements_to_index(self,chunks):

        # chunks is a list of chunk

        num = len(self.index)

        for chunk in chunks:

            self.index.append([num,chunk])
            num+=1

    def search_best(self,query,number_of_hits=3,adapt=False):
        
        # query is a str

        query_embed = self.embedding_model.get_embeddings(texts=[query]).to(device).reshape(1,self.embedding_model.dim)

        results=[]

        index=self.index

        scores=[]

        for item in index:

            id,chunk = item

            sim = self.embedding_model.compute_cos_sim_embed(embed1=query_embed,embed2=chunk.embedding)

            scores.append((id,chunk,sim))
  
        results=sorted(scores,key=lambda x:x[2],reverse=True)[:min(number_of_hits,len(index))]

        # We can also add a criterion to exclude the worst hits; here we choose an arbitrary criterion (we exclude a hit if the similarity is smaller than half of the previous one among the number_of_hits chunks)

        if adapt:

            i=1
            go=True
            while go and i<len(results):
                if results[i][2] < results[i-1][2]*0.5:
                    go=False
                else:
                    i+=1
            
            results=results[:i]

        return results
    
    def reset_Retriever_index(self):

        self.index=[]
