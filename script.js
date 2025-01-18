document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("attendanceForm");
    const captureBtn = document.getElementById("captureBtn");
    const photoInput = document.getElementById("photoData");
    const photoError = document.getElementById("photoError");
    const captchaCodeElement = document.getElementById("captchaCode");
    const captchaInput = document.getElementById("captchaInput");
    const captchaError = document.getElementById("captchaError");
    const statusMessage = document.getElementById("statusMessage");
    const camera = document.getElementById("camera");
    let videoStream;

    const BACKEND_URL = "http://104.248.149.76:3000/attendance"; // Update with your Node.js backend URL

    function generateCaptcha() {
        const captchaCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        captchaCodeElement.textContent = captchaCode;
        return captchaCode;
    }
    let generatedCaptcha = generateCaptcha();

    async function startCamera() {
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            const video = document.createElement("video");
            video.srcObject = videoStream;
            video.play();
            camera.appendChild(video);

            captureBtn.addEventListener("click", function () {
                const canvas = document.createElement("canvas");
                const maxSize = 300;
                const scale = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight);
                canvas.width = video.videoWidth * scale;
                canvas.height = video.videoHeight * scale;

                const context = canvas.getContext("2d");
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                photoInput.value = canvas.toDataURL("image/jpeg", 0.5);
                videoStream.getTracks().forEach((track) => track.stop());
                camera.innerHTML = "<p>Foto berhasil diambil</p>";
                photoError.textContent = "";
            });
        } catch (error) {
            alert("Kamera tidak dapat diakses. Silahkan periksa izin browser");
        }
    }

    startCamera();

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(form);

        if (!photoInput.value) {
            photoError.textContent = "Upss Foto duluu";
            return;
        }

        if (captchaInput.value.toUpperCase() !== generatedCaptcha) {
            captchaError.textContent = "Captcha tidak sesuai";
            generateCaptcha();
            captchaInput.value = "";
            return;
        } else {
            captchaError.textContent = "";
        }

        try {
            const response = await fetch(BACKEND_URL + "/status");
            if (!response.ok) {
                throw new Error("Server sedang offline, coba lagi nanti.");
            }

            const payload = {
                name: formData.get("name"),
                date: formData.get("date"),
                gender: formData.get("gender"),
                photo: formData.get("photoData"),
            };

            const sendResponse = await fetch(BACKEND_URL, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });

            if (sendResponse.status === 429) {
                throw new Error("Anda hanya dapat mengirim data sekali setiap jam.");
            }

            const result = await sendResponse.json();

            if (result.success) {
                statusMessage.textContent = "Data Absensi sukses dikirimkan ke Database";
                statusMessage.style.color = "green";
                form.reset();
                generatedCaptcha = generateCaptcha();
            } else {
                throw new Error("Gagal menyimpan ke Database");
            }
        } catch (error) {
            statusMessage.textContent = `Gagal mengirim data: ${error.message}`;
            statusMessage.style.color = "red";
        }
    });
});

window.onload = function () {
    alert(
        "Isi data yg diperlukan, PERHATIKAN!:\nKlick kirim hanya 1× saja dan tunggu, jika gagal silahkan ulangi, jika berhasil jangan kirim data 2×\n\nPerhatikan petuntuk pengisian di bagian paling bawah juga!!"
    );
};
