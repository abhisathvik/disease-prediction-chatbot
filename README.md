### 🧠 Disease Predictor and AI Health Chatbot

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


# Run the project

- The project is already intialised with the Docker-based dev setup files.

- Clone the project using : git clone https://github.com/abhisathvik/disease-prediction-chatbot

🐳 Dev Container Setup


If you’re using VS Code with Docker:
	1.	Open project in VS Code.
	2.	Press F1 → Dev Containers: Reopen in Container.
	3.	The container will build and install dependencies automatically.
  4.  The web page is hosted automatically.

# 🔑 Gemini API Key Setup

The Gemini chatbot uses the Google Generative AI API.
	•	Open streamlit_app.py
	•	Replace the placeholder key:
     GEMINI_API_KEY = "YOUR_KEY_HERE"


# ✨ Credits
	
  •	Disease data adapted from public health sources.
	•	Gemini API via Google Generative AI
	•	Streamlit UI and deployment

# ✨ Contact
Built by Abhi Sathvik Reddy

GitHub: @abhisathvik

LinkedIn: https://www.linkedin.com/in/abhi-sathvik-reddy-aniga-a7b15b256/
