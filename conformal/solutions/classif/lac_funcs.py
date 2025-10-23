def lac_score(probas, labels):
    scores = [1 - p[l] for p, l in zip(probas, labels)]
    return np.array(scores)

def lac_set(probas, quantile):
    return [np.where(p > 1 - quantile)[0] for p in probas]