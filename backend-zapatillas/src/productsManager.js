import fs from "fs/promises";
import path from "path";

const FILE_PATH = path.resolve("src/file_promesas/products.json");

export async function loadProducts() {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    else throw err;
  }
}

export async function saveProducts(products) {
  await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2));
}


