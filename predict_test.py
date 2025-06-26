import pandas as pd
import joblib


def predict_disease(l, model, diseases):
    d = {}
    for i in diseases:
        d[i] = 0
    for i in l:
        d[i] = 1
    symptoms = list(d.values())
    new_data_point = [symptoms]
    predictions = model.predict(new_data_point)
    print(predictions)
    return predictions


def main():
    test_data = pd.read_csv("test_data.csv")
    test_data["predicted"] = "Not done"
    dataframe1 = pd.read_csv(r"training_data.csv")
    diseases = list(dataframe1.columns)[:-2:]
    model = joblib.load("decision_tree.joblib", mmap_mode=None)
    predict_disease([], model, diseases)
    head = list(test_data.columns)[:-1]
    for row in range(test_data.shape[0]):
        temp = list(test_data.iloc[row, :])
        send = []
        for i in range(len(temp) - 1):
            if temp[i]:
                send.append(head[i])
        test_data.iloc[row, -1] = predict_disease([], model, diseases)
    test_data.to_csv("test_data_output.csv", index=False)
    test_data.to_excel("test_data_output.xlsx", index=False)


if __name__ == "__main__":
    main()
