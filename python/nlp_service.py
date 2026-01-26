import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import gensim.downloader as api
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variable for the model
model = None

def load_model():
    global model
    try:
        logger.info("Loading Word2Vec model (glove-wiki-gigaword-50)... this may take a moment.")
        # Load a small pre-trained model
        model = api.load("glove-wiki-gigaword-50")
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")

@app.route('/similarity', methods=['POST'])
def similarity():
    if not model:
        return jsonify({"message": "Model is still loading, please try again in a few seconds."}), 503

    try:
        data = request.json
        word = data.get('word', '').lower().strip()
        top_k = data.get('topK', 5)

        if not word:
            return jsonify({"message": "Word is required"}), 400

        if word not in model:
            return jsonify({"message": f"Word '{word}' not found in vocabulary"}), 404

        # Find most similar words
        similar_words = model.most_similar(word, topn=top_k)
        
        # Format response
        result = [
            {"word": w, "score": float(s)} 
            for w, s in similar_words
        ]

        return jsonify({
            "original": word,
            "similar": result
        })

    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    # Load model on startup
    load_model()
    # Run on port 5001 to avoid conflict with Node.js
    app.run(host='0.0.0.0', port=5001)
