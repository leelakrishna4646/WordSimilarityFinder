import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import gensim.downloader as api

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
        # Use a specific directory for data to ensure persistence in some environments
        data_dir = os.path.join(os.getcwd(), "gensim-data")
        os.makedirs(data_dir, exist_ok=True)
        os.environ['GENSIM_DATA_DIR'] = data_dir
        
        logger.info(f"Loading Word2Vec model (glove-wiki-gigaword-50) into {data_dir}...")
        # Load a small pre-trained model
        model = api.load("glove-wiki-gigaword-50")
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")

@app.route('/similarity', methods=['POST'])
def similarity():
    if model is None:
        return jsonify({"message": "NLP Model is still initializing. This takes about 30 seconds on first run. Please try again shortly."}), 503

    try:
        data = request.json
        if not data:
            return jsonify({"message": "Invalid JSON"}), 400
            
        word = data.get('word', '').lower().strip()
        top_k = data.get('topK', 5)

        if not word:
            return jsonify({"message": "Please enter a word to find similarities for."}), 400

        if word not in model:
            return jsonify({"message": f"The word '{word}' was not found in our vocabulary. Try a more common word."}), 404

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
        return jsonify({"message": "An error occurred while processing the similarity request."}), 500

if __name__ == '__main__':
    # Load model on startup
    load_model()
    # Run on port 5001 to avoid conflict with Node.js
    # Bind to 127.0.0.1 for security as it's only called by the Node gateway
    app.run(host='127.0.0.1', port=5001)
