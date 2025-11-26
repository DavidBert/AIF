# Compute Prediction intervals:

# Set value of nominal error rate alpha
alpha = 0.1

# Initialize lower and upper arrays
y_pred_test = []
y_lower = []
y_upper = []

for fold, (train_index, val_index) in enumerate(kf.split(scores)):

    # Compute predictions on k-th model
    y_pred = models[fold].predict(X_test)
    y_pred_test.append(y_pred)

    # Extract scores
    scores_fold = scores[val_index]

    # Update lower and upper arrays
    y_lower.append(y_pred[:, np.newaxis] - scores_fold[np.newaxis, :])
    y_upper.append(y_pred[:, np.newaxis] + scores_fold[np.newaxis, :])


# Convert the lists y_lower and y_upper into numpy arrays
y_pred_test = np.stack(y_pred_test)
y_lower = np.concatenate(y_lower, axis=1)
y_upper = np.concatenate(y_upper, axis=1)

# Compute predictions by averaging over the k models
y_pred_test = np.mean(y_pred_test, axis=0)

# Compute prediction intervals using the numpy quantile function
alpha_lower_corrected = np.floor(alpha * (len(scores) + 1)) / len(scores)
alpha_upper_corrected = np.ceil((1 - alpha) * (len(scores) + 1)) / len(scores)
y_lower = np.quantile(y_lower, alpha_lower_corrected, axis=1, method="inverted_cdf")
y_upper = np.quantile(y_upper, alpha_upper_corrected, axis=1, method="inverted_cdf")