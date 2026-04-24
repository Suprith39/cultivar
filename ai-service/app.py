from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

model = tf.keras.applications.MobileNetV2(weights='imagenet')

AGRICULTURAL_KEYWORDS = [
    'banana', 'strawberry', 'orange', 'lemon', 'fig', 'pineapple', 'pomegranate',
    'broccoli', 'cauliflower', 'zucchini', 'spaghetti_squash', 'acorn_squash',
    'butternut_squash', 'cucumber', 'artichoke', 'bell_pepper', 'mushroom',
    'corn', 'ear', 'head_cabbage', 'rapeseed', 'hay', 'harvester',
    'thresher', 'plow', 'shovel', 'bucket', 'pot', 'greenhouse',
    'tomato', 'apple', 'granny_smith', 'jackfruit', 'custard_apple',
    'cardoon', 'daisy', 'sunflower', 'wheat', 'rice', 'paddy',
]

def is_agricultural(label):
    label_lower = label.lower().replace('_', ' ')
    return any(kw in label_lower for kw in AGRICULTURAL_KEYWORDS)

def preprocess_image(img):
    img = img.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        img = None
        if request.is_json:
            data = request.get_json()
            b64 = data.get('image', '')
            if ',' in b64:
                b64 = b64.split(',')[1]
            img_bytes = base64.b64decode(b64)
            img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        elif 'image' in request.files:
            file = request.files['image']
            img = Image.open(file.stream).convert('RGB')

        if img is None:
            return jsonify({'error': 'No image provided'}), 400

        processed = preprocess_image(img)
        preds = model.predict(processed)
        decoded = tf.keras.applications.mobilenet_v2.decode_predictions(preds, top=5)[0]

        top_predictions = [
            {'label': label, 'score': round(float(score) * 100, 2)}
            for (_, label, score) in decoded
        ]

        top_label = decoded[0][1]
        confidence = round(float(decoded[0][2]) * 100, 2)

        return jsonify({
            'detectedSpecies': top_label.replace('_', ' ').title(),
            'confidenceScore': confidence,
            'isAgricultural': is_agricultural(top_label),
            'topPredictions': top_predictions,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(port=5001, debug=False)
