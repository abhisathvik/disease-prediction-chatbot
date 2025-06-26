import streamlit as st
import pandas as pd
import joblib


def predict_disease(l):
    d = {}
    for i in diseases:
        d[i] = 0
    for i in l:
        d[i] = 1
    symptoms = list(d.values())
    new_data_point = [symptoms]
    new_data_point = pd.DataFrame([symptoms], columns=diseases)
    prediction = model.predict(new_data_point)
    return prediction[0]


def main():
    st.title("Disease Predictor")
    page = st.sidebar.selectbox("Select a page", ["Home", "About", "Predict"])

    if page == "Home":
        st.header("Welcome to the Disease Predictor")
        st.write("This app predicts diseases based on symptoms.")

    elif page == "About":
        st.header("About")
        st.write("This app provides information about various diseases.")

    elif page == "Predict":
        st.header("Predict Disease")
        st.write("Please select the symptoms:")
        selected_symptoms = st.multiselect("Symptoms", diseases)
        if len(selected_symptoms) < 3:
            st.warning("Please select at least three symptoms to predict.")
        else:
            disease = predict_disease(selected_symptoms)
            image = f"static/{disease}.jpg".replace(" ", "")
            st.image(image, caption=disease, use_column_width=True)
            st.subheader("About")
            st.write(disease_about.get(disease, "Information not available"))


if __name__ == "__main__":
    dataframe1 = pd.read_csv("training_data.csv")
    diseases = list(dataframe1.columns)[:-2]
    disease_about = (
        pd.read_excel("dis_info.xlsx").set_index("disease").to_dict()["about"]
    )
    model = joblib.load("decision_tree.joblib")
    main()
