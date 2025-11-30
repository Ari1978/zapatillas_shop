import app from "../src/app.js";
import supertest from "supertest";
import { expect } from "chai";

const requester = supertest(app);

describe("Adoption API", () => {

  it("GET /api/adoption debería responder 200 y un array dentro de data", async () => {
    const res = await requester.get("/api/adoption");

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("object");   // el body es un objeto
    expect(res.body.data).to.be.an("array"); // el array está en data
  });

});
