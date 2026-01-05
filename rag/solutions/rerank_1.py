data=[]
select_data=[]

temp_sim = retrieved_info[0][2] # The highest sim

for item in retrieved_info:
   
    Id,chunk,sim=item
    data.append((Id,chunk.content,sim))

    temp = temp_sim*0.9 # the current sim - 10%

    if sim > temp:

        temp_sim = sim
        select_data.append((Id,chunk.content,sim))


data = pd.DataFrame(data,columns=["Id","chunk","sim"])
selected_data = pd.DataFrame(select_data,columns=["Id","chunk","sim"])

print(data)
print(selected_data)