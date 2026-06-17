document.getElementById('privacyForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let firstName = document.getElementById('firstName').value.trim();
    let lastName = document.getElementById('lastName').value.trim();
    let email = document.getElementById('email').value.trim();
    let requestType = document.getElementById('requestType').value;
    let details = document.getElementById('requestDetails').value.trim();
    let agreement = document.getElementById('agreement').checked;

    if (!firstName || !lastName || !email || !requestType || !details || !agreement) {
        alert("Please fill out all required fields.");
        return;
    }

    alert("Form submitted successfully!");
});