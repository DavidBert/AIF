def plot_data(X, y):
    plt.figure(figsize=(10, 8))
    plt.scatter(X, y, alpha=0.6)
    plt.xlabel(r"$X$")
    plt.ylabel(r"$Y$")
    plt.xticks(np.arange(22, step=2))
    plt.tight_layout()
    plt.grid(False)
    plt.show()

plot_data(X, y)