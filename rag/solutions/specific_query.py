print("Prompt:",prompt_RF)

output = f_model.generate_response(prompt=prompt_RF)

response = short_response(output=output)

print(response)
