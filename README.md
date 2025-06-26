# 🧠 Disease Predictor and AI Health Chatbot

This project combines a machine learning model for disease prediction with a Gemini-powered AI chatbot for general health advice. It features an interactive Streamlit-based frontend and is containerized using Docker for consistent development environments.

---

## 🚀 Features

- 🔍 **Disease Predictor**: Predicts likely diseases based on selected symptoms using a trained Decision Tree model.
- 💬 **AI Chatbot**: Ask questions about diseases, symptoms, and prevention powered by Google's Gemini 2.0 Flash.
- 🖼️ **Visual Support**: Displays relevant disease images and descriptions.
- 📦 **Streamlit UI**: Clean and interactive interface for both prediction and conversation.
- 🐳 **Dev Container Ready**: Includes `.devcontainer` setup for VS Code + Docker environments.

---

## 🗂️ Project Structure
├── streamlit_app.py              # Main Streamlit app
├── decision_tree.joblib          # Trained ML model
├── training_data.csv             # Training dataset
├── test_data.csv                 # Test dataset
├── dis_info.xlsx                 # Disease info file
├── static/                       # Contains disease images
├── requirements.txt              # Python dependencies
