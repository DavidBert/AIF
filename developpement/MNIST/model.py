import torch
import torch.nn as nn
import torch.nn.functional as F

class MNISTNet(nn.Module):
    def __init__(self):
        super(MNISTNet, self).__init__()
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