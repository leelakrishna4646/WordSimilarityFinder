import logging
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import gensim.downloader as api

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

model = None

def load_model():
    global model
    try:
        # Use a path guaranteed to be writeable and persistent in Replit
        data_dir = "/home/runner/gensim-data"
        os.makedirs(data_dir, exist_ok=True)
        os.environ['GENSIM_DATA_DIR'] = data_dir
        
        logger.info(f"Loading model into {data_dir}...")
        model = api.load("glove-wiki-gigaword-50")
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")

@app.route('/similarity', methods=['POST'])
def similarity():
    if model is None:
        return jsonify({"message": "Model is still loading (approx. 60s total). Try again soon."}), 503

    try:
        data = request.json
        word = data.get('word', '').lower().strip()
        top_k = data.get('topK', 5)

        if word not in model:
            return jsonify({"message": f"Word '{word}' not found."}), 404

        similar_words = model.most_similar(word, topn=top_k)
        result = [{"word": w, "score": float(s)} for w, s in similar_words]

        return jsonify({"original": word, "similar": result})
    except Exception as e:
        return jsonify({"message": "Error processing request"}), 500

if __name__ == '__main__':
    load_model()
    # Bind to 0.0.0.0 to ensure it's accessible within the Replit container
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
