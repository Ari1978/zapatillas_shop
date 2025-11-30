
# Backend Zapatillas 👟  
Proyecto backend desarrollado en Node.js + Express + MongoDB.

Incluye:
- Arquitectura en capas (controllers, services, repositories)
- CRUD de productos, usuarios, carritos y tickets
- DTOs de validación
- Swagger para documentación de APIs
- Logger profesional (Winston + Morgan)
- Autenticación con Passport (sessions)
- Test con Mocha + Supertest
- Imagen Docker lista para ejecutar
- docker-compose.yml para levantar backend + MongoDB

---

## Imagen Docker (Docker Hub)
https://hub.docker.com/r/hagui1978/backend-zapatillas

Podés ejecutar este backend directamente desde Docker Hub:

```bash
Subir imagen
docker push hagui1978/backend-zapatillas:1.0.0

Ejecutar imagen
docker run -p 9090:9090 hagui1978/backend-zapatillas:1.0.0
