def confusion_matrix(scores_negatives, scores_positives, threshold):
    false_positives = np.sum(scores_negatives > threshold)
    true_postives = np.sum(scores_positives > threshold)
    true_negatives = np.sum(scores_negatives <= threshold)
    false_negatives = np.sum(scores_positives <= threshold)
    return false_positives, true_postives, true_negatives, false_negatives

def tpr_fpr(scores_negatives, scores_positives, threshold):
    fp, tp, tn, fn = confusion_matrix(scores_negatives, scores_positives, threshold)
    tpr = tp / (tp + fn)
    fpr = fp / (fp + tn)
    return tpr, fpr

def accuracy(scores_negatives, scores_positives, threshold):
    fp, tp, tn, fn = confusion_matrix(scores_negatives, scores_positives, threshold)
    return (tp + tn) / (tp + tn + fp + fn)

def precision_recall(scores_negatives, scores_positives, threshold):
    fp, tp, tn, fn = confusion_matrix(scores_negatives, scores_positives, threshold)
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    return precision, recall

def f_beta(scores_negatives, scores_positives, threshold, beta):
    precision, recall = precision_recall(scores_negatives, scores_positives, threshold)
    return (1 + beta**2) * (precision * recall) / ((beta**2 * precision) + recall)