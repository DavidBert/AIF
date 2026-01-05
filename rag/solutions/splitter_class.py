class Splitter():

    def __init__(self,embed_model: EmbeddingModel):
        
        self.embedding_model=embed_model
        
        self.docs = [] 
        # We store the original documents as a list of .txt files (format is {"source":'File_name',"content_page":(str)})
        self.chunks=[] 
        # This will be the list of chunks 

    def get_documents(self,path_doc):
        # PATH_DOC is the Path form where the documents will be found (each document is a.txt file).
        docs=[]

        for file in Path(path_doc).rglob("*.txt"):
            name=file.name
            with open(file, "r", encoding="utf-8") as file: 
                resource=file.read().strip()
                if resource:
                    #print(resource,len(resource))
                    docs.append({"source":name,"content_page":resource})
        
        self.docs=docs


    def get_chunks_contents_from_1_doc(self,file_name,content_page,chunk_size,overlap,sentence_split=False):

        if chunk_size < overlap:
            raise Exception('Careful overlap must be smaller than chunk_size')
        
        # Now we chunk according to chunk size and overlap

        if sentence_split:

            content=content_page.split(".")

            for text in content:

                text = text.lstrip()

                if not text=="":
                    self.chunks.append(Chunk(source=file_name,
                      content=text,embed_model=self.embedding_model))
        
        else:
        
            current = 0

            while current < len(content_page):
                end = min(len(content_page),current+chunk_size)
                content = content_page[current:end]
            
                self.chunks.append(Chunk(source=file_name,
                      content=content,embed_model=self.embedding_model))
                
                current += chunk_size - overlap
        

    def get_chunks(self,path_doc,chunk_size,overlap,sentence_split=False):

        self.get_documents(path_doc=path_doc)

        docs=self.docs

        for doc in docs:

            self.get_chunks_contents_from_1_doc(file_name=doc["source"],
                                                content_page=doc["content_page"],
                                                chunk_size=chunk_size,
                                                overlap=overlap,
                                                sentence_split=sentence_split)
    
    def reset_splitter(self):

        self.docs=[]
        self.chunks=[]