# Compute the prediction intervals along with the point predictions

y_pred, y_pred_lower, y_pred_upper = split_cp.predict(X_test, alpha=alpha)