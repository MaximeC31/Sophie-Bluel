// Add an event listener to the login form for when it is submitted
document.getElementById("login-form").addEventListener("submit", async function (event) {
        try {
            event.preventDefault();

            // Get the values of the email and password input fields
            const emailInputValue = document.getElementById("email-input").value;
            const passwordInputValue =
                document.getElementById("password-input").value;

            // Make a POST request to the login API endpoint with the email and password values in the request body
            const response = await fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: emailInputValue,
                    password: passwordInputValue,
                }),
            });

            // If the response status is 200, save the token in local storage and redirect the user to the index page
            if (response.status === 200) {
                const loginData = await response.json();
                localStorage.setItem("token", loginData.token);
                window.location.href = "./index.html";
            }

            // Display errors in response.status
            else if (response.status === 401) {
                alert(response.statusText);
            } else if (response.status === 404) {
                alert(response.statusText);
            } else {
                alert("Reponse status undefined");
            }
        } catch (error) {
            // If function promise contains errors, show error threw an error in console
            console.error("Erreur : ", error);
        }
    });