# Docker compose example
Since it is not that easy to run Gradio and Annoy in a Docker container, I created an example to show how to do it to help you get started on the project.    
It is available [here](https://github.com/DavidBert/docker_compose_example).  
The ```annoy-api``` and ```Dockefile-api``` files shows how to putt an Annoy index in a Docker container and expose it as a REST API.  
The ```Dockerfile-gradio``` and the ```gradio-webapp``` files show how to put a Gradio webapp in a Docker container.
You could easily start from this example to build your recommender system.  
In the ```gradio-webapp``` I generate a random vector to show how to use the API. You can replace it with your own vector, computed by your model.  
In the ```annoy-api``` I use a fake index to show how to use the API. You can replace it with your own index, computed by your model and return as many results as you want.  

## How to run
1. Install Docker and Docker compose
2. Clone this repository: `git clone https://github.com/DavidBert/docker_compose_example.git`
3. Run `docker-compose up` in the root directory of this repository
4. Open `localhost:7860` in your browser
5. Upload an image and see the results
6. To stop the server, run 
```docker-compose down``` in the root directory of this repository
7. To remove the containers, run `docker-compose rm` in the root directory of this repository
8. To remove the images, run `docker image prune -a` in the root directory of this repository
