coverage, avg_length = evaluate_conformal_regression(y_test, y_lower, y_upper)
print(f"Average prediction intervals width (sharpness): {avg_length:.3f}")
print(f"Average coverage: {coverage:.3f}")

def plot_cqr_conformalized_data(X, y, y_pred_lower, y_pred_upper, y_lower, y_upper):
    plt.figure(figsize=(10, 8))
    sort_indices = np.argsort(X.flatten())
    X_sorted = X[sort_indices]
    y_pred_lower_sorted = y_pred_lower[sort_indices]
    y_pred_upper_sorted = y_pred_upper[sort_indices]
    y_lower_sorted = y_lower[sort_indices]
    y_upper_sorted = y_upper[sort_indices]

    plt.scatter(X, y, alpha=0.6)
    plt.plot(X_sorted, y_pred_lower_sorted, color="red", linewidth=3)
    plt.plot(X_sorted, y_pred_upper_sorted, color="red", linewidth=3)
    plt.fill_between(
        X_sorted.flatten(),
        y_lower_sorted,
        y_upper_sorted,
        alpha=0.3,
        color="green",
    )
    plt.xlabel(r"$X$")
    plt.ylabel(r"$Y$")
    plt.xticks(np.arange(22, step=2))
    plt.tight_layout()
    plt.grid(False)
    plt.show()

plot_cqr_conformalized_data(X_test, y_test, y_pred_test_lower, y_pred_test_upper, y_lower, y_upper)