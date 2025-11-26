def plot_quantile_models(X, y, lower_quantile_model, upper_quantile_model):
    plt.figure(figsize=(10, 8))
    sort_indices = np.argsort(X.flatten())
    X_sorted = X[sort_indices]
    y_sorted = y[sort_indices]
    plt.scatter(X, y, alpha=0.6)
    plt.plot(X_sorted, lower_quantile_model.predict(X_sorted), color="red", linewidth=3)
    plt.plot(X_sorted, upper_quantile_model.predict(X_sorted), color="red", linewidth=3)
    plt.xlabel(r"$X$")
    plt.ylabel(r"$Y$")
    plt.xticks(np.arange(22, step=2))
    plt.tight_layout()
    plt.grid(False)
    plt.show()


plot_quantile_models(X_test, y_test, lower_quantile_model, upper_quantile_model)