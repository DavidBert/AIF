# Introduction to natural language processing

[Slides](https://docs.google.com/presentation/d/1cQA_sqzP3VEisP3mClnzmdFw1YzA9u39qLNvdBORKyg/edit?usp=sharing)

<iframe width="560" height="315" src="https://www.youtube.com/embed/xA4xadv-Ki4?si=qCbzB0NrfAd_hQ_g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/vKVQ2VtHlIw?si=-FCtCBNRXxiE8XTv" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/GtG8LSdBxms?si=SumoK1H2m8rxkw_I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/8SmCXhxEPBY?si=WuK5r1wxsI-xTUjr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/zOLgQnBrfxk?si=Kl8PZouw02c0tD0r" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZZx6lkPoqoc?si=b_6Gvu4DneJzNgON" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZUWkkfR7raA?si=ZO72B5Hbq27vdsM0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/FxKSQXQ_BEg?si=dV0ege-qyGcNYN5M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>



## Practical session

[Practical session](https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/DavidBert/AIF2024/blob/main/nlp/AIF_nlp.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/DavidBert/AIF2024/blob/main/nlp/AIF_nlp.ipynb)

<!-- [Solution](https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/wikistat/AI-Frameworks/blob/website/code/nlp/INSA_NLP_TP_solutions.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/wikistat/AI-Frameworks/blob/website/code/nlp/INSA_NLP_TP_solutions.ipynb)

Additional resource: TP on neural translation with PyTorch (taken from Supaero SDD NLP course) [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/wikistat/AI-Frameworks/blob/website/code/nlp/Natural_Language_Generation_pyTorch.ipynb) -->

## Project:

During the practical session, you saw how to compute embeddings of documents using three techniques: Bag_of_words, Word2Vec and BERT.  
You will now build a recommender system based on content using the movie plots.  
To do so get the movies_metadata.csv file from [here](https://www.kaggle.com/rounakbanik/the-movies-dataset) and compute the embeddings of each movie plot (the _overview_ column) using at least a bag-of_word technique and a pre-trained model (Glove or DistillBert).
You sould create one new column for each embedding technique.    
Once this is done, build an annoy index for each embedding.  
Similarly to the recommender system project, I want you to build a web app that takes a movie description as input and returns the 5 most similar movies according to their plot.
The web app should be light and fast and provide the possibility to choose the embedding technique to use.

