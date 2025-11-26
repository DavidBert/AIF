class Mahalanobis():
    def __init__(self):
        self.mus = None
        self.inv_cov = None
        self.labels = None

    def fit(self, features, labels):
        self.labels = np.unique(labels)
        self.mus = {}
        covs = {}
        for label in self.labels:
            label_mask  = (labels == label)
            label_features = features[label_mask]
            self.mus[label.item()] = label_features.mean(dim=0)
            covs[label.item()] = torch.cov(label_features.T) * label_features.size(0)

        cov = sum(covs.values()) / features.size(0)
        self.inv_cov = torch.linalg.pinv(cov)

    def _mahalanobis_distance(self, x, mu, inv_cov):
        diff = x - mu
        return diff @ inv_cov @ diff.T

    def compute_scores(self, test_features):
        scores = []
        for test_feature in test_features:
            distances = torch.tensor([
                self._mahalanobis_distance(test_feature, self.mus[label.item()], self.inv_cov)
                for label in self.labels
            ])
            scores.append(-torch.min(distances))
        return torch.stack(scores).cpu().numpy()