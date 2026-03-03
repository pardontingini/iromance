document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("age-form");
    const userAgeInput = document.getElementById("user-age");
    const partnerAgeInput = document.getElementById("partner-age");
    const resultsDiv = document.getElementById("results");
    const errorDiv = document.getElementById("error");
    const calculateButton = document.getElementById("calculate-button");

    if (!form) {
        console.error("Age form not found");
        return;
    }

    function setError(message) {
        if (!errorDiv) return;
        if (message) {
            errorDiv.textContent = message;
            errorDiv.classList.remove("hidden");
        } else {
            errorDiv.textContent = "";
            errorDiv.classList.add("hidden");
        }
    }

    function setResultsHtml(html) {
        if (!resultsDiv) return;
        if (html) {
            resultsDiv.innerHTML = html;
            resultsDiv.classList.remove("hidden");
        } else {
            resultsDiv.innerHTML = "";
            resultsDiv.classList.add("hidden");
        }
    }

    function updateButtonState() {
        if (!calculateButton) return;
        const hasUserAge = Boolean(userAgeInput && userAgeInput.value.trim());
        calculateButton.disabled = !hasUserAge;
    }

    updateButtonState();
    if (userAgeInput) userAgeInput.addEventListener("input", updateButtonState);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        setError("");
        setResultsHtml("");

        const userAge = userAgeInput.value.trim();
        const partnerAge = partnerAgeInput.value.trim();

        // Basic client-side validation
        const userAgeNumber = Number(userAge);
        if (!userAge || Number.isNaN(userAgeNumber)) {
            setError("Please enter a valid age (number).");
            return;
        }
        if (userAgeNumber < 18) {
            setError("Your age must be at least 18.");
            return;
        }

        let partnerAgeNumber = null;
        if (partnerAge) {
            partnerAgeNumber = Number(partnerAge);
            if (Number.isNaN(partnerAgeNumber)) {
                setError("Partner age must be a valid number.");
                return;
            }
            if (partnerAgeNumber < 18) {
                setError("Partner age must be at least 18.");
                return;
            }
        }
        // set loading state
         if (calculateButton) {
            calculateButton.disabled = true;
            calculateButton.textContent = "Calculating...";
         }
         //demo delay
         await new Promise((resolve) => setTimeout(resolve, 800));

        try {
            const response = await fetch("/api/age/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCsrfToken(),
                },
                body: JSON.stringify({
                    user_age: userAgeNumber,
                    partner_age: partnerAge ? partnerAgeNumber : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong.");
                return;
            }

            setResultsHtml(renderResultsHtml(data));
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        } finally {
            if (calculateButton) {
                calculateButton.textContent = "Calculate";
                updateButtonState();
            }
        }
    });

    function renderResultsHtml(data) {
        const {
            user_age,
            partner_age,
            user_min,
            user_max,
            partner_in_user_range,
            user_in_partner_range,
        } = data;

        let html = `
            <div class="results">
                <h2>Your recommended range</h2>
                <p>For age <strong>${user_age}</strong>, the recommended age range is
                <strong>${user_min}</strong> to <strong>${user_max}</strong>.</p>
        `;

        if (partner_age !== null && partner_age !== undefined) {
            html += `
                <h2>Compatibility check</h2>
                <p>
                    Partner age: <strong>${partner_age}</strong><br>
                    Partner is <strong>${partner_in_user_range ? "within" : "outside"}</strong>
                    your recommended range.
                </p>
                <p>
                    You are <strong>${user_in_partner_range ? "within" : "outside"}</strong>
                    their recommended range.
                </p>
            `;
        }

        html += "</div>";
        return html;
    }

    function getCsrfToken() {
        const name = "csrftoken";
        const cookies = document.cookie ? document.cookie.split(";") : [];
        for (let c of cookies) {
            c = c.trim();
            if (c.startsWith(name + "=")) {
                return decodeURIComponent(c.substring(name.length + 1));
            }
        }
        // fallback to hidden input if cookies not set
        const input = document.querySelector("input[name=csrfmiddlewaretoken]");
        return input ? input.value : "";
    }
});