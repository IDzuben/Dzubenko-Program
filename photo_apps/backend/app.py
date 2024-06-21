from flask import Flask, request, jsonify, send_from_directory
import cv2
import numpy as np
from keras.models import load_model
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Завантаження моделі
model = load_model('model_file_30epochs.h5', compile=False)

# Завантаження каскаду для виявлення облич
face_cascade = cv2.CascadeClassifier('resources/haarcascade_frontalface_default.xml')

# Довідник міток
labels_dict = {0: 'Angry', 1: 'Disgust', 2: 'Fear', 3: 'Happy', 4: 'Neutral', 5: 'Sad', 6: 'Surprise'}

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def classify_emotion(img_path):
    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    result = []

    for (x, y, w, h) in faces:
        face_img = gray[y:y+h, x:x+w]
        resized = cv2.resize(face_img, (48, 48))
        normalized = resized / 255.0
        reshaped = np.reshape(normalized, (1, 48, 48, 1))
        prediction = model.predict(reshaped)
        label = np.argmax(prediction)
        result.append({
            'rect': (int(x), int(y), int(w), int(h)),
            'emotion': labels_dict[label]
        })
    return result

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        result = classify_emotion(file_path)
        return jsonify(result)

@app.route('/classify', methods=['POST'])
def classify_image():
    img_data = request.files['image']
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(img_data.filename))
    img_data.save(img_path)
    result = classify_emotion(img_path)
    return jsonify(result)

@app.route('/uploads/<filename>')
def send_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0', port=5000)
