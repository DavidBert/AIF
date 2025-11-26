def roc_auc(scores_negatives, scores_positives):
    # Combine scores and create labels
    scores = np.concatenate((scores_negatives, scores_positives))
    labels = np.concatenate((np.zeros(len(scores_negatives)), np.ones(len(scores_positives))))

    # Sort scores and labels
    sorted_indices = np.argsort(scores)
    scores = scores[sorted_indices]
    labels = labels[sorted_indices]

    # Initialize TPR and FPR
    tpr = []
    fpr = []
    n_pos = np.sum(labels)
    n_neg = len(labels) - n_pos

    tp = n_pos
    fp = n_neg

    # Compute TPR and FPR at each threshold
    for i in range(len(scores)):
        if labels[i] == 1:  # True positive
            tp -= 1
        else:  # False positive
            fp -= 1
        tpr.append(tp / n_pos)
        fpr.append(fp / n_neg)

    tpr = np.array(tpr)
    fpr = np.array(fpr)

    # Compute AUROC (Area Under the Curve)
    auroc = - np.trapezoid(tpr, fpr)

    # Plot ROC curve
    plt.figure()
    plt.plot(fpr, tpr, label=f"ROC Curve (AUROC = {auroc:.4f})")
    plt.plot([0, 1], [0, 1], 'k--', label="Random Classifier")
    plt.xlabel("False Positive Rate (FPR)")
    plt.ylabel("True Positive Rate (TPR)")
    plt.title("Receiver Operating Characteristic (ROC) Curve")
    plt.legend(loc="lower right")
    plt.grid()
    plt.show()

    return auroc
