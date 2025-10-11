const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const obj = {};
  formData.forEach((value, key) => (obj[key] = value));

  try {
    const response = await fetch("/api/sessions/register", {
      method: "POST",
      body: JSON.stringify(obj),
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);           // mensaje de éxito
      window.location.replace(data.redirect); 
    } else {
      alert(data.message || "Error al registrarse");
    }
  } catch (error) {
    console.error("Error en fetch:", error);
    alert("Error en la conexión con el servidor");
  }
});
