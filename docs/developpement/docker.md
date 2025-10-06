# Development for Data Scientist:
## Docker 

<!-- ## Course (Video by Brendan Guillouet)
<iframe width="560" height="315" src="https://www.youtube.com/embed/loMf5bFyzY4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> -->

<!-- *   [Slides](https://github.com/wikistat/AI-Frameworks/tree/master/slides/Code_Development_Docker.pdf) -->


<!-- <!-- ## Practical Session -->

In this practical session, you will now learn how to run your code through a Docker container.  
Using docker in data science projects has two advantages:  

*   Improving the reproducibility of the results  
*   Facilitating the portability and deployment  

In this session, we will try to package the code from our Gradio applications, allowing us to predict digits labels and to colorize images into a Docker image.  
We will then use this image to instantiate a container that could be hosted on any physical device to run the app.  
Make sure to have finished the [previous practical session](../developpement/mnist.md) before starting this one.

To make our full application work, we want to package both the Gradio application and the API into a two containers.  
To do so, we will create two Dockerfiles, one for the API and one for the Gradio application.  
We will then use docker-compose to run both the API and the Gradio application in a single container.

This is the plan, but it's easier to make and test both containers separately when debugging.
We will then create independent containers for each application and test them separately and then we will use docker-compose to run them together.  
Let's start by creating the Dockerfile corresponding to the API.  

## API container

### Requirements
Our API just need the following packages: ```torch```, ```torchvision```, ```flask```, ```pillow```, ```numpy```.
Create a new file named `requirements-api.txt` containing the following code:
```python
torch==2.0.1
torchvision==0.15.2
flask==2.3.2
pillow==10.0.0
numpy==1.24.4
```
It is a good practice to specify the version of the packages you are using to make sure to get the same environment eveytime you build the image.

#### Dockerfile
We will first create the Dockerfile corresponding to our environment.  

On your local machine, create a new file named `Dockerfile-api` containing the following code (update the path to the model file if needed):
```python
# Use an official Python runtime as the parent image
FROM python:3.10-slim

# Set the working directory in the container to /app
WORKDIR /app


# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements-api.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable for Flask to run in production mode
ENV FLASK_ENV=production

# Run mnist_api.py when the container launches
CMD ["python", "mnist_api.py", "--model_path", "weights/mnist_net.pth"]
```

Take a moment to analyze this dockerfile.  
As you can see, it is built upon an existing image with python 3.10.  
Starting from existing images allows for fast prototyping. You may find existing images on [DockerHub](https://hub.docker.com/).  
The python 3.10 image we will be using is available [here](https://hub.docker.com/_/python).  
You can have a look at its corresponding dockerfile [here](https://github.com/docker-library/python/blob/093598a0190ba9074b899d6a0a21a00c859aac56/3.10/slim-trixie/Dockerfile).  
Remmeber that docker images are organized by layers.  This  means that our image will be built upon the python 3.10 image and will contain all the dependencies you could find in the base image.  

#### API Image
If docker is not already installed in your machine, follow [this guide](https://docs.docker.com/engine/install/) to install it.

You may now build your first image using the following command:

```bash
sudo docker build -f Dockerfile-api -t mnist-flask-app .
```

```-f``` is used to specify the Dockerfile to use.  
```-t``` is used to specify the name of the image.  
```.``` is used to specify the context of the build. In our case, the context is the current directory.



The image should take a few minutes to build.  
Once it is done, use the following command to list the available images on your device:
```console
sudo docker image ls
```
How many images can you see? What do they refer to?  

If you remember, this is not the ideal way to build a dockerfile.  If we need to modify our code, we will have to rebuild the image and it will be re-downloaded all the dependencies.
Try to add a comment in the ```mnist_api.py``` file with an empty line and to rebuild the image.  
This is probably quite long. 
Try to solve this problem by moving the part where you install the dependencies to the Dockerfile.  

#### API Container
Now that our images are built, we can use them to instantiate containers.
Since a container is an instance of an image, we can instantiate several containers using a single image.

We will run our first container using the interactive mode.

Run the following command to run your fist container:
```bash
sudo docker run --rm -p 5075:5075 --name mnist mnist-flask-app
```

```-p``` is used to specify the port mapping.  This means that the container port 5075 (the port on which the API is running) will be accessible on port 5075 of the host machine.
```--rm``` is used to remove the container when it stops. This is useful to avoid leaving orphaned containers behind.
```--name``` is used to specify the name of the container.
```mnist-flask-app``` is the name of the image we built in the previous step.
```mnist``` is the name of the container.

On a separate terminal, you can list all your running containers using the following command:
```console
sudo docker container ls
```

Quit the container using `ctrl+c`.

Your container is closed and does not appear when you list all the containers.

Restart a container using the following command:
```bash
sudo docker run --rm -p 5075:5075 --name mnist mnist-flask-app
```

We will now test the API from the container.
If everything is working, you should be able to request your API using the notebook `test_api.ipynb`.
Check that everything is working is OK.


## Gradio container

### Requirements
Our Gradio application just need the following packages: ```pillow```, ```gradio```, ```numpy```.
Create a new file named `requirements-gradio.txt` containing the following code:
```python
pillow==10.3.0
gradio==5.49
numpy==1.26.4
```


#### Dockerfile
We will now create the Dockerfile corresponding to our environment.  

On your local machine, create a new file named `Dockerfile-gradio` containing the following code:
```bash
FROM python:3.10-slim

WORKDIR /app

COPY requirements_gradio.txt .
RUN pip install --no-cache-dir -r requirements_gradio.txt

# App code
COPY . /app

# Gradio uses 7860 by default
EXPOSE 7860

# Immediate logging without -t
ENV PYTHONUNBUFFERED=1

# (FLASK_ENV isn't used by Gradio; safe to drop)
# ENV FLASK_ENV=production

CMD ["python", "mnist_gradio.py"]

```

Take a moment to analyze this dockerfile.  
#### Gradio Image
Let's modify a little bit the gradio application to use the API from the localhost.
To do so, we need to change the base URL for API requests in the `mnist_gradio.py` file.
Change the following line:
```python
response = requests.post("http://:5075/predict", data=img_binary.getvalue())
```
to
```python
response = requests.post("http://host.docker.internal:5075/predict", data=img_binary.getvalue())
```
By doing so, the API will be accessible to the container from the host machine.

Now you can build the image using the following command:
```bash
sudo docker build -f Dockerfile-gradio -t mnist-gradio-app .
```

#### Gradio Container
Once the image is built, you can run the container using the following command:
```bash
sudo docker run --rm -p 7860:7860 --name mnist mnist-gradio-app
```

On another terminal, run the API locally and check that the Gradio application is working (`http://localhost:7860`):
```bash
python mnist_api.py
```

## Docker compose
At this point, we have two containers running well independently.  
It's time to run them together.
To do so, we will use docker-compose.
Create a new file named `docker-compose.yml` containing the following code:
```yaml
version: '3.8' # specify docker-compose version
services: # services to run
  api: # name of the first service
    build: 
      context: . # specify the directory of the Dockerfile
      dockerfile: Dockerfile-api # specify the Dockerfile name
    ports:
      - "5075:5075" # specify port mapping
      
  gradio-app:
    build:
      context: . # specify the directory of the Dockerfile
      dockerfile: Dockerfile-gradio # specify the Dockerfile name
    ports:
      - "7860:7860" # specify port mapping
    depends_on:
      - api # specify service dependencies
```

We are creating two services:
- `api`: the API service
- `gradio-app`: the Gradio application service
The `depends_on` directive is used to specify that the Gradio application service depends on the API service.  
This means that the Gradio application service will not start until the API service is running.  

Both containers are exposed on the host machine on the ports 5075 and 7860 and will be able to communicate with each other.
Thus let's revert the change we made in the `mnist_gradio.py` file to use the API from the localhost.
Change the following line:
```python
response = requests.post("http://host.docker.internal:5075/predict", data=img_binary.getvalue())
```
to
```python
response = requests.post("http://0.0.0.0:5075/predict", data=img_binary.getvalue())
```

To run the application, run the following command:
```bash
sudo docker-compose up
```

If everything is working, you should be able to access the Gradio application at `http://localhost:7860`.
To delete the containers, run the following command:
```bash
sudo docker-compose down
```

That's it! Now you have a dockerized application that you can deploy on any machine that has docker installed.  

Do not hesitate to play a little more with Docker.  
For instance try to train the MNIST classifier directly in your container and to collect the tensorboard logs and the resulting weights on your local machine. 
