from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from collections import defaultdict

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_stats(word_freqs):
    pairs = defaultdict(int)
    for word_tuple, freq in word_freqs.items():
        for i in range(len(word_tuple) - 1):
            pairs[word_tuple[i], word_tuple[i+1]] += freq
    return pairs

def merge_word_freqs(pair, word_freqs):
    new_word_freqs = {}
    bigram = pair
    replacement = "".join(pair)
    for word_tuple, freq in word_freqs.items():
        new_word = []
        i = 0
        while i < len(word_tuple):
            if i < len(word_tuple) - 1 and word_tuple[i] == bigram[0] and word_tuple[i+1] == bigram[1]:
                new_word.append(replacement)
                i += 2
            else:
                new_word.append(word_tuple[i])
                i += 1
        new_word_freqs[tuple(new_word)] = freq
    return new_word_freqs

@app.route('/api/train', methods=['POST'])
@app.route('/train', methods=['POST'])
def train():
    data = request.json
    corpus_text = data.get('corpus', '')
    vocab_size = data.get('vocab_size', 150)
    
    # Pre-processing
    words = corpus_text.split()
    # word_freqs maps (token, token, ...) -> count
    word_freqs = defaultdict(int)
    for word in words:
        char_tuple = tuple(list(word) + ['</w>'])
        word_freqs[char_tuple] += 1
        
    # Initial vocab
    vocab = set()
    for word_tuple in word_freqs:
        for token in word_tuple:
            vocab.add(token)
            
    history = []
    merges = []
    
    current_word_freqs = word_freqs
    
    # Initial history snapshot (Step 0)
    initial_pairs = get_stats(current_word_freqs)
    initial_sorted = sorted(initial_pairs.items(), key=lambda x: x[1], reverse=True)[:6]
    initial_formatted = [{"pair": f"{p[0]}+{p[1]}", "freq": f} for p, f in initial_sorted]

    history.append({
        "step": 0,
        "rule": None,
        "vocab_size": len(vocab),
        "token_count": sum(len(w) * f for w, f in current_word_freqs.items()),
        "top_pairs": initial_formatted,
        "corpus_snapshot": [{"word": list(w), "freq": f} for w, f in current_word_freqs.items()]
    })

    num_merges_target = max(0, vocab_size - len(vocab))
    for i in range(num_merges_target):
        pairs = get_stats(current_word_freqs)
        if not pairs:
            break
        
        best_pair = max(pairs, key=pairs.get)
        new_token = "".join(best_pair)
        merges.append(list(best_pair))
        
        current_word_freqs = merge_word_freqs(best_pair, current_word_freqs)
        vocab.add(new_token)
        
        # Top 6 pairs for chart
        sorted_pairs = sorted(pairs.items(), key=lambda x: x[1], reverse=True)[:6]
        formatted_pairs = [{"pair": f"{p[0]}+{p[1]}", "freq": f} for p, f in sorted_pairs]

        history.append({
            "step": i + 1,
            "rule": f"{best_pair[0]} + {best_pair[1]} → {new_token}",
            "best_pair": list(best_pair),
            "vocab_size": len(vocab),
            "token_count": sum(len(w) * f for w, f in current_word_freqs.items()),
            "top_pairs": formatted_pairs,
            "corpus_snapshot": [{"word": list(w), "freq": f} for w, f in current_word_freqs.items()]
        })

    return jsonify({
        "merges": merges,
        "vocab": sorted(list(vocab)),
        "history": history
    })

@app.route('/api/encode', methods=['POST'])
@app.route('/encode', methods=['POST'])
def encode():
    data = request.json
    text = data.get('text', '')
    merges = data.get('merges', []) # List of [a, b]
    
    words = text.split()
    encoded_output = []
    
    for word in words:
        # Initial tokens have age 0
        w_tokens = [{"t": c, "age": 0} for c in list(word) + ['</w>']]
        
        # Apply merges in order
        for idx, pair in enumerate(merges):
            a, b = pair
            # rule_age is 1-indexed to differentiate from base chars
            rule_age = idx + 1
            i = 0
            while i < len(w_tokens) - 1:
                if w_tokens[i]['t'] == a and w_tokens[i+1]['t'] == b:
                    w_tokens[i:i+2] = [{"t": a + b, "age": rule_age}]
                else:
                    i += 1
        encoded_output.extend(w_tokens)
        
    return jsonify({"tokens": encoded_output})

@app.route('/api/decode', methods=['POST'])
@app.route('/decode', methods=['POST'])
def decode():
    data = request.json
    tokens_data = data.get('tokens', [])
    # tokens_data can be list of strings or list of objects {"t": "...", "age": ...}
    tokens = []
    for item in tokens_data:
        if isinstance(item, dict):
            tokens.append(item.get('t', ''))
        else:
            tokens.append(item)
            
    decoded = "".join(tokens).replace('</w>', ' ')
    return jsonify({"text": decoded.strip()})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
