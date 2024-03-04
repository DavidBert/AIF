# Development for Data Scientist:

## Practical session 1: Deploying a digit classifier

For this session, your task is to create a script for training a simple neural network on the MNIST dataset using PyTorch. Throughout the training process, you'll utilize TensorBoard for the following purposes:

* Keeping an eye on your network's performance as epochs progress.
* Organizing your different experiments and hyperparameters.
* Generating visualizations to aid in analysis.

Once the training process is complete, you'll also learn how to export your model in a format that can be used for inference.  
Finally, you will learn how to deploy your model on a REST API using Flask and how to request it using a Python script.


<!-- The solution is available here.  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/DavidBert/N7-techno-IA/blob/master/code/developpement/MNIST_solution.ipynb)  
Try to complete the practical session without looking at it! -->


## Practical session repository:
If you haven't already done so, create an account on [Github](https://github.com/).
Then fork [this repository](https://github.com/DavidBert/AIF2024/tree/main) and clone it on your computer.  
![](../img/code/fork.png)


## The network class:

![](../img/Mnist_net.png)

Using the figure above, fill in the following code, in the ``model.py`` file, to create the network class:  

* The method ``__init__()`` should instantiate all the layers that will be used  by the network.
* The method ``forward()`` describes the forward graph of your network. All the pooling operations and activation functions are realized in this method. Do not forget to change the shape of your input before the first linear layer using ``torch.flatten(...)`` or ``x.view(...)``.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MNISTNet(nn.Module):
    def __init__(self):
        super(MNNISTNet, self).__init__()
        self.conv1 = nn.Conv2d(...)
        self.conv2 = nn.Conv2d(...)
        self.pool = nn.MaxPool2d(...)
        self.fc1 = nn.Linear(...)
        self.fc2 = nn.Linear(...)
        self.fc3 = nn.Linear(...)

    def forward(self, x):
        x = F.relu(self.conv1(x))       # First convolution followed by
        x = self.pool(x)                # a relu activation and a max pooling#
        x = ...
        ...
        x = self.fc3(x)
        return x
```
## The training script
The earlier file included your model class. Now, you will proceed to finalize the training script, named `train.py`. This script will serve as a Python script for training a neural network on the MNIST Dataset.  
Both the `train()` and `test()` methods have already been implemented.

```python
import argparse
from statistics import mean

import torch
import torchvision
import torchvision.transforms as transforms
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from tqdm import tqdm

from model import MNISTNet

 # setting device on GPU if available, else CPU
  device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def train(net, optimizer, loader, epochs=10):
    criterion = nn.CrossEntropyLoss()
    for epoch in range(epochs):
        running_loss = []
        t = tqdm(loader)
        for x, y in t:
            x, y = x.to(device), y.to(device)
            outputs = net(x)
            loss = criterion(outputs, y)
            running_loss.append(loss.item())
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            t.set_description(f'training loss: {mean(running_loss)}')

def test(model, dataloader):
    test_corrects = 0
    total = 0
    with torch.no_grad():
        for x, y in dataloader:
            x = x.to(device)
            y = y.to(device)
            y_hat = model(x).argmax(1)
            test_corrects += y_hat.eq(y).sum().item()
            total += y.size(0)
    return test_corrects / total
```
Now you will implement the main method, which will be executed each time the Python script is run. You'd like to offer users the flexibility to adjust certain learning process parameters, specifically:

* Batch size
* Learning rate
* Number of training epochs

To achieve this, the Python argparse module will be employed. This module simplifies the creation of user-friendly command-line interfaces. Incorporating arguments into a Python script through argparse is a straightforward process. To begin, you'll need to import the argparse module and create a parser instance within the main method:

```python
import argparse

if __name__=='__main__':
  parser = argparse.ArgumentParser()
```

Then, just add a new argument to the parser precising the argument's name, its type, and optionaly a default value and an helping message.

```python
  parser.add_argument('--exp_name', type=str, default = 'MNIST', help='experiment name')
```

Finaly, you can use the arguments as follows:

```python
  args = parser.parse_args()
  print(args.exp_name)
```

Complete the main method to parse the four possible arguments provided when executing the script:


```python
if __name__=='__main__':

  parser = argparse.ArgumentParser()
  
  parser.add_argument('--exp_name', type=str, default = 'MNIST', help='experiment name')
  parser.add_argument(...)
  parser.add_argument(...)
  parser.add_argument(...)

  args = parser.parse_args()
  exp_name = args.exp_name
  epochs = ...
  batch_size = ...
  lr = ...
```

The following code instantiates two [data loaders](https://pytorch.org/tutorials/beginner/basics/data_tutorial.html): one loading data from the training set, the other one from the test set.

```python
# transforms
  transform = transforms.Compose(
      [transforms.ToTensor(),
      transforms.Normalize((0.5,), (0.5,))])

  # datasets
  trainset = torchvision.datasets.MNIST('./data', download=True, train=True, transform=transform)
  testset = torchvision.datasets.MNIST('./data', download=True, train=False, transform=transform)

  # dataloaders
  trainloader = torch.utils.data.DataLoader(trainset, batch_size=batch_size, shuffle=True, num_workers=2)
  testloader = torch.utils.data.DataLoader(testset, batch_size=batch_size, shuffle=False, num_workers=2)
```

Instantiate a MNISTNet and a [SGD optimizer](https://pytorch.org/docs/stable/generated/torch.optim.SGD.html) using the learning rate provided in the script arguments.  
Call the train method to train your network and the test method to evaluate it.  
Finally, print the test accuracy. 

```python
  net = ...
  # setting net on device(GPU if available, else CPU)
  net = net.to(device)
  optimizer = optim.SGD(...)

  train(...)
  test_acc = test(...)
  print(f'Test accuracy:{test_acc}')
```

Save your model using the ``torch.save`` method.  
This method takes two arguments: the first one is the object to save, the second one is the path to the file where the object will be saved. 
Here, you will save the model's state dictionary (``net.state_dict()``) in a file named `mnist_net.pth`.  
The state dictionary is a Python dictionary containing all the weights and biases of the network.

```python
  torch.save(net.state_dict(), 'weights/mnist_net.pth')
```

You should now be able to run your python script using the following command in your terminal:
```
python train.py --epochs=5 --lr=1e-3 --batch_size=64
```

## Monitoring and experiment management
Training our model on MNIST is pretty fast.
Nonetheless, in most cases, training a network may be very long.
For such cases, it is essential to log partial results during training to ensure that everything is behaving as expected.  
A very famous tool to monitor your experiments in deep learning is Tensorboard.  
The main object used by Tensorboard is a ``SummaryWriter``.  
Add the following import:
```python
from torch.utils.tensorboard import SummaryWriter
```
and modify the train method to take an additional argument named ``writer``. Use its ``add_scalar`` method to log the training loss for every epoch.

```python
def train(net, optimizer, loader, writer, epochs=10):
    criterion = nn.CrossEntropyLoss()
    for epoch in range(epochs):
        running_loss = []
        t = tqdm(loader)
        for x, y in t:
            x, y = x.to(device), y.to(device)
            outputs = net(x)
            loss = criterion(outputs, y)
            running_loss.append(loss.item())
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            t.set_description(f'training loss: {mean(running_loss)}')
        writer.add_scalar('training loss', mean(running_loss), epoch)
```
In the ```main``` method instantiate a ``SummaryWriter`` with 
```python
writer = SummaryWriter(f'runs/MNIST')
```
and add it as argument to the ``train`` method.  
Re-run your script and check your tensorboard logs using in a separate terminal:
```bash
tensorboard --logdir runs
```

You can use tensorboard to log many different things such as your network computational graph, images, samples from your dataset, embeddings, or even use it for experiment management.  

Add a new method to the MNISTNet class to get the embeddings computed after the last convolutional layer.

```python
def get_features(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 16 * 4 * 4)
        return x
```

Now these following code to the end of your ```main``` function to log the embeddings and the computational graph in tensorboard. 

```python
  #add embeddings to tensorboard
  perm = torch.randperm(len(trainset.data))
  images, labels = trainset.data[perm][:256], trainset.targets[perm][:256]
  images = images.unsqueeze(1).float().to(device)
  with torch.no_grad():
    embeddings = net.get_features(images)
    writer.add_embedding(embeddings,
                  metadata=labels,
                  label_img=images, global_step=1)
    
  # save networks computational graph in tensorboard
  writer.add_graph(net, images)
  # save a dataset sample in tensorboard
  img_grid = torchvision.utils.make_grid(images[:64])
  writer.add_image('mnist_images', img_grid)
```

Re-run your script and restart tensorboard.   
Visualize the network computational graph by clicking on __Graph__.  
You should see something similar to this:
![](../img/tensorboard_2.png)

Click on the __inactive__ button and choose __projector__ to look at the embeddings computed by your network
![](../img/tensorboard_3.png)
![](../img/tensorboard_4.png)
![](../img/tensorboard_6.png)

## Deploying your model with Flask:
Now that your model is trained, you will deploy it using a simple Flask application.  
Flask is a micro web framework written in Python. It is classified as a microframework because it does not require particular tools or libraries. 
The following code is a simple Flask application that will load your model and given an image, it will return the predicted class.
The application will listen on port 5000 and will have a single route ```/predict``` that will accept a POST request with an image as payload.
The image will be received as a byte stream and will first be converted to a PIL image, then will be transformed using the same transformation as during training to be fed to the model.  
The model will return a tensor containing the probabilities for each class. The class with the highest probability will be returned as a JSON object.  

Complete the following code to take the path of your model as an argument and load it in the ```model``` variable. 

```python
  import argparse
  import torch
  import torchvision.transforms as transforms
  from flask import Flask, jsonify, request
  from PIL import Image
  import io
  from models import MNISTNet

  device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

  app = Flask(__name__)

  parser = ...
  ...
  model_path = ...

  model = MNISTNet().to(device)
  # Load the model
  model.load_state_dict(torch.load(model_path))
  model.eval()

  transform = transforms.Compose([
      transforms.Resize((28, 28)),
      transforms.ToTensor(),
      transforms.Normalize((0.5,), (0.5,))
  ])

  @app.route('/predict', methods=['POST'])
  def predict():
      img_binary = request.data
      img_pil = Image.open(io.BytesIO(img_binary))

      # Transform the PIL image
      tensor = transform(img_pil).to(device)
      tensor = tensor.unsqueeze(0)  # Add batch dimension
      
      # Make prediction
      with torch.no_grad():
          outputs = model(tensor)
          _, predicted = outputs.max(1)

      return jsonify({"prediction": int(predicted[0])})

      if __name__ == "__main__":
        app.run(debug=True)
```

Save the code in a file named ```mnist_api.py``` and run it with:

```bash
python mnist_api.py --model_path [PATH_TO_YOUR_MODEL]
```

Now run the `test_api.ipynb` notebook to test your API.

We requested the api one image at a time. As you may already know, neural networks are much more efficient when they are fed with a batch of images.  
Modify the `mnist_api.py` by adding a new route `/batch_predict` that will accept a batch of images and return a batch of predictions and test it with the last cell of the `test_api.ipynb` notebook.

```python
@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    # Get the image data from the request
    images_binary = request.files.getlist("images[]")

    tensors = []

    for img_binary in images_binary:
        img_pil = Image.open(img_binary.stream)
        tensor = transform(img_pil)
        tensors.append(tensor)

    # Stack tensors to form a batch tensor
    batch_tensor = torch.stack(tensors, dim=0)

    # Make prediction
    with torch.no_grad():
        outputs = model(batch_tensor.to(device))
        _, predictions = outputs.max(1)

    return jsonify({"predictions": predictions.tolist()})
  ```

## A simple GUI with tkinter
The file `mnist_gui.py` contains a simple GUI that will allow you to draw a digit and send it to the API to get a prediction.
Run the script with:
```bash 
python mnist_gui.py --model_path [PATH_TO_YOUR_MODEL]
```
and provide some of the images in the `MNIST_sample` folder as input to your model.

## Deploying your model with Gradio

As you can see, the GUI is very simple and not very user friendly.
[Gradio](https://gradio.app/) is a library that allows you to quickly create a user friendly web interface for your model. 

Install the library:
```bash
pip install gradio
```

Creating an application with Gradio is done through the use of its Interface class
The core Interface class is initialized with three required parameters:

* fn: the function to wrap a user interface around
* inputs: which component(s) to use for the input, e.g. "text" or "image" or "audio"
* outputs: which component(s) to use for the output, e.g. "text" or "image" "label"

Gradio includes more than [20 different components](https://gradio.app/docs/#components), most of which can be used as inputs or outputs.

In this example, we will use a *sketchpad* (which is an instance of the [*Image* component](https://gradio.app/docs/#image))component for the input and a [*Label* component](https://gradio.app/docs/#label)  for the output.

```python
gr.Interface(fn=recognize_digit, 
            inputs="sketchpad", 
            outputs='label',
            live=True,
            description="Draw a number on the sketchpad to see the model's prediction.",
            ).launch(debug=True, share=True);
```

Complete the ```mnist_webapp.py``` to either load your model weights or use your api to perform the predictions and run your app with the following command:

```bash
python mnist_app.py --weights_path [path_to_the weights]
```

Is your model accurate with your drawings?
Do you know why it is less accurate than on MNIST?

## Git
Commit all the modifications you have made to the repository as well as the weights and push them to your remote repository.

## Docker
Dockers are a way to package your application and all its dependencies in a single image that can be run on any machine.
The file `Dockerfile` contains the instructions to build a docker image that will run your application.  
Build the image with the following command:
```bash
sudo docker build -t mnist-flask-app .
```
This will create a docker image named `mnist-flask-app`.
A docker image is a read-only template that contains a set of instructions for creating a container that can run on the Docker platform.

You can list all the images on your machine with the following command:
```bash
sudo docker images
```

A docker container is a runnable instance of an image. You can create, start, stop, move, or delete a container using the Docker API or CLI.
Run the container with the following command:
```bash
sudo docker run -p 5000:5000 mnist-flask-app
```
You can now access your application by going to `http://localhost:5000` in your browser. 

By defult the container will run the command `python mnist_app.py --weights_path weights/mnist_net.pth` when it starts.

That's it! You have created a docker image that can be run on any machine that has docker installed.
By doing so, you have created a reproducible environment for your application that can be run on any machine.
This is very useful when you want to deploy your application on a server or in the cloud.



To list all the running containers use the following command:
```bash
sudo docker ps
```
To list all the containers (running and stopped) use the following command:
```bash
sudo docker ps -a
```
To stop a container use the following command:
```bash
sudo docker stop [CONTAINER_ID]
```
To remove a container use the following command:
```bash
sudo docker rm [CONTAINER_ID]
```
To remove an image use the following command:
```bash
sudo docker rmi [IMAGE_ID]
```

<!-- You can override this command by passing it as an argument to the `docker run` command for instance to run the gradio app you can use the following command:
```bash
docker run mnist-flask-app python mnist_gradio.py --weights_path weights/mnist_net.pth
``` -->


DO NOT FORGET TO DELETE YOUR DOCKER IMAGE AND CONTAINER WHEN YOU ARE DONE.

# Solutions:

### model.py
<script src="https://emgithub.com/embed-v2.js?target=https%3A%2F%2Fgithub.com%2FDavidBert%2FAIF2024%2Fblob%2Fsolutions%2Fdeveloppement%2FMNIST%2Fmodel.py&style=default&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on"></script>


### train.py
<script src="https://emgithub.com/embed-v2.js?target=https%3A%2F%2Fgithub.com%2FDavidBert%2FAIF2024%2Fblob%2Fsolutions%2Fdeveloppement%2FMNIST%2Ftrain.py&style=default&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on"></script>

### mnist_api.py
<script src="https://emgithub.com/embed-v2.js?target=https%3A%2F%2Fgithub.com%2FDavidBert%2FAIF2024%2Fblob%2Fsolutions%2Fdeveloppement%2FMNIST%2Fmnist_api.py&style=default&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on"></script>

### mnist_webapp.py
<script src="https://emgithub.com/embed-v2.js?target=https%3A%2F%2Fgithub.com%2FDavidBert%2FAIF2024%2Fblob%2Fsolutions%2Fdeveloppement%2FMNIST%2Fmnist_gradio.py&style=default&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on"></script>