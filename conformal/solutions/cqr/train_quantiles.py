from sklearn.ensemble import GradientBoostingRegressor

# Lower quantile regressor
lower_quantile_model = GradientBoostingRegressor(
    loss="quantile", alpha=alpha / 2, n_estimators=10
)
# Upper quantile regressor
upper_quantile_model = GradientBoostingRegressor(
    loss="quantile", alpha=1 - alpha / 2, n_estimators=10
)

# Train the models
lower_quantile_model.fit(X_fit, y_fit)
upper_quantile_model.fit(X_fit, y_fit)