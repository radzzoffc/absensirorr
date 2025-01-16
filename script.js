document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("attendanceForm");
    const captureBtn = document.getElementById("captureBtn");
    const photoInput = document.getElementById("photoData");
    const statusMessage = document.getElementById("statusMessage");

    // SheetDB API URL (Ganti dengan URL Anda)
    const SHEETDB_URL = "https://sheetdb.io/api/v1/gbwqck4ls6xpn";

    // Initialize webcam
    const camera = document.getElementById("camera");
    let videoStream;

    async function startCamera() {
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement("video");
            video.srcObject = videoStream;
            video.play();
            camera.appendChild(video);
            captureBtn.addEventListener("click", function () {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext("2d");
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                photoInput.value = canvas.toDataURL("image/png");
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
        const payload = {
            data: {
                name: formData.get("name"),
                date: formData.get("date"),
                gender: formData.get("gender"),
                photo: formData.get("photoData"),
            },
        };

        try {
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
