const container = document.getElementById("realtime-products");
const userLogged = !!document.body.dataset.user;
const socket = io();


// Renderizar un producto individual
function renderProduct(product) {
  const card = document.createElement("div");
  card.className = "col-md-4 mb-3 product-card";
  card.dataset.id = product._id;

  card.innerHTML = `
    <div class="card h-100 shadow-sm">
      <img src="${product.image || ''}" class="card-img-top" alt="${product.title || ''}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.title || ''}</h5>
        <p class="card-text text-truncate">${product.description || ''}</p>
        <p class="card-text"><strong>Precio:</strong> $${product.price || 0}</p>
        <p class="card-text"><strong>Stock:</strong> ${product.stock || 0}</p>
        <p class="card-text"><strong>Categoría:</strong> ${product.category || ''}</p>
        ${userLogged ? `
          <div class="d-flex align-items-center mb-2 mt-auto">
            <label for="quantity-${product._id}" class="me-2 fw-bold">Cantidad:</label>
            <input type="number" id="quantity-${product._id}" class="form-control quantity-input"
                   style="width: 70px;" min="1" max="${product.stock || 1}" value="1">
          </div>
          <button class="btn btn-primary add-to-cart-btn mt-2" data-id="${product._id}">
            Agregar al carrito
          </button>` : ''}
      </div>
    </div>
  `;
  container.appendChild(card);
}

// Renderizar todos los productos
function renderProducts(products) {
  container.innerHTML = "";
  if (!products || products.length === 0) {
    container.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }
  products.forEach(renderProduct);
}

// Agregar producto al carrito
async function addToCart(productId) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  const quantity = parseInt(quantityInput?.value || 1);

  if (isNaN(quantity) || quantity <= 0) {
    return alert("Por favor, ingresa una cantidad válida.");
  }

  try {
    const response = await fetch("/api/carts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity })
    });

    const data = await response.json();

    if (data.status === "Success") {
      alert("✅ Producto agregado al carrito correctamente");
    } else if (response.status === 401) {
      alert("⚠️ Debes iniciar sesión para agregar productos al carrito");
      window.location.href = "/login";
    } else {
      alert("❌ Error: " + data.message);
    }
  } catch (err) {
    console.error("Error al agregar al carrito:", err);
    alert("Error al agregar el producto al carrito");
  }
}


// Delegación de eventos para botones
container.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const productId = e.target.dataset.id;
    addToCart(productId);
  }
});


// Inicializar botón de compra
const purchaseBtn = document.getElementById("purchaseBtn");
purchaseBtn?.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/tickets/purchase", {
      method: "POST",
      credentials: "include"
    });
    const data = await response.json();

    if (data.status === "Success") {
      alert("🧾 Compra realizada con éxito. Ticket generado.");
      window.location.reload();
    } else {
      alert("⚠️ " + data.message);
    }
  } catch (err) {
    console.error("Error al realizar la compra:", err);
    alert("Error al procesar la compra");
  }
});


// Socket.io: actualizar productos en tiempo real
socket.on("productsUpdated", (products) => {
  renderProducts(products);
});
