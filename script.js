document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("attendanceForm");
    const captureBtn = document.getElementById("captureBtn");
    const photoInput = document.getElementById("photoData");
    const statusMessage = document.getElementById("statusMessage");

    // SheetDB API URL
    const SHEETDB_URL = "https://sheetdb.io/api/v1/j40nw7zpqnydt";

    // Initialize webcam
    const camera = document.getElementById("camera");
    let videoStream;

    async function startCamera() {
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            const video = document.createElement("video");
            video.srcObject = videoStream;
            video.play();
            camera.appendChild(video);

            captureBtn.addEventListener("click", function () {
                const canvas = document.createElement("canvas");
                const maxSize = 300; // Maksimal ukuran gambar untuk kompresi
                const scale = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight);
                canvas.width = video.videoWidth * scale;
                canvas.height = video.videoHeight * scale;

                const context = canvas.getContext("2d");
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Kompresi gambar
                photoInput.value = canvas.toDataURL("image/jpeg", 0.5); // Kompresi dengan kualitas 50%
                videoStream.getTracks().forEach((track) => track.stop());
                camera.innerHTML = "<p>Foto berhasil diambil.</p>";
            });
        } catch (error) {
            alert("Kamera tidak dapat diakses. Periksa izin browser.");
        }
    }

    startCamera();

    // Submit form
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(form);

        try {
            // Payload untuk SheetDB
            const payload = {
                data: {
                    name: formData.get("name"),
                    date: formData.get("date"),
                    gender: formData.get("gender"),
                    photo: formData.get("photoData"),
                },
            };

            // Kirim data ke SheetDB
            const response = await fetch(SHEETDB_URL, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });
            const result = await response.json();

            if (result.created > 0) {
                statusMessage.textContent = "Data berhasil dikirim!";
                statusMessage.style.color = "green";
                form.reset();
            } else {
                throw new Error("Gagal menyimpan data.");
            }
        } catch (error) {
            statusMessage.textContent = `Gagal mengirim data: ${error.message}`;
            statusMessage.style.color = "red";
        }
    });
});
