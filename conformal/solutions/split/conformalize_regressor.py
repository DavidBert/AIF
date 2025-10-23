alpha = 0.1

y_pred_calib = linear_model.predict(X_calib)
splitcr = SplitConformal(abs_difference, additive_interval)
splitcr.compute_scores(y_calib, y_pred_calib)
splitcr.compute_quantile(0.1)

y_pred_test = linear_model.predict(X_test)
y_lower, y_upper = splitcr.predict(y_pred_test)