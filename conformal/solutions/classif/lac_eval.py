def eval_conformal_classifier(y_true, y_predset):
    coverage = 0
    avg_size = 0
    for i in range(len(y_true)):
        if y_true[i] in y_predset[i]:
            coverage += 1
        avg_size += len(y_predset[i])


    coverage /= len(y_true)
    avg_size /= len(y_true)
    return coverage, avg_size

coverage, avg_size = eval_conformal_classifier(y_test, y_predset_test)
print(f"Average size of prediction sets: {avg_size:.3f}")
print(f"Average coverage: {coverage:.3f}")