y_pred_calib_lower = lower_quantile_model.predict(X_calib)
y_pred_calib_upper = upper_quantile_model.predict(X_calib)
y_pred_calib = np.stack([y_pred_calib_lower, y_pred_calib_upper])

alpha = 0.1

splitcr = SplitConformal(cqr_score, cqr_set)

splitcr.compute_scores(y_calib, y_pred_calib)
splitcr.compute_quantile(alpha)

y_pred_test_lower = lower_quantile_model.predict(X_test)
y_pred_test_upper = upper_quantile_model.predict(X_test)
y_pred_test = np.stack([y_pred_test_lower, y_pred_test_upper])
y_lower, y_upper = splitcr.predict(y_pred_test)