# ZenTuner AI 🎸

> A minimalist, professional guitar tuner powered by the Web Audio API and Google Gemini AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.5-8E75B2.svg)

ZenTuner AI goes beyond simple pitch detection. It combines a high-precision **Autocorrelation algorithm** for accurate real-time tuning with an **AI Guitar Technician** powered by Google's Gemini API to help you solve instrument setup issues on the fly.

## ✨ Features

- **High-Precision Tuning**: Uses raw Web Audio API data and autocorrelation logic (better than FFT for instrument pitch) to detect frequency and cents deviation.
- **Visual Feedback**: Beautiful D3.js-based gauge with smooth needle transitions.
- **String Detection**: Automatically highlights the closest standard guitar string (E-A-D-G-B-E).
- **AI Guitar Tech**: Ask questions about intonation, buzzing, or string changes and get instant, concise advice from Gemini AI.
- **Responsive Design**: Built with Tailwind CSS for a mobile-first, app-like experience.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Google Gemini API Key**: Get one for free at [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/zentuner-ai.git
    cd zentuner-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory (or rename `.env.example`).
    ```bash
    # .env
    API_KEY=your_actual_api_key_here
    ```
    *Note: In this demo architecture, the key is exposed to the client build. For production apps, use a proxy server.*

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🐳 Docker Deployment

You can containerize the application easily.

1.  **Build the Image**
    ```bash
    docker build -t zentuner .
    ```

2.  **Run the Container**
    ```bash
    docker run -p 8080:80 zentuner
    ```
    Visit [http://localhost:8080](http://localhost:8080).

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Audio Processing**: Native Web Audio API (AnalyserNode)
- **Visualization**: D3.js
- **AI Integration**: Google GenAI SDK (`@google/genai`)

## 📂 Project Structure

```
.
├── components/        # React UI Components (TunerMeter, StringSelector)
├── services/          # Logic (Audio Processing, Gemini API)
├── constants.ts       # Musical notes and frequency data
├── types.ts           # TypeScript interfaces
├── App.tsx            # Main application layout
├── index.tsx          # Entry point
├── index.html         # HTML template
└── Dockerfile         # Container configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
