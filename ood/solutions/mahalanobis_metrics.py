metrics_dict['Mahalanobis'] = {}

maha = Mahalanobis()
maha.fit(fit_features, cifar_train.targets)

scores_negatives = maha.compute_scores(test_features_negatives)
scores_positives = maha.compute_scores(test_features_positives)

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
metrics_dict['Mahalanobis']['auroc'] = auroc

threshold = compute_threshold(scores_positives, target_tpr)

metrics_dict['Mahalanobis']['accuray'] = accuracy(scores_negatives, scores_positives, threshold)
metrics_dict['Mahalanobis']['tpr'], metrics_dict['Mahalanobis']['fpr'] = tpr_fpr(scores_negatives, scores_positives, threshold)
metrics_dict['Mahalanobis']['precision'], metrics_dict['Mahalanobis']['recall'] = precision_recall(scores_negatives, scores_positives, threshold)
metrics_dict['Mahalanobis']['f1'] = f_beta(scores_negatives, scores_positives, threshold, beta=1)