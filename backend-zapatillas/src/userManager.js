const path = require("path");
const fs = require("fs").promises;

class UserManager {
  constructor() {
    this.filePath = path.join(__dirname, "Productos.json");
  }

  // Crear producto
  async crearProducto(data) {
    let productos = [];
    try {
      // Leer el archivo
      const result = await fs.readFile(this.filePath, "utf-8");
      if (result) {
        productos = JSON.parse(result);
      }
    } catch (error) {
      console.log("No se pudo leer el archivo, se creará uno nuevo.");
    }

    try {
      // Generar un ID al nuevo producto
      const id = productos.length + 1;

      // Añadimos el id al nuevo producto
      data.id = id;

      // Añadir el nuevo producto al array
      productos.push(data);

      // Guardar el archivo actualizado
      await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2), "utf-8");

      console.log("Producto dado de alta!!..");
    } catch (error) {
      console.log("Error al crear el producto", error);
    }
  }
}

module.exports = UserManager;

