# print test loss and accuracy
model.eval
with torch.no_grad():
    test_loss = 0
    correct = 0
    total = 0
    for images, labels in cifar_test_loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)
        test_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    print(f"Test Loss: {test_loss / len(cifar_test_loader):.4f}")
    print(f"Test Accuracy: {100 * correct / total:.2f}%")