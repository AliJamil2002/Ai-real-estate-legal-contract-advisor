This is a great, detailed draft! Since your project is an **AI Real Estate Legal Contract Advisor**, having a professional English README is essential for your **May 18, 2026** defense.

Here is the English version of your Frontend README, optimized for a professional GitHub profile:

---

# AI Legal Advisor - Mobile Frontend

## Overview
This is the **React Native (Expo)** frontend for the AI Legal Advisor system. It provides a comprehensive mobile experience for users to interact with legal contracts through automated analysis, AI-driven chat, and voice commands.

## Key Features
*   **Authentication**: Secure User Login and Registration modules.
*   **Smart Dashboard**: Overview of recent contracts with quick-action shortcuts.
*   **AI Legal Chat**: Context-aware chat interface for discussing specific contract clauses.
*   **Voice Assistant**: Integrated speech-to-text functionality for hands-free legal queries.
*   **Document Management**: Upload system supporting PDF and image formats for legal documents.
*   **Contract Insights**: Detailed summary screens highlighting legal risks and guidance.

## Project Structure
*   **`App.js`**: Application entry point.
*   **`src/navigation/`**: Contains `Appnavigater.js` for managing the React Navigation stack.
*   **`src/screen/`**: Core UI components including:
    *   `login.js` & `register.js`
    *   `dashboard.js` & `upload.js`
    *   `summary.js` & `chat.js`
    *   `voice.js` & `help.js`
*   **`src/services/`**: 
    *   `api.js`: Backend API integration using Axios.
    *   `auth.js`: Authentication service logic.
*   **`assets/`**: Images, icons, and static assets.

## Getting Started
 npx expo start

### Installation
1.  Navigate to the directory:
    ```bash
    cd myapp
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure Expo CLI is installed globally:
    ```bash
    npm install -g expo-cli
    ```

### API Configuration
The frontend communicates with the FastAPI backend via `src/services/api.js`.
*   **Development**: Set `API_BASE_URL` to your local machine's IP (e.g., `[http://192.168.](http://192.168.)x.x:8000`) for testing on physical devices.
*   **Production**: Update this to your **Render** deployment URL once the backend is live.

### Execution
Start the Expo development server:
```bash
npm start
```

## Technical Requirements
*   **Backend Connectivity**: The FastAPI backend must be operational for authentication and AI features to function.
*   **Core Dependencies**:
    *   `expo` & `react-native`
    *   `@react-navigation/native` (Navigation)
    *   `axios` (API Requests)
    *   `expo-av` (Audio for Voice Assistant)
    *   `expo-document-picker` (File Uploads)

## Integration Endpoints
The app utilizes the following backend services:
*   `POST /auth/login`
*   `POST /auth/register`
*   `GET /contract/list`
*   `POST /contract/upload`
*   `POST /contract/query` (RAG-powered chat)




