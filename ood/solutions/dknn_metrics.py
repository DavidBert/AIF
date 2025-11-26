metrics_dict['DKNN'] = {}

dknn = DKNN(k=5)
dknn.fit(fit_features)

scores_negatives = dknn.compute_scores(test_features_negatives)
scores_positives = dknn.compute_scores(test_features_positives)

# Plot the histogram of the scores
plt.figure(figsize=(10, 6))
plt.hist(scores_negatives, bins=50, alpha=0.5, label='Negative Samples')
plt.hist(scores_positives, bins=50, alpha=0.5, label='Positive Samples')
plt.xlabel('Score')
plt.ylabel('Frequency')
plt.title(f'Histogram of {method} Scores')
plt.legend()
plt.show()

auroc = roc_auc(scores_negatives, scores_positives)
metrics_dict['DKNN']['auroc'] = auroc

threshold = compute_threshold(scores_positives, target_tpr)

metrics_dict['DKNN']['accuray'] = accuracy(scores_negatives, scores_positives, threshold)
metrics_dict['DKNN']['tpr'], metrics_dict['DKNN']['fpr'] = tpr_fpr(scores_negatives, scores_positives, threshold)
metrics_dict['DKNN']['precision'], metrics_dict['DKNN']['recall'] = precision_recall(scores_negatives, scores_positives, threshold)
metrics_dict['DKNN']['f1'] = f_beta(scores_negatives, scores_positives, threshold, beta=1)