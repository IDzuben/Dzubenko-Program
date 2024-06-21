document.addEventListener('DOMContentLoaded', () => {
    fetch('/posts')
        .then(response => response.json())
        .then(data => {
            const photoContainer = document.getElementById('photo-container');
            data.forEach(post => {
                const div = document.createElement('div');
                div.className = 'photo-item card p-2 m-2';

                const img = document.createElement('img');
                img.src = post.image_url;
                img.alt = `Photo taken on ${post.date_time}`;
                img.className = 'card-img-top';
                img.addEventListener('click', () => {
                    const mlResult = JSON.parse(post.ml_result);
                    const emotions = mlResult.map(e => e.emotion).join(', ');
                    alert(`Emotions detected: ${emotions}`);
                });

                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';

                const nameLabel = document.createElement('input');
                nameLabel.type = 'text';
                nameLabel.value = post.image_url.split('/').pop();
                nameLabel.className = 'form-control mb-2';
                nameLabel.addEventListener('change', () => renamePhoto(post.id, nameLabel.value));

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'btn btn-danger';
                deleteButton.addEventListener('click', () => deletePost(post.id));

                cardBody.appendChild(nameLabel);
                cardBody.appendChild(deleteButton);
                div.appendChild(img);
                div.appendChild(cardBody);
                photoContainer.appendChild(div);
            });
        });

    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');

    uploadBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('date_time', new Date().toISOString());
            formData.append('ml_result', '{}');

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert('Photo uploaded successfully');
                window.location.reload();
            })
            .catch(error => {
                console.error('Error uploading photo:', error);
            });
        }
    });
});

function renamePhoto(id, newName) {
    fetch(`/posts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newName })
    })
    .then(response => response.json())
    .then(data => {
        alert('Photo renamed successfully');
        window.location.reload();
    })
    .catch(error => {
        console.error('Error renaming photo:', error);
    });
}

function deletePost(id) {
    fetch(`/posts/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert('Post deleted successfully');
        window.location.reload();
    })
    .catch(error => {
        console.error('Error deleting post:', error);
    });
}
