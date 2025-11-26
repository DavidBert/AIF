scoring_functions = {
    'MLS': mls,
    'MSP': msp,
    'Energy': energy,
    'Entropy': entropy
}

for method, scoring_function in scoring_functions.items():

    # Compute scores
    scores_negatives = scoring_function(test_logits_negatives)
    scores_positives = scoring_function(test_logits_positives)

    # Plot histogram of scores
    plt.figure(figsize=(10, 6))
    plt.hist(scores_negatives, bins=50, alpha=0.5, label='Negative Samples')
    plt.hist(scores_positives, bins=50, alpha=0.5, label='Positive Samples')
    plt.xlabel('Score')
    plt.ylabel('Frequency')
    plt.title(f'Histogram of {method} Scores')
    plt.legend()
    plt.show()

    # Initialize empty dict for metrics
    metrics_dict[method] = {}

    # Plot ROC curve and compute AUROC
    auroc = roc_auc(scores_negatives, scores_positives)
    metrics_dict[method]['auroc'] = auroc

    # Compute threshold for the given target_tpr
    threshold = compute_threshold(scores_positives, target_tpr)

    # Compute and store remaining metrics
    metrics_dict[method]['accuray'] = accuracy(scores_negatives, scores_positives, threshold)
    metrics_dict[method]['tpr'], metrics_dict[method]['fpr'] = tpr_fpr(scores_negatives, scores_positives, threshold)
    metrics_dict[method]['precision'], metrics_dict[method]['recall'] = precision_recall(scores_negatives, scores_positives, threshold)
    metrics_dict[method]['f1'] = f_beta(scores_negatives, scores_positives, threshold, beta=1)