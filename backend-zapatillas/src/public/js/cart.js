document.addEventListener("DOMContentLoaded", () => {
  const cartCountEl = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Actualizar contador del carrito
  window.updateCartCount = (count) => {
    if (cartCountEl) cartCountEl.textContent = count;
  };

  // Finalizar compra
  checkoutBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${window.jwtToken}`,
        },
        credentials: "include",
      });

      const result = await res.json();

      if (result.success) {
        window.location.href = `/api/tickets/${result.ticket._id}`;
        if (cartCountEl) cartCountEl.textContent = 0;
      } else {
        alert(result.message || "Error al generar ticket");
      }
    } catch (err) {
      console.error(err);
      alert("Compra finalizada con éxito!!");
    }
  });

  // Eliminar producto del carrito (sin recargar la página)
const removeButtons = document.querySelectorAll(".remove-from-cart-btn");

removeButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const productId = button.dataset.id;

    try {
      const response = await fetch("/api/carts/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${window.jwtToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Producto eliminado del carrito");

        // Eliminar la card del DOM
        const productCard = button.closest(".cart-product-card");

        // Buscar cantidad dentro del texto (por ejemplo: "Cantidad: 2")
        let quantity = 1;
        const quantityParagraphs = productCard.querySelectorAll("p");
        for (const p of quantityParagraphs) {
          if (p.textContent.includes("Cantidad")) {
            const match = p.textContent.match(/\d+/);
            if (match) quantity = parseInt(match[0]);
            break;
          }
        }

        // Remover del DOM
        productCard.remove();

        // Actualizar contador del carrito
        const currentCount = parseInt(cartCountEl?.textContent) || 0;
        if (cartCountEl) {
          cartCountEl.textContent = Math.max(0, currentCount - quantity);
        }

        // Si no quedan productos, mostrar mensaje
        const remainingProducts = document.querySelectorAll(".cart-product-card").length;
        if (remainingProducts === 0) {
          document.getElementById("cart-container").innerHTML = "<p>Tu carrito está vacío.</p>";
        }

      } else {
        alert(result.message || "No se pudo eliminar el producto");
      }

    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  });
});
});
