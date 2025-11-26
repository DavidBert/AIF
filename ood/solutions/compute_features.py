# Compute features directly from the dataset
def compute_features(dataset, model, device):
    all_features = []
    with torch.no_grad():
        for i in range(len(dataset)):
            image, _ = dataset[i]  # Get each image directly from the dataset
            image = image.unsqueeze(0).to(device)  # Add batch dimension and move to device
            features = model(image, return_features=True)
            all_features.append(features)
    return torch.cat(all_features, dim=0)  # Concatenate all logits into a single tensor

# Apply the function to CIFAR-10 train, test, and SVHN test datasets
fit_features = compute_features(cifar_train, model, device)
test_features_negatives = compute_features(cifar_test, model, device)
test_features_positives = compute_features(svhn_test, model, device)