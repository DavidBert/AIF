from deel.puncc.api.prediction import BasePredictor
from deel.puncc.regression import SplitCP

# Initilize the linear_model again
linear_model = LinearRegression()

# Do not train the model yet, wrap it as a BasePredictor and let PUNCC do the job later.
base_predictor = BasePredictor(linear_model)

# Wrap the base predictor in a split conformal predictor
# train=True (default) to fit the split conformal predictor
split_cp = SplitCP(base_predictor)

# Fit the split conformal predictor:
# puncc will fit the underlying model on the fit data and
# compute nonconformity scores on the calibration set
split_cp.fit(X_fit=X_fit, y_fit=y_fit, X_calib=X_calib, y_calib=y_calib)