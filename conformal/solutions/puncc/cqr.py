from deel.puncc.api.prediction import DualPredictor
from deel.puncc.regression import CQR

# Lower quantile regressor
lower_quantile_model = GradientBoostingRegressor(
    loss="quantile", alpha=alpha / 2, n_estimators=10
)
# Upper quantile regressor
upper_quantile_model = GradientBoostingRegressor(
    loss="quantile", alpha=1 - alpha / 2, n_estimators=10
)

# Wrap the upper and lower quantile models in a dual predictor
dualpredictor = DualPredictor([lower_quantile_model, upper_quantile_model])

# Initialize the CQR conformal predictor
# train=True to use the train dual predictor
cqr = CQR(dualpredictor, train=True)

# Fit the CQR predictor and compute the nonconformity scores
cqr.fit(X_fit=X_fit, y_fit=y_fit, X_calib=X_calib, y_calib=y_calib)

# Compute prediction intervals and metrics on the test set
y_pred, y_lower, y_upper = cqr.predict(X_test, alpha)  # TODO

# Compute marginal coverage and average width of the prediction intervals
coverage = metrics.regression_mean_coverage(y_test, y_pred_lower, y_pred_upper)
width = metrics.regression_sharpness(y_pred_lower=y_pred_lower,
                             y_pred_upper=y_pred_upper)
print(f"Marginal coverage: {np.round(coverage, 2)}")
print(f"Average width: {np.round(width, 2)}")

# Plot the prediction intervals
plot_prediction_intervals(
    y_pred=y_pred,
    y_true=y_test,
    y_pred_lower=y_lower,
    y_pred_upper=y_upper,
    X=X_test[:, 0],
)
plt.show()