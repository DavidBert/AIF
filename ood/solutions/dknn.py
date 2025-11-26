class DKNN:
    def __init__(self, k=50, batch_size=256):
        self.k = k
        self.batch_size = batch_size
        self.fit_features = None

    def _l2_normalization(self, feat):
        norms = torch.norm(feat, p=2, dim=1, keepdim=True) + 1e-10  # Avoid division by zero
        return feat / norms

    def fit(self, fit_dataset):
        self.fit_features = self._l2_normalization(fit_dataset)

    def compute_scores(self, test_features):
        test_features = self._l2_normalization(test_features)
        scores = []

        # Process test features in batches
        for i in range(0, test_features.size(0), self.batch_size):
            batch = test_features[i:i + self.batch_size]
            # Compute pairwise distances for the batch
            distances = torch.cdist(batch, self.fit_features, p=2)  # (batch_size, num_fit_samples)
            # Sort distances and extract the k-th nearest
            sorted_distances, _ = torch.sort(distances, dim=1)
            scores.append(sorted_distances[:, self.k - 1])  # k-th nearest distance

        # Concatenate scores from all batches
        return torch.cat(scores, dim=0).cpu().numpy()