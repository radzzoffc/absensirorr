// Define the correct password
const correctPassword = "12345";

// Get references to the DOM elements
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("submit");
const errorMessage = document.getElementById("error-message");

// Add an event listener to the submit button
submitButton.addEventListener("click", () => {
    const enteredPassword = passwordInput.value;

    if (enteredPassword === correctPassword) {
        // Redirect to the protected page if the password is correct
        window.location.href = "absenmonitoring.html";
    } else {
        // Show error message if the password is incorrect
        errorMessage.style.display = "block";
    }
});
