const contactForm = document.getElementById("contactForm");
const phoneInput = document.getElementById("phone");
const successMessage = document.getElementById("successMessage");

// Allow only numbers in phone field
phoneInput.addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "");

    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
    }

});


// Form validation
contactForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = phoneInput.value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();


    // Name validation
    if (name.length < 3) {
        alert("Please enter at least 3 characters for your name.");
        return;
    }


    // Name should contain only letters and spaces
    if (!/^[A-Za-z ]+$/.test(name)) {
        alert("Name can contain only letters and spaces.");
        return;
    }


    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Phone validation
    if (phone.length !== 10) {
        alert("Phone number must contain exactly 10 digits.");
        phoneInput.focus();
        return;
    }

    if (!/^(96|97|98)[0-9]{8}$/.test(phone)) {
        alert("Invalid phone number. It must start with 96, 97, or 98.");
        phoneInput.focus();
        return;
    }


    // Subject validation
    if (subject.length < 3) {
        alert("Please enter a valid subject.");
        return;
    }


    // Message validation
    if (message.length < 10) {
        alert("Message must contain at least 10 characters.");
        return;
    }


    // SUCCESS MESSAGE
    successMessage.style.display = "block";

    successMessage.textContent =
        "\u2713 Your message has been sent successfully!";


    // Clear form
    contactForm.reset();


    // Hide success message after 5 seconds
    setTimeout(function () {

        successMessage.style.display = "none";

    }, 5000);

});
