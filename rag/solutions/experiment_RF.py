query = prompt_RF

response_no_RAG = rag.foundation_model.generate_response(prompt=query)

context = rag.get_retrieval(query=query,number_of_hits=3)

response_RAG = rag.foundation_model.generate_response_rag(prompt=query)

print(response_no_RAG,"\n",response_RAG)
