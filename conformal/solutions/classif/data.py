from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical

# Load MNIST Database
(X_train, y_train), (X_test, y_test) = mnist.load_data()

# Preprocessing: reshaping and standardization
X_train = X_train.reshape((len(X_train), 28, 28))
X_train = X_train.astype('float32') / 255
X_test = X_test.reshape((len(X_test), 28 , 28))
X_test = X_test.astype('float32') / 255

# Split fit and calib datasets
X_fit, X_calib  = X_train[:50000], X_train[50000:]
y_fit, y_calib  = y_train[:50000], y_train[50000:]

# One hot encoding of classes
y_fit_cat = to_categorical(y_fit)
y_calib_cat = to_categorical(y_calib)
y_test_cat = to_categorical(y_test)