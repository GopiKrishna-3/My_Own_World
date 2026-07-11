# My Own World (Dev Connect)

Welcome to **My Own World**! This is a full-stack social networking and blogging platform built to connect users through posts, profiles, and friendships. 

## 🚀 Overview

**My Own World** provides a personalized space where users can express themselves by creating and sharing posts. Beyond just a blogging platform, it features a comprehensive social system allowing users to search for peers, manage a detailed personal profile, and build a friends network through a Facebook/Instagram-style friend request system.

## ✨ Key Features

* **User Authentication:** Secure sign-up, login, and logout capabilities using JSON Web Tokens (JWT).
* **Profile Management:** Users can customize their personal profiles by adding details such as their bio, phone number, and gender. The profile page features distinct *View* and *Edit* modes for a seamless user experience.
* **Blogging / Posts:**
  * View a feed of all posts created by the community.
  * Create new posts with titles and content.
  * Dedicated "My Posts" section to manage your own content.
* **Social Connections (Friends System):**
  * **Find Friends:** Search through registered users to find people you know.
  * **Friend Requests:** Send, accept, or reject incoming friend requests.
  * **Friends List:** Maintain a personalized list of connections.

## 🛠️ Technology Stack

This project is built using a modern decoupled architecture, separating the frontend and backend to ensure scalability and ease of development.

### Frontend
* **React.js** (via Vite): Fast, modern UI development.
* **React Router DOM:** For seamless client-side navigation.
* **Bootstrap:** Used for rapid, responsive UI styling and layout.

### Backend
* **Django:** Robust Python web framework.
* **Django REST Framework (DRF):** For building powerful and scalable RESTful APIs.
* **Simple JWT:** Handles secure authentication tokens.
* **SQLite:** Default lightweight database for easy setup and testing (can be easily migrated to PostgreSQL/MySQL for production).

## 📂 Project Structure

```text
├── backend/                # Django backend application
│   ├── backend/            # Main project settings and routing
│   ├── posts/              # Django app for handling user posts
│   └── users/              # Django app for authentication, profiles, and friendships
│
└── frontend/               # React frontend application
    ├── src/
    │   ├── assets/         # Images, CSS, and static assets
    │   ├── components/     # React components (Home, Profile, Friends, etc.)
    │   ├── App.jsx         # Main React router setup
    │   └── main.jsx        # React entry point
    └── vite.config.js      # Vite configuration
```

## 🏃‍♂️ Getting Started

To run this project locally, you will need to start both the backend server and the frontend development server.

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
   ```
3. Install dependencies (make sure your requirements are installed):
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
   ```
4. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Start the Django server:
   ```bash
   python manage.py runserver
   ```
   *The backend will run on http://127.0.0.1:8000*

### 2. Frontend Setup
1. Open a second terminal and navigate to the `frontend` directory.
2. Install the necessary Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on http://localhost:5173*

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project, please fork the repository and submit a pull request with your changes. Be sure to document any new features added.
