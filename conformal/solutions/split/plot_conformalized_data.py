def plot_conformalized_data(X, y, y_pred, y_lower, y_upper):
    plt.figure(figsize=(10, 8))
    sort_indices = np.argsort(X.flatten())

    plt.scatter(X, y, alpha=0.6)
    plt.plot(X, y_pred, color="red", linewidth=3)
    plt.fill_between(
        X[sort_indices].flatten(),
        y_lower[sort_indices],
        y_upper[sort_indices],
        alpha=0.3,
        color="green",
    )
    plt.xlabel(r"$X$")
    plt.ylabel(r"$Y$")
    plt.xticks(np.arange(22, step=2))
    plt.tight_layout()
    plt.grid(False)
    plt.show()

plot_conformalized_data(X_test, y_test, y_pred_test, y_lower, y_upper)