
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Backend Zapatillas - API",
      version: "1.0.0",
      description: "Documentación de la API del proyecto Backend Zapatillas",
    },
    servers: [
      {
        url: "http://localhost:9090",
        description: "Servidor local",
      },
    ],
  },
  apis: ["./src/routers/*.js"], 
};

const swaggerSpecs = swaggerJSDoc(swaggerOptions);

export { swaggerUi, swaggerSpecs };
