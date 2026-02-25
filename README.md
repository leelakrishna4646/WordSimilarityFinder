# Word Similarity Finder with Synonym Recommendation

A full-stack NLP application that uses **Gensim (Word2Vec/GloVe)** to find semantically similar words.

## Project Structure

This project is adapted for the Replit environment:

- **Frontend** (`client/`): A modern React application (Vite) with a clean, card-based UI.
- **Node.js Gateway** (`server/`): An Express server that handles API routing and proxies requests to the Python service.
- **NLP Service** (`python/`): A Flask microservice running the Gensim Word2Vec model.
- **Shared** (`shared/`): Type definitions shared between frontend and backend.

## Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion, Lucide Icons, Shadcn UI
- **Backend (Gateway):** Node.js, Express, TypeScript
- **NLP Service:** Python 3, Flask, Gensim (GloVe model)

## Setup & Running

1. **Install Dependencies:**
   - The environment automatically handles `npm install` for Node.js.
   - Python dependencies (`flask`, `gensim`, `flask-cors`) are installed via `packager_tool`.

2. **Run the Application:**
   - The application starts automatically with `npm run dev`.
   - This starts the Node.js server, which spawns the Python NLP service as a subprocess.
   - The Python service downloads the GloVe model (approx. 66MB) on the first run. Please wait 10-20 seconds for initialization.

## Usage

1. Open the application in the browser.
2. Enter a word (e.g., "king", "computer", "happy").
3. Click "Find Synonyms".
4. View the top 5 similar words and their similarity scores.

## Sample Input/Output

**Input:** "computer"

**Output:**
- software (0.85)
- technology (0.82)
- electronic (0.79)

