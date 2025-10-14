const container = document.getElementById("product-list");

fetch('/api/products')
  .then(response => response.json())
  .then(data => {
    
    const products = data.docs || [];
    
    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.image || ''}" alt="${product.name || ''}" />
        <h2>${product.name || product.title || ''}</h2>
        <p>Precio: $${product.price || ''}</p>
        <p>Stock: ${product.stock || ''}</p>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => console.error("Error cargando productos:", err));
