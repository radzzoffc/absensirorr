// Load environment variables
fetch('.env')
    .then(response => response.text())
    .then(text => {
        const env = text.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            acc[key.trim()] = value.trim();
            return acc;
        }, {});
        init(env);
    });

function init(env) {
    const SHEET_ID = env.SHEET_ID;
    const API_KEY = env.API_KEY;

    document.getElementById('attendanceForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const date = document.getElementById('date').value;
        const gender = document.getElementById('gender').value;
        const photo = document.getElementById('photo').files[0];

        if (!photo) {
            alert("Silakan unggah foto!");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function () {
            const photoData = reader.result;

            const data = {
                values: [[name, date, gender, photoData]]
            };

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A1:append?valueInputOption=RAW&key=${API_KEY}`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    document.getElementById('status').textContent = "Absensi berhasil dikirim";
                } else {
                    const error = await response.json();
                    console.error(error);
                    document.getElementById('status').textContent = "Gagal mengirim absensi";
                }
            } catch (err) {
                console.error(err);
                document.getElementById('status').textContent = "Terjadi kesalahan";
            }
        };

        reader.readAsDataURL(photo);
    });
}
