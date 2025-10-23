def abs_difference(y_true, y_pred):
    return np.abs(y_true - y_pred)


def additive_interval(y, radius):
    return y - radius, y + radius