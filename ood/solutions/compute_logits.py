# Compute logits directly from the dataset
def compute_logits(dataset, model, device):
    all_logits = []
    with torch.no_grad():
        for i in range(len(dataset)):
            image, _ = dataset[i]  # Get each image directly from the dataset
            image = image.unsqueeze(0).to(device)  # Add batch dimension and move to device
            logits = model(image)
            all_logits.append(logits)
    return torch.cat(all_logits, dim=0)  # Concatenate all logits into a single tensor

# Apply the function to CIFAR-10 and SVHN datasets
test_logits_negatives = compute_logits(cifar_test, model, device)
test_logits_positives = compute_logits(svhn_test, model, device)