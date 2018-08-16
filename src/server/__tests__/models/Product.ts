import { Application } from "express";
import "jest";
import supertest = require("supertest");
import {
  createSampleImage,
  createSampleProduct,
  createSampleUser
} from "../../helpers/FakeFactory";
import Product from "../../models/Product";
import Server from "../../server";

let app: Application;
let request: supertest.SuperTest<supertest.Test>;

describe("Test suite for the Product model", () => {
  describe("Simple mongoose tests", () => {
    test("Can create, save and load a mongoose model", async () => {});
  });

  describe("REST API tests", () => {
    beforeEach(async () => {
      app = new Server().app;
      request = supertest(app);
    });

    afterEach(() => {
      app = undefined;
      request = undefined;
    });

    afterAll(async () => {
      // Doesn't work if not assigned to a variable
      const result = await Product.deleteMany({});
    });
    describe("Public setupRoutes", () => {
      test("GET /products gets a list of products", async () => {
        const product = createSampleProduct();
        product.frontImage = createSampleImage();
        product.images.push(createSampleImage());
        product.images.push(createSampleImage());

        await Promise.all([
          product.save(),
          product.frontImage.save(),
          product.images[0].save(),
          product.images[1].save()
        ]);

        const response = await request.get(`/api/v1/products/${product.id}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
        const prod = response.body;
        expect(prod._id).toBe(product.id);
        expect(prod.title).toBe(product.title);
        expect(prod.frontImage.path).toBe(product.frontImage.path);
        expect(prod.images.length).toBe(2);
      });

      test("GET /products/:id gets details of a product", async () => {
        const product = createSampleProduct();
        product.frontImage = createSampleImage();
        product.images.push(createSampleImage());
        product.images.push(createSampleImage());

        await Promise.all([
          product.save(),
          product.frontImage.save(),
          product.images[0].save(),
          product.images[1].save()
        ]);

        const response = await request.get("/api/v1/products");
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
      });
    });
    describe("Protected setupRoutes that require authentication", () => {
      let editorCookies: any;
      beforeAll(async () => {
        // Create a user, login, save cookies. Send cookies for protected setupRoutes
        const user = createSampleUser();
        const originalPassword = user.password;
        user.isEditor = true;
        await user.save();

        const authResponse = await request.post("/api/v1/auth/login").send({
          username: user.email,
          password: originalPassword
        });
        editorCookies = authResponse.header["set-cookie"];
      });

      test("GET /products gets a list of products", async () => {});
    });
    describe("Make sure protected setupRoutes are secured", () => {});
  });
});
