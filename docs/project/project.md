# 🎬 Final Project — AI Tools for a Movie Streaming Platform

Welcome to the **Final Project Presentation Page**!  

In this document, you’ll find the complete instructions for the final project you’ll complete during the course.  

The goal of this project is to apply the knowledge you’ve gained to a **real-world problem**:  
> Integrating AI tools into a movie streaming platform.

---

## Project Overview

You are a **data scientist** working for a movie streaming platform.  
Your task is to automate catalog management and enhance the overall user experience using AI.

You will be responsible for:

- **Automating genre classification** of movies based on their posters or plots.  
- **Validating uploaded posters** to ensure they are actual movie posters.  
- **Recommending similar movies** based on their plots.  
- **Helping users discover movies** they might like through natural language interaction.  

You will:

- Deploy your tools as a **REST API**.  
- Create a **web interface** for user interaction.  
- **Containerize** both components using Docker.  
- **Deploy them to a cloud provider** for public access.  

---

## Part 1 — Predicting Movie Genre from Posters

You will be provided with a dataset of movie posters and their genres.  
Download it here: [Movie Posters Dataset](https://drive.google.com/file/d/1-1OSGlN2EOqyZuehBgpgI8FNOtK-caYf/view?usp=sharing)

Your goal: **Train a model** that predicts a movie’s genre from its poster.

> ⚠️ Note: Do not worry too much about your model performance, the goal is to make it work and be able to deploy it as an API. Each movie is assigned only one genre for simplicity. This makes the task easier to implement, but possibly more confusing for the model.

By this point, you should know how to:
- Use **Docker**
- Create a **Flask REST API**
- Deploy a docker image on a cloud provider

### ✅ Steps

1. Train your model using the dataset.  
2. Save the model weights (ensure CPU compatibility).  
3. Create a **Flask REST API** that predicts movie genres from posters.  
4. Build a **Gradio web interface** to interact with the API.  
5. Test everything locally.  
6. Create a **Docker image** for the API and web interface.  
7. Test the image locally.  
8. Deploy it to a **cloud provider** and verify functionality.  
9. Push all code and Docker files to **GitHub**.  

---

## Part 2 — Validating Movie Posters

Sometimes, uploaded images are **not real movie posters** and must be rejected.  
You will extend your application to detect whether an image is a valid movie poster.

### ✅ Steps

1. Choose and implement a method to verify that an image is a movie poster.  
2. Add a **new API route** for this validation.  
3. Add a **new button** in the web interface for poster validation.  
4. Update the Docker configuration and rebuild the image.  
5. Test locally.  
6. Deploy to the cloud and verify it works.  
7. Push all code and Docker files to **GitHub**.  

---

## Part 3 — Predicting Genre and Recommending Movies from Plots

If a poster is unavailable or invalid, you can use the **movie plot** to predict its genre.

You’ll use **NLP techniques** learned in the course to build this functionality.
You will be provided with a dataset of movie plots corresponding to the movie posters dataset.  (Beware these are AI generated plots, they are not very good, and it's quite likely that they do not really reflect the movie plot.)
Download it here: [Movie plots Dataset](https://drive.google.com/file/d/1YHwaHYHSqv11_vqQpa7z1CO892B3431p/view?usp=sharing)

### ✅ Steps

1. Train a model to predict movie genres from plots.  
2. Compute and store plot embeddings in an **Annoy index**.  
3. Add API routes to:
   - Predict genre from a plot.  
   <!-- - Recommend similar movies based on plot similarity.   -->
4. Add buttons to the web interface for:
   - Genre prediction from plot.  
   <!-- - Movie recommendations.   -->
5. Update the Docker configuration, rebuild the image, and test locally.  
6. Deploy to the cloud and verify everything works.  
7. Push all code and Docker files to **GitHub**.  

<!-- > 💡 Optional: You may deploy the Annoy index in a **separate container** for scalability.  
> This is good practice but **not required** — you won’t be penalized for keeping it in a single container. -->

---

## Part 4 — Natural Language Movie Discovery

In this final part, users will be able to **find movies they might like** by chatting with the platform in **natural language**.
Taking inspiration of what you did in the practical session on RAGs, build a single Annoy index that will be used to retrieve movies based on their plots and posters. How to do this?  
Use CLIP to compute the embeddings of the movie plots and posters and store them in the Annoy index.  
Do not store the annoy index on the github repository, instead host it on a cloud service or just directly add it to your docker image.
---

## ⚙️ General Instructions

- 👥 Work in **groups of 4–5 students**.  
- 🗂️ Use a **single GitHub repository** for the project.  
- 🧾 Include a **clear README** explaining how to run the project locally.  
- 🌱 Use **Git throughout the project** — create at least one branch per part.  
- 💻 The web application must be **fully functional** for project validation.  
- ☁️ Do **not store model weights or datasets** in the repository.  
  - Host them on a cloud service (e.g., Google Drive).  
  - Your Dockerfile should **download them at runtime** if needed.  

---

##  Evaluation Criteria

Each part of the project is worth **5 points**, distributed as follows:

| Criterion | Points |
|------------|--------|
| Working API deployed on a cloud provider | 2 pts |
| Working web interface deployed on a cloud provider | 1 pt |
| Clean and well-documented code | 1 pt |
| Proper Git usage (branches, commits, etc.) | 1 pt |

> ⚠️ Every group member must actively contribute to the project and be able to explain their work.  
> Commit history and code contributions will be reviewed to verify participation.

---

### Good luck, and have fun building your AI augmented movie platform!
