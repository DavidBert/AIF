# Generate synthetic 1D heteroskedastic data

def heteroskedastic_data(n_samples):
    X = np.random.uniform(0, 20, n_samples)
    y = (1 + np.random.randn(n_samples)) * X
    X = X.reshape(-1, 1)
    return X, y

n_samples = 4_000
X, y = heteroskedastic_data(n_samples)