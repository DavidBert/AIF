from sklearn.model_selection import KFold

# Define the k-fold cross-validation scheme
kf = KFold(n_splits = 10, shuffle = True, random_state = 31)

# Initialize empty lists to store models and scores
models = []
scores = []

for fold, (train_index, val_index) in enumerate(kf.split(X_train, y_train)):

    # Split the data into training and validation sets
    X_train_fold, X_val_fold = X_train[train_index], X_train[val_index]
    y_train_fold, y_val_fold = y_train[train_index], y_train[val_index]

    # Initialize the linear model
    linear_model = LinearRegression()

    # Train the model
    linear_model.fit(X_train_fold, y_train_fold)
    models.append(linear_model)

    # Compute predictions on the validation set
    y_pred_val = linear_model.predict(X_val_fold)

    # Compute nonconformity scores and append to lists
    scores.append(abs_difference(y_val_fold, y_pred_val))

# concatenate scores into a numpy array
scores = np.concatenate(scores)