import streamlit as st
import pandas as pd
import joblib
from streamlit_chat import message as st_message
import os
import google.generativeai as genai

# Gemini API Key (FOR DEVELOPMENT ONLY)
GEMINI_API_KEY = "" #Your Gemini API key

# Initialize Gemini once using session_state
def initialize_gemini():
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
        return model
    except Exception as e:
        st.error(f"Error initializing Gemini: {e}")
        return None

# Generate response using Gemini
def generate_response(gemini_model, user_input):
    if not gemini_model:
        return "Gemini is not initialized."

    prompt = f"""You are a helpful health assistant.
Only provide information related to diseases, symptoms, and health.

User question: {user_input}
"""
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {e}"

# Main app
def main():
    st.set_page_config(page_title="Disease Predictor and Chatbot", layout="wide")
    st.title("🧠 Disease Predictor and Chatbot")

    # Load Gemini model once
    if "gemini_model" not in st.session_state:
        st.session_state.gemini_model = initialize_gemini()

    # Initialize session state
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "pending_response" not in st.session_state:
        st.session_state.pending_response = None

    # Handle new user input before rendering messages
    user_input = st.chat_input("Ask about symptoms, diseases, prevention...")
    if user_input:
        st.session_state.messages.append({"message": user_input, "is_user": True})
        st.session_state.pending_response = user_input

    # Process pending response from last run
    if st.session_state.pending_response:
        response = generate_response(st.session_state.gemini_model, st.session_state.pending_response)
        st.session_state.messages.append({"message": response, "is_user": False})
        st.session_state.pending_response = None
        st.experimental_rerun()  # Ensures message shows immediately after response

    # Home Section
    with st.expander("🏠 Home", expanded=True):
        st.subheader("Welcome!")
        st.write("This app predicts diseases based on symptoms and allows chat with a health-focused AI.")

    # About Section
    with st.expander("ℹ️ About"):
        st.subheader("About This App")
        st.write("Combines a trained disease prediction model with Gemini AI chatbot for health Q&A.")

    # Predict Section
    with st.expander("🔍 Predict Disease"):
        try:
            dataframe1 = pd.read_csv("training_data.csv")
            symptoms_list = list(dataframe1.columns)[:-2]
            disease_about = (
                pd.read_excel("dis_info.xlsx").set_index("disease").to_dict()["about"]
            )
            model = joblib.load("decision_tree.joblib")
        except Exception as e:
            st.error(f"Error loading files: {e}")
            return

        selected_symptoms = st.multiselect("Select Symptoms:", symptoms_list)
        if len(selected_symptoms) < 3:
            st.warning("Select at least 3 symptoms.")
        else:
            def predict_disease(symptoms):
                d = {s: 0 for s in symptoms_list}
                for s in symptoms:
                    d[s] = 1
                new_data = pd.DataFrame([d])
                probs = model.predict_proba(new_data)[0]
                top3 = probs.argsort()[-3:][::-1]
                return [(model.classes_[i], probs[i]) for i in top3]

            predictions = predict_disease(selected_symptoms)
            for disease, prob in predictions:
                img_path = f"static/{disease}.jpg".replace(" ", "")
                if os.path.exists(img_path):
                    st.image(img_path, caption=f"{disease} ({prob*100:.2f}%)", use_column_width=True)
                st.subheader(disease)
                st.write(disease_about.get(disease, "Information not available."))

    # Chatbot Section
    st.divider()
    st.subheader("💬 Ask the Health AI Assistant")

    # Render message history
    for i, msg in enumerate(st.session_state.messages):
        st_message(msg["message"], is_user=msg["is_user"], key=f"msg_{i}")

if __name__ == "__main__":
    main()
