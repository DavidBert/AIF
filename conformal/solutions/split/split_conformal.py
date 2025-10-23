class SplitConformal():
    def __init__(self, score_fn, predset_fn):
        self.score_fn = score_fn
        self.predset_fn = predset_fn
        self.scores = None
        self.quantile = None

    def compute_scores(self, y_calib, y_pred_calib):
        self.scores = self.score_fn(y_calib, y_pred_calib)

    def compute_quantile(self, alpha):
        corrected_alpha = np.ceil((1 - alpha) * (len(self.scores) + 1)) / len(self.scores)
        self.quantile = np.quantile(self.scores, corrected_alpha, method="inverted_cdf")

    def predict(self, y_test):
        return self.predset_fn(y_test, self.quantile)