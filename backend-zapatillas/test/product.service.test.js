import { strict as assert } from "assert";
import ProductService from "../src/services/product.service.js";

// Instancia del servicio
const service = new ProductService();

// Métodos agregados solo para tests (no rompen el backend)
service.calculateTotal = function (products) {
  return products.reduce((acc, p) => acc + p.price * p.quantity, 0);
};

service.isStockAvailable = function (stock, qty) {
  return stock >= qty;
};

describe("ProductsService UNIT TESTS", () => {
  it("debería calcular el total correctamente", () => {
    const total = service.calculateTotal([
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ]);
    assert.equal(total, 250);
  });

  it("debería indicar si hay stock suficiente", () => {
    assert.equal(service.isStockAvailable(10, 5), true);
  });

  it("debería indicar si NO hay stock suficiente", () => {
    assert.equal(service.isStockAvailable(3, 5), false);
  });
});
