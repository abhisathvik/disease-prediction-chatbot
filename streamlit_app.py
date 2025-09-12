import streamlit as st
import pandas as pd
import joblib
import os
import google.generativeai as genai
from streamlit_chat import message as st_message
from sklearn.preprocessing import LabelEncoder

# ===============================
# Gemini Setup
# ===============================
GEMINI_API_KEY = "AIzaSyDirUoPYuqmQJM63bjPhW9_Eh8-WLAjoz4"
def initialize_gemini():
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")
        return model
    except Exception as e:
        st.error(f"Error initializing Gemini: {e}")
        return None

def generate_response(gemini_model, user_input):
    if not gemini_model:
        return "Gemini is not initialized."

    prompt = f"""You are a helpful health assistant.
Provide short, clear information about diseases, symptoms, precautions, and treatments.

User question: {user_input}
"""
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {e}"

# ===============================
# Load Data & Model
# ===============================
@st.cache_resource
def load_assets():
    try:
        # Load datasets
        df = pd.read_csv("training_data.csv")
        symptoms_list = list(df.columns[:-1])  # all except 'prognosis'

        # Label encoder (if not saved, rebuild from training data)
        if os.path.exists("label_encoder.joblib"):
            target_encoder = joblib.load("label_encoder.joblib")
        else:
            target_encoder = LabelEncoder()
            target_encoder.fit(df["prognosis"])

        # Disease info (Excel optional)
        disease_about = {}
        if os.path.exists("dis_info.xlsx"):
            disease_about = (
                pd.read_excel("dis_info.xlsx")
                .assign(disease=lambda d: d["disease"].astype(str).str.strip().str.lower())
                .set_index("disease")
                .to_dict()["about"]
            )

        # Load decision tree model
        model = joblib.load("decision_tree.joblib")

        return symptoms_list, disease_about, model, target_encoder
    except Exception as e:
        st.error(f"Error loading assets: {e}")
        return [], {}, None, None

# ===============================
# Prediction Function
# ===============================
def predict_disease(model, symptoms_list, selected_symptoms, target_encoder):
    d = {s: 0 for s in symptoms_list}
    for s in selected_symptoms:
        if s in d:
            d[s] = 1
    new_data = pd.DataFrame([d])
    new_data = new_data.reindex(columns=model.feature_names_in_, fill_value=0)

    probs = model.predict_proba(new_data)[0]
    top1 = probs.argmax()

    # Decode numeric → disease name
    disease_name = target_encoder.inverse_transform([model.classes_[top1]])[0]
    return disease_name, probs[top1]

# ===============================
# Main App
# ===============================
def main():
    st.set_page_config(page_title="SmartMedBot", layout="wide")
    st.title("SmartMedBot 🤖🩺")

    # Load assets
    symptoms_list, disease_about, model, target_encoder = load_assets()
    if model is None:
        return

    # Initialize Gemini
    if "gemini_model" not in st.session_state:
        st.session_state.gemini_model = initialize_gemini()

    if "messages" not in st.session_state:
        st.session_state.messages = []

    # ===============================
    # Disease Prediction Section
    # ===============================
    with st.expander("🔍 Predict Disease", expanded=True):
        st.subheader("Select Symptoms")
        selected_symptoms = st.multiselect("Choose at least 3 symptoms:", symptoms_list)

        if len(selected_symptoms) < 3:
            st.warning("⚠️ Please select at least 3 symptoms.")
        else:
            disease, prob = predict_disease(model, symptoms_list, selected_symptoms, target_encoder)
            st.success(f"Predicted Disease: **{disease}** (confidence: {prob:.2f})")

            # Show description
            info = disease_about.get(str(disease).strip().lower())
            if not info:
                st.info("ℹ️ No info found in dataset. Fetching from Gemini...")
                info = generate_response(
                    st.session_state.gemini_model,
                    f"What is {disease}? Provide symptoms, precautions, and treatments."
                )

            st.write(info)

    # ===============================
    # Chatbot Section
    # ===============================
    st.divider()
    st.subheader("💬 Health Chatbot")

    user_input = st.chat_input("Ask about symptoms, diseases, or precautions...")
    if user_input:
        st.session_state.messages.append({"message": user_input, "is_user": True})
        response = generate_response(st.session_state.gemini_model, user_input)
        st.session_state.messages.append({"message": response, "is_user": False})

    for i, msg in enumerate(st.session_state.messages):
        st_message(msg["message"], is_user=msg["is_user"], key=f"msg_{i}")


if __name__ == "__main__":
    main()
