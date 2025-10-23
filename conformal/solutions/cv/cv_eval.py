coverage, avg_length = evaluate_conformal_regression(y_test, y_lower, y_upper)
print(f"Average prediction intervals width (sharpness): {avg_length:.3f}")
print(f"Average coverage: {coverage:.3f}")

plot_conformalized_data(X_test, y_test, y_pred_test, y_lower, y_upper)