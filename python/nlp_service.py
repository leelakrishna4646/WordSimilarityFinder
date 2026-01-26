import logging
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.corpus import wordnet as wn
from nltk.corpus import wordnet_ic
import nltk
from collections import defaultdict

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

model_loaded = False
ic = None

def load_model():
    global model_loaded, ic
    try:
        logger.info("Loading language models...")
        nltk.download('wordnet', quiet=True)
        nltk.download('omw-1.4', quiet=True)
        nltk.download('wordnet_ic', quiet=True)
        ic = wordnet_ic.ic('ic-brown.dat')
        model_loaded = True
        logger.info("Models loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load models: {str(e)}")
        model_loaded = False

def get_similar_words_advanced(word, topk=5):
    """Get similar words using multiple WordNet similarity measures"""
    similar_scores = defaultdict(float)
    
    try:
        synsets = wn.synsets(word, lang='eng')
        
        if not synsets:
            return None
        
        # Strategy 1: Direct lemmas from synsets (synonyms)
        for synset in synsets:
            for lemma in synset.lemmas(lang='eng'):
                lemma_name = lemma.name().lower()
                if lemma_name != word.lower():
                    similar_scores[lemma_name] += 0.85
        
        # Strategy 2: Words from related synsets (hypernyms, hyponyms)
        for synset in synsets:
            # Hypernyms (more general terms)
            for hypernym in synset.hypernyms():
                for lemma in hypernym.lemmas(lang='eng'):
                    lemma_name = lemma.name().lower()
                    if lemma_name != word.lower() and lemma_name not in [l[0] for l in list(similar_scores.items())[:topk]]:
                        similar_scores[lemma_name] += 0.65
            
            # Hyponyms (more specific terms)
            for hyponym in synset.hyponyms():
                for lemma in hyponym.lemmas(lang='eng'):
                    lemma_name = lemma.name().lower()
                    if lemma_name != word.lower() and lemma_name not in [l[0] for l in list(similar_scores.items())[:topk]]:
                        similar_scores[lemma_name] += 0.60
        
        if not similar_scores:
            return None
        
        # Sort by score and return top K
        sorted_similar = sorted(similar_scores.items(), key=lambda x: x[1], reverse=True)[:topk]
        return sorted_similar
    except Exception as e:
        logger.error(f"Error getting similar words: {str(e)}")
        return None

@app.route('/similarity', methods=['POST'])
def similarity():
    if not model_loaded:
        return jsonify({"message": "Model is loading. Try again soon."}), 503

    try:
        data = request.json
        word = data.get('word', '').lower().strip()
        top_k = data.get('topK', 5)

        if not word:
            return jsonify({"message": "Word is required."}), 400

        similar_words = get_similar_words_advanced(word, top_k)
        
        if not similar_words:
            return jsonify({"message": f"Word '{word}' not found in dictionary. Try a different word."}), 404

        result = [{"word": w, "score": float(s)} for w, s in similar_words]
        return jsonify({"original": word, "similar": result})
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"message": "Error processing request"}), 500

if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
