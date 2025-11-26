# Evaluate the sharpness and coverage of the prediction intervals
coverage = metrics.regression_mean_coverage(y_test, y_pred_lower, y_pred_upper)
width = metrics.regression_sharpness(y_pred_lower=y_pred_lower,
                                    y_pred_upper=y_pred_upper)

print(f"Marginal coverage: {coverage:.2f}")
print(f"Average width: {width:.2f}")

# Plot the prediction intervals
plot_prediction_intervals(
    y_true=y_test,
    y_pred_lower=y_pred_lower,
    y_pred_upper=y_pred_upper,
    y_pred=y_pred,
    X=X_test[:, 0],
)
plt.show()