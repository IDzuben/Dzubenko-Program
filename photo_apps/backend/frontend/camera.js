navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error("Error accessing camera: " + err);
    });

document.getElementById('snap').addEventListener('click', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'photo.png');

        fetch('/classify', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            data.forEach(face => {
                context.strokeStyle = 'red';
                context.lineWidth = 2;
                context.strokeRect(face.rect[0], face.rect[1], face.rect[2], face.rect[3]);
                context.fillStyle = 'red';
                context.font = '16px Arial';
                context.fillText(face.emotion, face.rect[0], face.rect[1] - 10);
            });
        })
        .catch(error => {
            console.error('Error uploading photo:', error);
        });
    }, 'image/png');
});
