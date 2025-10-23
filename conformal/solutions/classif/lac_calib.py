y_pred_calib = nn_model.predict(X_calib)
y_pred_test = nn_model.predict(X_test)

alpha = 0.1

conformal_classifier = SplitConformal(lac_score, lac_set)

conformal_classifier.compute_scores(y_pred_calib, y_calib)
conformal_classifier.compute_quantile(alpha)

y_predset_test = conformal_classifier.predict(y_pred_test)