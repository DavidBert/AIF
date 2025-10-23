from tensorflow import random
from tensorflow import keras
from tensorflow.keras import layers

random.set_seed(0)
keras.utils.set_random_seed(0)

# Classification model: convnet composed of two convolution/pooling layers
# and a dense output layer
nn_model = keras.Sequential(
   [
      keras.Input(shape=(28, 28, 1)),
      layers.Conv2D(16, kernel_size=(3, 3), activation="relu"),
      layers.MaxPooling2D(pool_size=(2, 2)),
      layers.Conv2D(32, kernel_size=(3, 3), activation="relu"),
      layers.MaxPooling2D(pool_size=(2, 2)),
      layers.Flatten(),
      layers.Dense(10, activation="softmax"),
   ]
)