from deel.puncc.regression import CVPlus

# Create a linear regression model and wrap it in a predictor
lr_model = LinearRegression()
base_predictor = BasePredictor(lr_model)

# Wrap the base predictor in a split conformal predictor, choose K=5
cvplus = CVPlus(base_predictor, K=10, random_state=31)

# Fit the CV+ predictor
cvplus.fit(X=X_train, y=y_train)

# Compute prediction intervals and metrics on the test set
y_pred, y_pred_lower, y_pred_upper = cvplus.predict(X_test, alpha=0.1)