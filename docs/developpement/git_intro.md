# Introduction to git 
<img src="../img/Git-logo.svg.png" alt="drawing" width="200"/>

<!-- <iframe width="560" height="315" src="https://www.youtube.com/embed/3M5XLw_tuxg?si=oJ8psg_3Udeeon_8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/1S0EFq44Po4?si=Mb-X9T9KOqFywfub" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/vGro-4gce0A?si=y6wqDapQCLg6edmo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/5t3VSnR9Nd0?si=NaMqAYlgCtqFbNWC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> -->

*   [Slides](https://docs.google.com/presentation/d/1KSNI4OVEsT2bhDDgmZkKUWUlnU7-rGA6Rq90ThpwCe8/edit?usp=sharing)

A useful cheatsheet: [https://training.github.com/downloads/github-git-cheat-sheet.pdf](https://training.github.com/downloads/github-git-cheat-sheet.pdf)  
A useful reference: [https://git-scm.com/docs](https://git-scm.com/docs)

# Practical session: Basic Git Workflow and Introduction to and CI/CD

## Introduction:

This practical session is designed for small groups of 2-3 people to work through together.  
It is very important that every member of the group runs the different commands in this practical session all shared with the same repository (we will see later what this means).
During this project, you will learn if not already, how to use Git and GitHub to manage your code and to collaborate with your team.  
You will also learn how to use GitHub Actions to deploy your code and to run tests.
This practical session is not a full Git and GitHub course, but rather a practical introduction to these tools providing you with the basic knowledge to be able to use them during this project.  
If you want to learn more about Git and GitHub, you can refer to the [official documentation](https://docs.GitHub.com/en/get-started/quickstart/set-up-git).


## Understanding Version Control

Version control is a system that helps track and manage changes to files over time. It's an essential tool for software development, enabling developers to collaborate effectively, maintain a history of changes, and manage different versions of their code. With version control, you can revert files to a previous state, compare changes over time, see who last modified something that might be causing issues, and more. It acts as a safety net, allowing developers to experiment with new ideas without fear of losing their original work.

### Example:

Imagine you're working on a Python application for a bookstore. Over time, you add several features, but one of them turns out to be problematic. With version control, you can easily remove just the unwanted feature while keeping the other improvements. Let's see how this might look:

* __Day 1:__ You start with a basic Book class.
```python
class Book:
    def __init__(self, title, author, price):
        self.title = title
        self.author = author
        self.price = price

    def display_info(self):
        return f"{self.title} by {self.author}: ${self.price}"
```

*  __Day 3:__ You add a discount feature.
```python
class Book:
    def __init__(self, title, author, price):
        self.title = title
        self.author = author
        self.price = price

    def display_info(self):
        return f"{self.title} by {self.author}: ${self.price}"

    def apply_discount(self, discount):
        self.price = self.price * (1 - discount)
```

* __Day 5:__ You add a feature to track stock, but it has a bug.
```python
class Book:
    def __init__(self, title, author, price, stock):
        self.title = title
        self.author = author
        self.price = price
        self.stock = stock

    def display_info(self):
        return f"{self.title} by {self.author}: ${self.price} (In stock: {self.stock})"

    def apply_discount(self, discount):
        self.price = self.price * (1 - discount)

    def update_stock(self, quantity):
        self.stock += quantity  # Bug: This allows negative stock!
```

* __Day 7:__ You add a method to calculate total value.
```python
class Book:
    def __init__(self, title, author, price, stock):
        self.title = title
        self.author = author
        self.price = price
        self.stock = stock

    def display_info(self):
        return f"{self.title} by {self.author}: ${self.price} (In stock: {self.stock})"

    def apply_discount(self, discount):
        self.price = self.price * (1 - discount)

    def update_stock(self, quantity):
        self.stock += quantity  # Bug: This allows negative stock!

    def total_value(self):
        return self.price * self.stock
```

* __Day 10:__ You realize the stock tracking feature has a bug allowing negative stock.

With version control, you can:
1. Review the history of changes to identify when the bug was introduced.
2. Revert just the problematic `update_stock` method while keeping the other beneficial changes.
3. Fix the bug and commit the corrected version.

Modern development teams use version control systems to manage their code, track changes, and collaborate effectively. Git is one of the most popular version control systems, providing a robust set of features for managing codebases of all sizes.

# Git
![](img/git.png)  

Git is a distributed version control system that has revolutionized how developers manage and track changes in their code. Created by Linus Torvalds in 2005, Git was born out of the need for a fast, efficient, and reliable system to manage the development of the Linux kernel. Unlike centralized version control systems that preceded it, Git allows developers to have a complete copy of the project history on their local machines, enabling offline work and providing a safeguard against data loss.
Git's distributed nature facilitates collaboration among developers, allowing them to work on different features simultaneously and merge their changes seamlessly. Its branching and merging capabilities make it easy to experiment with new ideas without affecting the main codebase. Since its inception, Git has become the de facto standard for version control in software development, used by millions of developers and organizations worldwide.


## Git's Basic Paradigms

1. **Snapshots, Not Differences**: 
   Unlike other version control systems that store data as changes to a base version of each file, Git thinks of its data more like a series of snapshots of a miniature filesystem. Every time you commit, or save the state of your project in Git, it basically takes a picture of what all your files look like at that moment and stores a reference to that snapshot.
   ![](img/snapshots.png)

2. **Local Operations**:
   Most operations in Git need only local files and resources to operate. This means you can work on your project even when you're offline or not on a VPN, unlike centralized systems that need to communicate with a server for almost every operation.

3. **Integrity**:
   Everything in Git is check-summed before it is stored and is then referred to by that checksum. This means it's impossible to change the contents of any file or directory without Git knowing about it. This functionality is built into Git at the lowest levels and is integral to its philosophy.

4. **Branching Model**:
   Git's branching model is its "killer feature." Unlike many other VCSs, Git encourages workflows that branch and merge often. This allows for feature branches, experimentation, and parallel development streams that can be easily merged when ready.

5. **Distributed Development**:
   In Git, every developer's working copy of the code is also a repository that can contain the full history of all changes. This allows for multiple backup copies and various collaborative development models.

6. **Fast and Lightweight**:
   Git is designed to be fast and efficient with large projects. Most operations are local, reducing the overhead of communicating with a centralized server.

## The Three States in Git

In Git, files can exist in three states:

1. **Modified**: You have changed the file but have not committed it to your database yet.
2. **Staged**: You have marked a modified file in its current version to go into your next commit snapshot.
3. **Committed**: The data is safely stored in your local database.

These three states correspond to the three main sections of a Git project.
When not tracked by Git, a file is in the **Untracked** state.
![](img/lifecycle.png)


## Git Areas and Workflow

Understanding the different areas in Git is crucial for mastering its workflow. Git manages your project's files through four main areas:

1. **Working Directory (Working Tree)**:
    - This is where you actually work on your project files.
    - It's a single checkout of one version of the project.
    - These files are pulled out of the compressed database in the Git directory and placed on disk for you to use or modify.

2. **Staging Area (Index)**:
    - This is a file, generally contained in your Git directory, that stores information about what will go into your next commit.
    - It's sometimes referred to as the "Index".
    - Think of it as a prep area for your next commit.
    - Files are added to this area with the `git add` command.

3. **Local Repository**:
    - This is where Git stores the metadata and object database for your project.
    - It's what's copied when you clone a repository from another computer.
    - The local repository contains all of your committed changes.
    - It's located in the `.git` directory of your project.

4. **Remote Repository**:
    - This is a version of your project that is hosted on the Internet or network somewhere (like GitHub, GitLab, or Bitbucket).
    - You can have several of them, each of which generally is either read-only or read/write for you.
    - Collaborating with others involves managing your remote repositories and pushing and pulling data to and from them when you need to share work.



### Basic Git Workflow:

1. You __modify__ files in your Working Directory.
2. You __stage__ the files, adding snapshots of them to your Staging Area.
3. You do a __commit__, which takes the files as they are in the Staging Area and stores that __snapshot__ permanently to your Local Repository.
4. You __push__ your changes to a __Remote Repository__ to share with others or as a backup.
   ![](img/areas.png)

Understanding these areas and how they interact is key to understanding Git's workflow and effectively managing your projects with version control.

# GitHub
![](img/github.png)
GitHub is a web-based hosting service for Git repositories. Launched in 2008, it has become the world's largest host of source code and a central hub for collaboration among developers. While Git is a command-line tool, GitHub provides a web-based graphical interface. It also offers access control and several collaboration features, such as bug tracking, feature requests, task management, and wikis for every project.

Key features of GitHub include:

1. **Repository Hosting**: GitHub can host your Git repositories in the cloud, making it easy to share and collaborate on code.

2. **Fork and Pull Request**: Users can "fork" an existing repository (creating their own copy), make changes, and then submit a "pull request" to propose those changes back to the original project.

3. **Issue Tracking**: GitHub provides a system for reporting and managing bugs, feature requests, and other tasks related to a project.

4. **Project Management Tools**: Including project boards, milestones, and other tools to help manage and organize work on repositories.

5. **Social Coding**: Users can follow repositories and other users, star repositories they like, and see a feed of activity from repositories and users they're interested in.

6. **GitHub Pages**: A feature that allows hosting of static websites directly from a GitHub repository.

7. **Integrations**: GitHub can integrate with many third-party services, enhancing its capabilities for things like continuous integration and deployment.

GitHub has played a significant role in the growth of open-source software, providing a platform where developers from around the world can collaborate on projects. It's used not only by individual developers and open-source projects but also by large companies to host and manage their code.

## Setting up your environment

### Anaconda and Python:
![](img/conda.png)

1. Download and install Anaconda from the official website: https://www.anaconda.com/products/distribution
2. During installation, make sure to add Anaconda to your PATH environment variable when prompted.
3. Open an Anaconda Prompt (on Windows) or a terminal (on macOS/Linux).
4. Create a new environment for this project:
```
conda create --name gitproject python=3.8
```
5. Activate the environment:
```
conda activate gitproject
```
6. Install Flask (we'll use it for examples during the session):
```
pip install flask
```

### Git
![](img/git.png)
1. Download Git from the official website: https://git-scm.com/downloads
2. Follow the installation instructions for your operating system.
3. After installation, open a new terminal or command prompt and verify the installation:
```
git --version
```
4. Configure your Git username and email:
```
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### GitHub
![](img/github.png)
We will use GitHub as our remote repository for this project.  
If you don't have a GitHub account, you can create one for free at https://github.com/.

### Remote repository
(Just one person in the group should do this and invite others to collaborate)

1. Log in to GitHub.
2. Click the "new" button on the left menu.
3. Name your repository (e.g., "flask-git-demo").
4. Choose to make it public.
5. Initialize the repository with a README file.
6. Click "Create project".
7. To invite collaborators:
   - Go to your repository's page.
   - On the left menu, click on "Members" and invite the other members of the group.
   - Give them the "Developer" role.


### Local repository

1. Open a terminal or command prompt.
2. Navigate to the directory where you want to create your project:
```
cd path/to/your/project/directory
```
3. Clone the remote repository:
```
git clone https://github.com/your-username/flask-git-demo.git
```
   (Replace 'your-username' with the GitHub username of the person who created the repository)
4. Navigate into the cloned repository:
```
cd flask-git-demo
```

Now your environment is set up and ready for the Git and GitHub practical session. Each member of the group should have Python, Flask, and Git installed, a GitHub account, and a local copy of the repository. The repository owner has set up the remote repository and invited other group members as collaborators.

## Practical session: A Flask Web App Development with Git and GitHub
We'll build a Flask web app that collects a user's name and date of birth, then displays various information based on this input. We'll develop this app in stages, using Git and GitHub to manage our development process.

### Stage 1: Basic Setup and First Commit - Explained Guide

In this stage, we'll set up a basic Flask app within our existing Git repository. To avoid conflicts, only one person (the team lead) should perform the initial setup and push the changes. Other team members will then pull these changes.

#### For the Team Lead:

##### 1. Navigate to the Project Directory

First, we need to ensure we're in the correct directory for our project.

```
cd path/to/flask-git-demo
```
This command changes the current directory to your project folder.

##### 2. Create the Flask App

Now, we'll create the basic structure for our Flask application.

1. Create a new file called `app.py`:

```
touch app.py
# touch is a command that creates an empty file
# on windows just create it manually
```

   This command creates an empty file named `app.py`.

2. Open `app.py` in your preferred text editor and add the following code:

```python
from flask import Flask, render_template, request
from datetime import datetime

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        welcome_message = f"Welcome, {name}! Your date of birth is {dob}."
        return render_template('result.html', message=welcome_message)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
```
   This code sets up a basic Flask app with a route that handles both GET and POST requests.

3. Create a new directory for our HTML templates:
```
mkdir templates
# mkdir is a command that creates a new directory
# on windows just create it manually
```
   This command creates a new directory named "templates", where Flask will look for our HTML files.

4. Create two HTML files in the `templates` directory:

   For `index.html`:
```
touch templates/index.html
# on windows just create it manually
```
   Then add the HTML content for the form in your text editor.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Birthday App</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <h1>Welcome to the Birthday App</h1>
    <form method="POST">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
        
        <label for="dob">Date of Birth:</label>
        <input type="date" id="dob" name="dob" required>
        
        <input type="submit" value="Submit">
    </form>
</body>
</html>
```

   For `result.html`:
```
touch templates/result.html
# on windows just create it manually
```
   Then add the HTML content for the result page in your text editor.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Birthday App Result</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <h1>Your Birthday Information</h1>
    <p>{{ message }}</p>
    <a href="{{ url_for('index') }}">Go back</a>
</body>
</html>
```


##### 3. Update .gitignore

To keep our repository clean, we'll update the .gitignore file to exclude unnecessary files.

```
echo "venv/" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "*.pyc" >> .gitignore
```
These commands append new lines to the .gitignore file, telling Git to ignore the virtual environment directory, Python cache files, and compiled Python files.
By adding these files to the .gitignore file, we ensure that they are not tracked by Git, meaning they won't be committed to the repository.

##### 4. Git Operations

Now we'll use Git to track our new files and push them to the remote repository.

1. Check the status of your repository:
```
git status
```
   This command shows you which files have been changed or are untracked.

2. Add the new files to the staging area:
```
git add .
```
   This stages all new and modified files, preparing them for commit.
   Check the status again to verify that the files have been staged:
```
git status
```

3. Commit the changes:
```
git commit -m "Add basic Flask app structure"
```
   This creates a new commit with the staged changes and adds a descriptive message.
   Check the status again to verify that the commit has been created:
```
git status
```

4. Push the changes to the remote repository:
```
git push origin main
```
   This uploads your local commits to the remote repository on GitHub.
   Check the status again to verify that the commit has been pushed:
```
git status
```

##### 5. Testing the App

Before notifying your team, make sure the app works as expected:

```
python app.py
```
This command runs your Flask application. Open a web browser and go to `http://127.0.0.1:5000/` to verify the app is functioning correctly.

##### 6. Notify Team Members

Once you've successfully pushed the changes and tested the app, notify your team members that the initial setup is complete and they can proceed with their steps.

#### For Other Team Members:

After the team lead has completed the setup and pushed the changes, follow these steps:

1. Pull the latest changes from the remote repository:
```
git pull origin main
```
   This command fetches the latest changes from the remote repository and merges them into your local branch.

2. Test the app to ensure it's working on your local machine:
```
python app.py
```
   This runs the Flask application. Check `http://127.0.0.1:5000/` in your browser to verify it's working correctly.

#### Collaboration Notes

- Always pull the latest changes before starting work each day:
```
git pull origin main
```
  This ensures you're working with the most up-to-date version of the project.

- If you encounter any issues or merge conflicts, communicate with your team to resolve them.

- Remember to commit your changes frequently with meaningful commit messages as you start working on new features in the upcoming stages.

In the next stages, we'll add more features to this app and explore more Git and GitHub concepts as a team.

### Stage 2: Implementing Age Calculation - Direct Implementation

In this stage, we'll add a feature to calculate the user's age based on their date of birth. We'll implement this directly on the main branch to practice basic Git workflows.

#### For the Student Lead of Stage 2:

##### 1. Prepare Your Local Repository

Ensure your local repository is up-to-date:

```
git pull origin main
```
This fetches and merges the latest changes from the main branch.

### 2. Implement Age Calculation

1. Open `app.py` and add a new function to calculate age:

```python
from datetime import datetime

def calculate_age(dob):
    today = datetime.today()
    birth_date = datetime.strptime(dob, "%Y-%m-%d")
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    return age
```

2. Modify the `index` function to use this new calculation:

```python
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        age = calculate_age(dob)
        welcome_message = f"Welcome, {name}! You are {age} years old."
        return render_template('result.html', message=welcome_message)
    return render_template('index.html')
```

##### 3. Test Your Changes

Run the Flask application to test your changes:

```
python app.py
```
Verify that the age calculation works correctly by submitting the form and checking the result.

### 4. Commit Your Changes

After confirming that everything works:

```
git add app.py
git commit -m "Add age calculation feature"
```
This stages and commits your changes to your local main branch.

##### 5. Push Your Changes

Push your commits to the remote repository:

```
git push origin main
```
This updates the main branch on GitHub with your new changes.

##### 6. Notify Team Members

Let your team know that you've pushed new changes to the main branch.

#### For Other Team Members:

After the student lead has pushed the changes:

1. Pull the latest changes from the remote repository:
```
git pull origin main
```
   This updates your local main branch with the new changes.

2. Test the updated application to ensure everything works correctly:
```
python app.py
```

3. If you encounter any issues, communicate with the team to resolve them.

### Stage 3: Adding Zodiac Sign Feature - Branching and Pull Requests

Now that we've implemented a feature directly on the main branch, let's discuss the concept of branching and why it's useful:

Branching in Git allows developers to diverge from the main line of development and work independently on features or experiments without affecting the main codebase. This has several advantages:

1. **Isolation**: You can work on different features or experiments without interfering with the main codebase or other developers' work.
2. **Easier collaboration**: Multiple developers can work on different features simultaneously without conflicts.
3. **Code review**: Branches facilitate code reviews through pull requests before merging changes into the main codebase.
4. **Experimentation**: You can try out ideas without the risk of breaking the main codebase.


In this stage, we'll add a feature to determine the user's zodiac sign based on their date of birth. We'll use Git branching and create a pull request to implement this feature, demonstrating a more advanced Git workflow.

#### For the Student Lead of Stage 3:

##### 1. Ensure Your Repository is Up-to-Date

First, make sure you're on the main branch and it's up-to-date:

```
git checkout main
git pull origin main
```

##### 2. Create a New Branch

Create and switch to a new branch for the zodiac sign feature:

```
git checkout -b feature/zodiac-sign
```

##### 3. Implement the Zodiac Sign Feature

1. In `app.py`, add a new function to determine the zodiac sign:

```python
def get_zodiac_sign(dob):
    month, day = map(int, dob.split('-')[1:])
    zodiac_signs = [
        (1, 20, "Capricorn"), (2, 19, "Aquarius"), (3, 20, "Pisces"), (4, 20, "Aries"),
        (5, 21, "Taurus"), (6, 21, "Gemini"), (7, 22, "Cancer"), (8, 23, "Leo"),
        (9, 23, "Virgo"), (10, 23, "Libra"), (11, 22, "Scorpio"), (12, 22, "Sagittarius"),
        (12, 31, "Capricorn")
    ]
    for m, d, sign in zodiac_signs:
        if (month, day) <= (m, d):
            return sign
```

2. Modify the `index` function to include the zodiac sign:

```python
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        age = calculate_age(dob)
        zodiac = get_zodiac_sign(dob)
        message = f"Welcome, {name}! You are {age} years old. Your zodiac sign is {zodiac}."
        return render_template('result.html', message=message)
    return render_template('index.html')
```

##### 4. Test Your Changes

Run the Flask application and test the new feature:

```
python app.py
```

##### 5. Commit Your Changes

After ensuring everything works:

```
git add app.py
git commit -m "Add zodiac sign feature"
```

##### 6. Push Your Branch to GitHub

Push your feature branch to the remote repository:

```
git push -u origin feature/zodiac-sign
```

##### 7. Create a Pull Request

1. Go to your repository on GitHub.
2. You should see a prompt to create a pull request for your recently pushed branch. Click on it.
3. Fill in the details of your pull request, describing the new zodiac sign feature.
4. Assign team members to review your pull request.

#### For Other Team Members (Reviewers):

##### Reviewing the Pull Request

1. Go to the repository on GitHub and navigate to the Pull Requests tab.
2. Click on the pull request for the zodiac sign feature.
3. Review the changes:
   - Check the code for correctness and style.
   - Consider how this feature integrates with the existing codebase.
4. To test the changes locally:
   ```
   git fetch origin # to update the local repository with the latest changes from the remote repository
   git checkout feature/zodiac-sign # to switch to the feature branch
   python app.py # to test the changes locally
   ```
5. Leave comments or request changes if necessary.
6. If everything looks good, approve the pull request.

##### After the Pull Request is Merged

Once the pull request is approved and merged:

1. Switch back to the main branch:
```
git checkout main
```
2. Pull the latest changes:
```
git pull origin main
```
3. Test the updated application to ensure everything works correctly.

In the next stage, we'll continue to build on our app and explore more advanced Git and GitHub features, such as handling merge conflicts.

### Stage 4: Enhancing the UI - Git Stash and GitHub Issues

In this stage, we'll improve the user interface of our Flask application by adding some basic CSS. We'll also learn about Git stash for managing temporary changes and use GitHub Issues for task tracking.

#### For the Project Manager (can be any team member):

##### 1. Create GitHub Issues

1. Go to your GitHub repository and navigate to the "Issues" tab.
2. Create a new issue titled "Enhance UI with CSS".
3. In the description, outline the following tasks:
   - Add a CSS file for styling
   - Style the form on the index page
   - Improve the layout of the result page
4. Add labels like "enhancement" and "ui".
5. Assign the issue to a team member.

## For the Assigned Team Member:

##### 1. Set Up Your Work Environment

Ensure your local repository is up-to-date:

```
git checkout main
git pull origin main
```

##### 2. Create a New Branch

Create a branch for the UI enhancements:

```
git checkout -b feature/ui-enhancement
```

##### 3. Add CSS File

1. Create a new directory named `static` in your project root:
```
mkdir static
```

2. Create a new CSS file:
```
touch static/style.css
```

3. Add some basic CSS to `style.css`:
```css
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
    background-color: #f4f4f4;
}

h1 {
    color: #333;
}

form {
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

input[type="text"], input[type="date"] {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

input[type="submit"] {
    background-color: #333;
    color: #fff;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 4px;
}

input[type="submit"]:hover {
    background-color: #555;
}
```


##### 4. Test Your Changes

Run the Flask application and verify the UI improvements:

```
python app.py
```

##### 5. Demonstrate Git Stash

Let's say you notice a small bug in the age calculation while working on the UI. Here's how to use Git stash:

1. Make a small change in `app.py` to fix the bug.
2. Instead of committing this change, use Git stash:
```
git stash save "Fix age calculation bug"
```
3. Your working directory is now clean and back to the state of the last commit.
4. To apply the stashed changes later:
```
git stash pop
```

##### 6. Commit UI Changes

Now, commit your UI enhancements:

```
git add static/style.css templates/index.html templates/result.html
git commit -m "Enhance UI with CSS styling"
```

##### 7. Push and Create Pull Request

Push your branch and create a merge request:

```
git push -u origin feature/ui-enhancement
```

Create a pull request on GitHub, referencing the issue number in the description (e.g., "Closes #1").

#### For Reviewers:

1. Review the pull request, checking both the code and the visual changes.
2. Test the changes locally if necessary.
3. Provide feedback or approve the changes.

#### After Merging:

1. Close the GitHub issue once the pull request is merged.
2. All team members should pull the latest changes:
```
git checkout main
git pull origin main
```


Discuss as a team:
1. How did using GitHub Issues help in organizing the task?
2. What was your experience with Git stash? How might it be useful in other scenarios?
3. How has the workflow evolved from the earlier stages of the project?

In the next stage, we'll implement a more complex feature and explore handling merge conflicts.

### Stage 5: Merging and Rebasing with Conflicts

Git offers two primary ways to integrate changes from one branch into another: merging and rebasing. 

#### Merge

Merging creates a new commit that combines the tips of two branches. This method preserves the entire history of both branches, providing a non-destructive operation that maintains a clear record of when branches diverged and were integrated. The resulting history shows the parallel development that occurred, with a visible branching structure. Merging is particularly safe for shared branches as it doesn't rewrite history. However, in projects with frequent merges, this can lead to a more complex history that may be harder to follow.

#### Rebase

Rebasing, on the other hand, moves the entire feature branch to begin on the tip of the main branch, effectively replaying your work on top of it. This results in a linear project history, as if the work was done sequentially rather than in parallel. Rebasing creates a cleaner, more streamlined history which can make it easier to track features. However, it achieves this by rewriting the project history, which can be problematic if the rebased branch has been shared with others. As such, rebasing requires more care when used on public or shared branches.

The choice between merging and rebasing often depends on the specific needs of your project and team. Merging is generally preferred for preserving complete history and for work on public branches, while rebasing is often used to maintain a cleaner history, especially for local branches or before merging a feature branch into the main line of development.

In this stage, we'll practice merging and rebasing, including handling conflicts. We'll do this by creating a new feature branch, making changes to the main branch, and then exploring both merge and rebase workflows.

#### Part 1: Merging with Conflicts

##### For Developer A:

1. Ensure your main branch is up-to-date:
```
git checkout main
git pull origin main
```

2. Create a new branch for a feature:
```
git checkout -b feature/birthday-countdown
```

3. Implement the birthday countdown feature in `app.py`:
```python
from datetime import datetime, date

def days_to_birthday(dob):
    today = date.today()
    dob = datetime.strptime(dob, "%Y-%m-%d").date()
    next_birthday = date(today.year, dob.month, dob.day)
    if next_birthday < today:
        next_birthday = date(today.year + 1, dob.month, dob.day)
    return (next_birthday - today).days

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        age = calculate_age(dob)
        zodiac = get_zodiac_sign(dob)
        days_to_bday = days_to_birthday(dob)
        message = f"Welcome, {name}! You are {age} years old. Your zodiac sign is {zodiac}. There are {days_to_bday} days until your next birthday!"
        return render_template('result.html', message=message)
    return render_template('index.html')
```

4. Commit your changes:
```
git add app.py
git commit -m "Add birthday countdown feature"
```

##### For Developer B:

1. Make sure you're on the main branch and it's up-to-date:
```
git checkout main
git pull origin main
```

2. Make a change to the `index` function in `app.py`:
```python
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        age = calculate_age(dob)
        zodiac = get_zodiac_sign(dob)
        message = f"Hello, {name}! Your age is {age} and your zodiac sign is {zodiac}."
        return render_template('result.html', message=message)
    return render_template('index.html')
```

3. Commit and push this change:
```
git add app.py
git commit -m "Update welcome message format"
git push origin main
```

##### Back to Developer A:

1. Try to merge the main branch into your feature branch:
```
git checkout feature/birthday-countdown
git merge main
```

2. You'll encounter a merge conflict. Open `app.py` and you'll see something like:
```python
   <<<<<<< HEAD
   message = f"Welcome, {name}! You are {age} years old. Your zodiac sign is {zodiac}. There are {days_to_bday} days until your next birthday!"
   =======
   message = f"Hello, {name}! Your age is {age} and your zodiac sign is {zodiac}."
   >>>>>>> main
```

3. Resolve the conflict by combining both changes:
```python
   message = f"Hello, {name}! Your age is {age} and your zodiac sign is {zodiac}. There are {days_to_bday} days until your next birthday!"
```

4. Stage the resolved file, commit the merge, and push:
```
git add app.py
git commit -m "Merge main into feature/birthday-countdown and resolve conflicts"
git push origin feature/birthday-countdown
```
Before moving to the next part, you can merge the feature branch into the main branch, either using a merge request or if you have the right to do it directly:
```
git checkout main
git merge feature/birthday-countdown
```

#### Part 2: Rebasing with Conflicts

Now, let's practice rebasing with a similar scenario.

##### For Developer A:

1. Create a new feature branch from main:
```
git checkout main
git pull origin main
git checkout -b feature/lucky-number
```

2. Add a lucky number feature to `app.py`:
```python
import random

def get_lucky_number():
    return random.randint(1, 100)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        age = calculate_age(dob)
        zodiac = get_zodiac_sign(dob)
        lucky_number = get_lucky_number()
        message = f"Hello, {name}! Your age is {age}, your zodiac sign is {zodiac}, and there are {days_to_bday} days until your next birthday. Your lucky number is {lucky_number}!"
        return render_template('result.html', message=message)
    return render_template('index.html')
```

3. Commit your changes:
```
git add app.py
git commit -m "Add lucky number feature"
```

##### For Developer B:

1. Make another change to the main branch:
```
git checkout main
git pull origin main
```

2. Update the `index` function in `app.py`:
```python
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        age = calculate_age(dob)
        zodiac = get_zodiac_sign(dob)
        days_to_bday = days_to_birthday(dob)
        message = f"Greetings, {name}! You're {age} years old with the zodiac sign {zodiac}. Your next birthday is in {days_to_bday} days."
        return render_template('result.html', message=message)
    return render_template('index.html')
```

3. Commit and push this change:
```
git add app.py
git commit -m "Refine welcome message"
git push origin main
```

##### Back to Developer A:

1. Try to rebase your feature branch onto the updated main:
```
git checkout feature/lucky-number
git rebase main
```

2. You'll encounter a rebase conflict. Open `app.py` and resolve the conflict:
```python
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        age = calculate_age(dob)
        zodiac = get_zodiac_sign(dob)
        days_to_bday = days_to_birthday(dob)
        lucky_number = get_lucky_number()
        message = f"Greetings, {name}! You're {age} years old with the zodiac sign {zodiac}. Your next birthday is in {days_to_bday} days. Your lucky number is {lucky_number}!"
        return render_template('result.html', message=message)
    return render_template('index.html')
```

3. After resolving the conflict:
```
git add app.py
git rebase --continue
```

4. Force push your rebased branch:
```
git push origin feature/lucky-number --force
```
Make a merge request to merge the feature branch into the main branch.

### Stage 6: Implementing Tests for the Flask Application

In this stage, we'll add tests to our Flask application to ensure its functionality and to practice test-driven development (TDD). We'll write both unit tests for individual functions and integration tests for the application routes.

#### 1. Set Up Testing Environment

First, we need to set up our testing environment:

1. Install pytest, a popular testing framework for Python:
```
pip install pytest
```

2. Create a new file called `test_app.py` in your project root directory.

#### 2. Writing Unit Tests

Let's start by writing unit tests for our existing functions:

1. Open `test_app.py` and add the following code:

```python
from app import calculate_age, get_zodiac_sign, days_to_birthday
from datetime import date

def test_calculate_age():
    assert calculate_age("1990-01-01") == date.today().year - 1990

def test_get_zodiac_sign():
    assert get_zodiac_sign("1990-01-01") == "Capricorn"
    assert get_zodiac_sign("1990-07-01") == "Cancer"

def test_days_to_birthday():
    today = date.today()
    next_birthday = date(today.year, 12, 31)
    if next_birthday < today:
        next_birthday = date(today.year + 1, 12, 31)
    expected_days = (next_birthday - today).days
    assert days_to_birthday("2000-12-31") == expected_days
```

These tests check the core functionality of our utility functions.

#### 3. Writing Integration Tests

Now, let's add integration tests for our Flask routes:

1. Add the following code to `test_app.py`:

```python
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"Welcome to the Birthday App" in response.data

def test_form_submission(client):
    response = client.post('/', data={
        'name': 'John Doe',
        'dob': '1990-01-01'
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b"John Doe" in response.data
    assert b"Your age is" in response.data
    assert b"Your zodiac sign is" in response.data
```

These tests check that our application's routes are working correctly.

#### 4. Running the Tests

To run the tests:

1. In your terminal, navigate to your project directory.
2. Run the following command:
```
pytest
```

You should see output indicating which tests passed or failed.
In our case you should see that `test_form_submission` failed can you see why, and how to fix it?

#### 5. Test-Driven Development: Adding a New Feature

Test-Driven Development (TDD) is a software development approach where tests are written before the actual code. The TDD cycle, often referred to as Red-Green-Refactor, consists of three steps:

1. Red: Write a test that fails. This test describes a desired functionality that doesn't exist yet.

2. Green: Write the minimal amount of code necessary to make the test pass. The focus here is on making the test pass, not on writing perfect code.

3. Refactor: Improve the code without changing its functionality. This step is about cleaning up the code, removing duplication, and ensuring it follows good design principles.

The benefits of TDD include:

- Improved code quality: By thinking about how to test the code before writing it, developers often create more modular, flexible, and easier-to-maintain code.

- Better understanding of requirements: Writing tests first forces developers to clearly understand what the code should do before implementing it.

- Built-in regression testing: As features are added, the growing suite of tests helps ensure that new changes don't break existing functionality.

- Documentation: Tests serve as a form of documentation, showing how the code is expected to behave in various scenarios.

- Confidence in refactoring: With a comprehensive test suite, developers can refactor code with confidence, knowing that if they break something, a test will fail.

Let's practice TDD by adding a new feature to determine if it's the user's birthday today.

1. First, write a test for the new function in `test_app.py`:

```python
from app import is_birthday_today

def test_is_birthday_today():
    today = date.today()
    assert is_birthday_today(f"{today.year}-{today.month:02d}-{today.day:02d}") == True
    assert is_birthday_today("1990-01-01") == (date.today().month == 1 and date.today().day == 1)
```

2. Run the tests. The new test should fail because we haven't implemented the function yet.

3. Now, implement the function in `app.py`:

```python
def is_birthday_today(dob):
    today = date.today()
    birth_date = datetime.strptime(dob, "%Y-%m-%d").date()
    return (today.month, today.day) == (birth_date.month, birth_date.day)
```

4. Run the tests again. They should all pass now.

5. Finally, update your `index` route to use this new function:

```python
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        dob = request.form['dob']
        age = calculate_age(dob)
        zodiac = get_zodiac_sign(dob)
        days_to_bday = days_to_birthday(dob)
        is_birthday = is_birthday_today(dob)
        lucky_number = get_lucky_number()
        message = f"Greetings, {name}! You're {age} years old with the zodiac sign {zodiac}. Your next birthday is in {days_to_bday} days. Your lucky number is {lucky_number}!"
        if is_birthday:
            message += "Happy Birthday!"
        else:
            message += f"There are {days_to_bday} days until your next birthday."
        return render_template('result.html', message=message)
    return render_template('index.html')
```

6. Add a test for this new route behavior in `test_app.py`:

```python
def test_birthday_today(client):
    today = date.today()
    response = client.post('/', data={
        'name': 'John Doe',
        'dob': f"{today.year}-{today.month:02d}-{today.day:02d}"
    }, follow_redirects=True)
    assert b"Happy Birthday!" in response.data
```

7. Run the tests one final time to ensure everything is working.

### Stage 7: Introduction to CI/CD

Continuous Integration (CI) and Continuous Deployment (CD) are practices in software development that aim to improve the process of building, testing, and releasing software.

#### Continuous Integration (CI)

Continuous Integration is the practice of frequently merging code changes into a shared repository. Each integration is verified by automated builds and tests. The main goals of CI are:

1. Detect and address integration issues early
2. Improve software quality
3. Reduce the time to validate and release new updates

With CI, developers integrate their work frequently, usually daily, leading to multiple integrations per day. Each integration triggers automated builds and tests to detect issues quickly.

#### Continuous Deployment (CD)

Continuous Deployment takes CI one step further. In CD, every change that passes the automated tests is automatically deployed to production. The main benefits of CD are:

1. Faster release cycles
2. Reduced manual processes and human error
3. More frequent user feedback
4. Improved developer productivity

CD can also refer to Continuous Delivery, where changes are automatically deployed to a staging environment but require manual approval for production deployment.

#### Why CI/CD is Useful

1. **Faster Bug Detection and Resolution**: Issues are caught earlier in the development process, making them easier and less expensive to fix.

2. **Improved Collaboration**: Frequent integration encourages communication between team members and keeps everyone up to date with changes.

3. **Higher Quality Software**: Automated testing ensures that tests are run consistently and frequently, catching bugs that might be missed in manual testing.

4. **Faster Time to Market**: Automating the build, test, and deployment processes reduces the time between writing code and using it in production.

5. **Reduced Risk**: Smaller, more frequent updates are less risky and easier to roll back if issues occur.

6. **Increased Confidence**: With a robust CI/CD pipeline, teams can be more confident in the stability and quality of their code.

In the following section, we'll implement a basic CI/CD pipeline using GitHub Actions, experiencing firsthand how these practices can improve our development workflow.

##### Implementing CI/CD with GitHub

In this final part, we'll set up a Continuous Integration/Continuous Deployment (CI/CD) pipeline using GitHub Actions. We'll deliberately introduce a failing test, observe it fail both locally and in the CI pipeline, and then fix it.

#### 1. Setting Up GitHub CI/CD

* In your local repository, create a new file `.github/workflows/python-app.yml` with the following content:


```yaml
name: Python Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python 3.8
      uses: actions/setup-python@v2
      with:
        python-version: 3.8
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install flask pytest
    
    - name: Run tests
      run: pytest
```

This GitHub CI/CD configuration does the following:

* Uses a Python 3.8 Docker image for the CI environment
* Defines a single stage called "test"
* Installs the necessary dependencies (Flask and pytest)
* Runs the pytest command to execute the tests
* Triggers the pipeline on pushes to the main branch and for merge requests

3. Commit and push this new file:
```
git add .github/workflows/python-app.yml
git commit -m "Add GitHub CI/CD configuration"
git push origin main
```

#### 2. Introducing a Failing Test

Let's modify our `calculate_age` function to introduce a bug, and update its test to catch this bug.

1. In `app.py`, change the `calculate_age` function:

```python
def calculate_age(dob):
    today = date.today()
    birth_date = datetime.strptime(dob, "%Y-%m-%d").date()
    age = today.year - birth_date.year
    # Introduce a bug: forget to check if birthday has occurred this year
    return age  # This might be off by one year
```

2. In `test_app.py`, update the `test_calculate_age` function:

```python
def test_calculate_age():
    today = date.today()
    assert calculate_age(f"{today.year-30}-{today.month:02d}-{today.day:02d}") == 30
    assert calculate_age(f"{today.year-30}-{today.month:02d}-{today.day+1:02d}") == 29  # This will fail
```

#### 3. Running Tests Locally

Run the tests locally to see the failure:

```
pytest
```

You should see that the second assertion in `test_calculate_age` fails.

#### 4. Pushing to GitHub and Observing CI Failure

Commit and push these changes:

```
git add app.py test_app.py
git commit -m "Update calculate_age function and its test"
git push origin main
```

Go to your GitHub repository, click on the "Build/Pipelines" tab, and you should see the pipeline running. It will fail due to the failing test.
Because of that failure, the code won't be deployed to the production environment.  
You can think of the pipeline as a way to ensure that the code is working as expected before it is deployed to the production environment.

#### 5. Fixing the Bug

Now, let's fix the bug in the `calculate_age` function:

1. In `app.py`, correct the `calculate_age` function:

```python
def calculate_age(dob):
    today = date.today()
    birth_date = datetime.strptime(dob, "%Y-%m-%d").date()
    age = today.year - birth_date.year
    # Check if birthday has occurred this year
    if today < date(today.year, birth_date.month, birth_date.day):
        age -= 1
    return age
```

2. Commit and push the fix:

```
git add app.py
git commit -m "Fix calculate_age function"
git push origin main
```

3. Go back to the GitHub tab and watch the new workflow run. It should pass all tests now.

By following these steps, you've implemented a basic CI/CD pipeline using GitHub. This pipeline will automatically run your tests whenever you push changes to the repository, helping you catch issues early and ensure the quality of your code. 
