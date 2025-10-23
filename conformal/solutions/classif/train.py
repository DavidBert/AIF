# Train the model for two epochs
nn_model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
nn_model.fit(X_fit, y_fit_cat, epochs=2, batch_size=256, validation_split=0.1, verbose=1)