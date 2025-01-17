 function decodeBase64() {
            const base64Input = document.getElementById("base64Input").value.trim();
            const outputDiv = document.getElementById("output");

            if (!base64Input) {
                alert("Masukkan kode Base64");
                return;
            }

            outputDiv.innerHTML = "";

            const base64Regex = /^data:image\/(png|jpeg|gif|bmp);base64,/;
            if (!base64Regex.test(base64Input)) {
                alert("Kode Base64 tidak valid atau jenis gambar tidak didukung. Pastikan menggunakan format data:image/jpeg;base64, atau data:image/png;base64,.");
                return;
            }

            const img = document.createElement("img");
            img.src = base64Input;
            img.alt = "Data Result";

            outputDiv.appendChild(img);
        }
