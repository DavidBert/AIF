retriever.add_elements_to_index(chunks=chunks)

query='Is Robert Redford alive'

#results=retriever.search_best(query=query,number_of_hits=2,adpat=False)
results=retriever.search_best(query=query,number_of_hits=2,adpat=True)

print("results",results)
