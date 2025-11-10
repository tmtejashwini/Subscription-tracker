const SERVER_URL = "http://localhost:5500";

/* ---------------- Signup ---------------- */
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${SERVER_URL}/api/v1/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        document.getElementById("signupMessage").innerText = "Signup successful! Please login.";
      } else {
        document.getElementById("signupMessage").innerText = data.message || "Signup failed.";
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  });
}

/* ---------------- Login ---------------- */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${SERVER_URL}/api/v1/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userId", data.data.user._id);
        window.location.href = "dashboard.html";
      } else {
        document.getElementById("loginMessage").innerText = data.message || "Login failed.";
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  });
}

/* ---------------- Dashboard ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const subscriptionForm = document.getElementById("subscriptionForm");

  if (subscriptionForm) {
    subscriptionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Submitting subscription...");

      const name = document.getElementById("subName").value;
      const price = document.getElementById("subPrice").value;
      const currency = document.getElementById("subCurrency").value;
      const frequency = document.getElementById("subFrequency").value;
      const category = document.getElementById("subCategory").value;
      const paymentMethod = document.getElementById("subPaymentMethod").value;
      const startDate = document.getElementById("subStartDate").value;
      const status = document.getElementById("subStatus").value;

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      try {
        const res = await fetch(`${SERVER_URL}/api/v1/subscriptions`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            price,
            currency,
            frequency,
            category,
            paymentMethod,
            startDate,
            status,
            user: userId
          })
        });

        const data = await res.json();
        console.log("Response:", data);

        if (res.ok) {
          alert("✅ Subscription added successfully!", true);
          subscriptionForm.reset();
        } else {
          alert("❌ Failed to add subscription", false);
        }
      } catch (err) {
        console.error("Add subscription error:", err);
        alert("❌ Failed to add subscription", false);
      }
    });
  }
});

/* ---------------- Logout ---------------- */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "index.html";
}


