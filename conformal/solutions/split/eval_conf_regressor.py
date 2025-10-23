def evaluate_conformal_regression(y_test, y_lower, y_upper):
    coverage = np.mean((y_test >= y_lower) & (y_test <= y_upper))
    avg_length = np.mean(y_upper - y_lower)
    return coverage, avg_length