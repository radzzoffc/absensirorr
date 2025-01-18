document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("attendanceForm");
    const captureBtn = document.getElementById("captureBtn");
    const photoInput = document.getElementById("photoData");
    const photoError = document.getElementById("photoError");
    const captchaCodeElement = document.getElementById("captchaCode");
    const captchaInput = document.getElementById("captchaInput");
    const captchaError = document.getElementById("captchaError");
    const statusMessage = document.getElementById("statusMessage");
    const SHEETDB_URL = "https://sheetdb.io/api/v1/j40nw7zpqnydt";
    const camera = document.getElementById("camera");
    let videoStream;

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

    async function getUserIP() {
        try {
            const response = await fetch("https://api.ipify.org?format=json");
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error("Gagal mendapatkan IP:", error);
            return null;
        }
    }

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

        // Dapatkan IP pengguna
        const userIP = await getUserIP();
        if (!userIP) {
            alert("Gagal mendapatkan IP perangkat. Coba lagi nanti.");
            return;
        }

        // Cek apakah sudah ada pengiriman dari IP yang sama dalam 1 jam terakhir
        const lastSubmitTime = localStorage.getItem(`lastSubmitTime_${userIP}`);
        const currentTime = new Date().getTime();
        
        if (lastSubmitTime && currentTime - lastSubmitTime < 3600000) { // 1 jam = 3600000ms
            alert("Anda sudah mengirim data sebelumnya. Mohon tunggu 1 jam sebelum mencoba lagi.");
            return;
        }

        try {
            const payload = {
                data: {
                    name: formData.get("name"),
                    date: formData.get("date"),
                    gender: formData.get("gender"),
                    photo: formData.get("photoData"),
                },
            };
            const response = await fetch(SHEETDB_URL, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });
            const result = await response.json();

            if (result.created > 0) {
                statusMessage.textContent = "Data Absensi sukses dikirimkan ke Database";
                statusMessage.style.color = "green";
                form.reset();
                generatedCaptcha = generateCaptcha(); 

                // Simpan waktu pengiriman data dan IP pengguna ke localStorage
                localStorage.setItem(`lastSubmitTime_${userIP}`, currentTime);
            } else {
                throw new Error("Gagal menyimpan ke Database");
            }
        } catch (error) {
            statusMessage.textContent = `Gagal mengirim data ke Database: ${error.message}`;
            statusMessage.style.color = "red";
        }
    });
});

window.onload = function() {
    alert("PERHATIKAN!:\nKlick kirim hanya 1× saja dan tunggu, jika gagal silahkan ulangi, jika berhasil jangan kirim data 2×\n\nPerhatikan petuntuk pengisian di bagian paling bawah juga!!");
};
