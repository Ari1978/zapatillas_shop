document.addEventListener("DOMContentLoaded", () => {
  const cartCountEl = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkoutBtn");

  window.updateCartCount = count => {
    if(cartCountEl) cartCountEl.textContent = count;
  };

  checkoutBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${window.jwtToken}`
        },
        credentials: "include"
      });
      const result = await res.json();
      if(result.success){
        window.location.href = `/api/tickets/${result.ticket._id}`;
        cartCountEl.textContent = 0;
      } else {
        alert(result.message || "Error al generar ticket");
      }
    } catch(err){
      console.error(err);
      alert("Compra finalizada con exito!!");
    }
  });
});
