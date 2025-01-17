const correctPassword = "slwdigi";

const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("submit");
const errorMessage = document.getElementById("error-message");

submitButton.addEventListener("click", () => {
    const enteredPassword = passwordInput.value;

    if (enteredPassword === correctPassword) {
        window.location.href = "siliwangiteamdigi.html";
    } else {
        errorMessage.style.display = "block";
    }
});
