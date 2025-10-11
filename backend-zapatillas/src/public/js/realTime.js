const socket = io();
const container = document.getElementById("realtime-products");

// 🔹 Mostrar productos existentes desde Mongo al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/products");
    const { payload: products } = await res.json();

    if (!Array.isArray(products)) return console.error("❌ Error: la respuesta no contiene productos.");

    products.forEach((product) => {
      renderProductCard(product);
    });
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
  }
});

// 🔹 Renderizar una tarjeta de producto
function renderProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.setAttribute("data-id", product._id);

  card.innerHTML = `
    <img class="product-image" src="${product.image || ''}" alt="${product.title || ''}" />
    <h2 class="product-title">${product.title || ''}</h2>
    <p><strong>Precio:</strong> $${product.price ?? 0}</p>
    <p><strong>Stock:</strong> ${product.stock ?? 0}</p>
    <p><strong>Descripción:</strong> ${product.description || 'Sin descripción'}</p>
    <p><strong>Categoría:</strong> ${product.category || 'No especificada'}</p>
    <p><strong>ID:</strong> ${product._id}</p>
  `;

  container.appendChild(card);
}

// 🔹 Recibir nuevo producto desde el servidor
socket.on("nuevoProducto", (product) => {
  console.log("🆕 Nuevo producto recibido:", product);
  renderProductCard(product);
});

// 🔹 Eliminar producto desde el servidor
socket.on("productoEliminado", (id) => {
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  if (card) {
    card.remove();
    console.log(`🗑️ Producto ${id} eliminado del DOM`);
  }
});

// 🔹 Formulario crear producto
const formCreate = document.getElementById("form-create-product");
formCreate.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(formCreate);

  const newProduct = {
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    code: formData.get("code").trim(),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    category: formData.get("category").trim(),
    image: formData.get("image").trim() || '',
    thumbnails: [],
  };

  // Validación básica antes de enviar
  if (!newProduct.title || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
    alert("⚠️ Todos los campos son obligatorios excepto la imagen.");
    return;
  }

  // Enviar al servidor
  socket.emit("nuevoProducto", newProduct);
  formCreate.reset();
});

// 🔹 Formulario eliminar producto
const formDelete = document.getElementById("form-delete-product");
formDelete.addEventListener("submit", (e) => {
  e.preventDefault();
  const idToDelete = document.getElementById("delete-id").value.trim();

  if (!idToDelete) {
    alert("⚠️ Ingrese un ID válido");
    return;
  }

  socket.emit("eliminarProducto", idToDelete);
  formDelete.reset();
});

// 🔹 Manejo de errores del servidor
socket.on("errorProducto", (msg) => {
  alert("❌ Error: " + msg);
});
