import logging
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import gensim.downloader as api

# Configure logging to stdout for Replit logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variable for the model
model = None

def load_model():
    global model
    try:
        # Replit usually stores data in /home/runner/
        data_dir = os.path.join(os.path.expanduser("~"), "gensim-data")
        os.makedirs(data_dir, exist_ok=True)
        os.environ['GENSIM_DATA_DIR'] = data_dir
        
        logger.info(f"Loading Word2Vec model (glove-wiki-gigaword-50) from {data_dir}...")
        # Load a small pre-trained model (approx 66MB)
        # This will download if not present. In published apps, this happens on first startup.
        model = api.load("glove-wiki-gigaword-50")
        logger.info("Model loaded successfully and ready for requests!")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")

@app.route('/similarity', methods=['POST'])
def similarity():
    if model is None:
        logger.warning("Request received but model is not yet loaded.")
        return jsonify({
            "message": "NLP Model is still downloading/loading (~66MB). This takes about 30-60 seconds on first run after publishing. Please wait a bit longer."
        }), 503

    try:
        data = request.json
        if not data:
            return jsonify({"message": "Invalid JSON"}), 400
            
        word = data.get('word', '').lower().strip()
        top_k = data.get('topK', 5)

        if not word:
            return jsonify({"message": "Please enter a word."}), 400

        if word not in model:
            logger.info(f"Word not in vocabulary: {word}")
            return jsonify({"message": f"Sorry, '{word}' is not in our vocabulary. Try 'computer', 'science', or 'happy'."}), 404

        # Find most similar words
        similar_words = model.most_similar(word, topn=top_k)
        
        # Format response
        result = [
            {"word": w, "score": float(s)} 
            for w, s in similar_words
        ]

        logger.info(f"Successfully found similarities for: {word}")
        return jsonify({
            "original": word,
            "similar": result
        })

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({"message": "An error occurred while processing the request."}), 500

if __name__ == '__main__':
    # Load model on startup
    load_model()
    # Bind to 127.0.0.1 for local communication between Node and Python
    # Use port 5001
    app.run(host='127.0.0.1', port=5001, debug=False, use_reloader=False)
