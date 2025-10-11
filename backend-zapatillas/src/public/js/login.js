const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const obj = {};
  formData.forEach((value, key) => obj[key] = value);

  try {
    const res = await fetch("/api/sessions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj)
    });

    const data = await res.json();

    if (data.status === "success") {
      window.location.replace(data.redirect); // Redirige a productos
    } else {
      alert(data.message || "Login fallido");
    }
  } catch (err) {
    console.error("Error en login:", err);
    alert("Error del servidor");
  }
});
