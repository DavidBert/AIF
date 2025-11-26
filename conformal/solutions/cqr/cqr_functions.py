def cqr_score(y_true, y_pred):
    return np.max(np.stack([y_pred[0] - y_true, y_true - y_pred[1]]), axis=0)

def cqr_set(y_pred, quantile):
    return y_pred[0] - quantile, y_pred[1] + quantile