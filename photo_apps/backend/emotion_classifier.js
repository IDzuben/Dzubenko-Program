const cv = require('opencv4nodejs');
const { loadModel } = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

// Завантаження моделі
let model;
(async () => {
    model = await loadModel('file://model_file_30epochs.h5');
})();

// Завантаження каскаду
const faceCascadePath = path.join(__dirname, 'resources', 'haarcascade_frontalface_default.xml');
const faceCascade = new cv.CascadeClassifier(faceCascadePath);

const labelsDict = {0: 'Angry', 1: 'Disgust', 2: 'Fear', 3: 'Happy', 4: 'Neutral', 5: 'Sad', 6: 'Surprise'};

async function classifyEmotion(imagePath) {
    const frame = cv.imread(imagePath);
    const gray = frame.bgrToGray();
    const faces = faceCascade.detectMultiScale(gray).objects;
    let result = [];

    if (faces.length) {
        faces.forEach(faceRect => {
            const face = gray.getRegion(faceRect);
            const resized = face.resize(48, 48);
            const normalized = resized.div(255.0);
            const reshaped = normalized.reshape(0, [1, 48, 48, 1]);
            const prediction = model.predict(reshaped);
            const label = prediction.argMax(1).dataSync()[0];
            result.push({
                rect: faceRect,
                emotion: labelsDict[label]
            });
        });
    }

    return result;
}

module.exports = { classifyEmotion };
