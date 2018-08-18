import { Application } from "express";
import "jest";
import supertest = require("supertest");
import {
  createSampleImage,
  createSampleProduct,
  createSampleUser
} from "../../helpers/FakeFactory";
import { IProductProps } from "../../interfaces/ProductDocument";
import Product from "../../models/Product";
import Server from "../../server";
import { IImageMetaData } from "../../interfaces/ImageDocument";

const app: Application = new Server().app;
let request: supertest.SuperTest<supertest.Test>;

let adminCredentials;
let editorCredentials;
let readonlyCredentials;

describe("Test suite for the Product model", () => {
  describe("REST API tests", () => {
    beforeAll(async () => {
      const admin = createSampleUser();
      admin.isAdmin = true;
      adminCredentials = { username: admin.email, password: admin.password };
      await admin.save();

      const editor = createSampleUser();
      editor.isEditor = true;
      editorCredentials = { username: editor.email, password: editor.password };
      await editor.save();

      const user = createSampleUser();
      readonlyCredentials = { username: user.email, password: user.password };
      await user.save();
    });
    beforeEach(async () => {
      request = supertest(app);
    });

    afterEach(() => {
      request = undefined;
    });

    afterAll(async () => {
      // Doesn't work if not assigned to a variable
      const result = await Product.deleteMany({});
    });
    describe("Public routes", () => {
      test("GET /products gets a list of products", async () => {
        const product = createSampleProduct();
        product.frontImage = createSampleImage();

        await Promise.all([product.save(), product.frontImage.save()]);

        const response = await request.get("/api/v1/products");
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
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

        const response = await request.get(`/api/v1/products/${product.id}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
        const prod = response.body;
        expect(prod._id).toBe(product.id);
        expect(prod.title).toBe(product.title);
        expect(prod.frontImage.path).toBe(product.frontImage.path);
        expect(prod.images.length).toBe(2);
        expect(prod.images[0].path).toBeTruthy();
      });
    });
    describe("Protected routes that require authentication", () => {
      beforeEach(async () => {
        // Create a user, login, save cookies. Send cookies for protected setupRoutes
        /*const user = createSampleUser();
        const originalPassword = user.password;
        user.isEditor = true;
        await user.save();

        const authResponse = await request.post("/api/v1/auth/login").send({
          username: user.email,
          password: originalPassword
        });
        editorCookies = authResponse.header["set-cookie"];*/
      });

      test("POST /products creates a new product, with images", async () => {
        const loginRes = await request
          .post("/api/v1/auth/login")
          .send(editorCredentials);
        expect(loginRes.status).toBe(200);
        const cookies = loginRes.header["set-cookie"];

        const props: IProductProps = {
          title: "Some title",
          price: 550,
          description: "a super long description",
          weight: "Much weight wow"
        };

        const files = [
          "src/server/__tests__/assets/sample1.jpg",
          "src/server/__tests__/assets/sample2.jpg",
          "src/server/__tests__/assets/sample3.jpg"
        ];
        const filesMetadata: IImageMetaData[] = [
          {
            height: 183,
            width: 275,
            title: "A little bird",
            size: 1337
          },
          {
            height: 194,
            width: 259,
            title: "Some hot air balloons",
            size: 13376
          },
          {
            height: 278,
            width: 181,
            title: "A pretty river",
            size: 9337
          }
        ];

        const req = request
          .post("/api/v1/products")
          .field("product", JSON.stringify(props))
          .field("imagesMetadata", JSON.stringify(filesMetadata))
          .field("thumbsMetadata", JSON.stringify(filesMetadata))
          .attach("images", files[0])
          .attach("images", files[1])
          .attach("images", files[2])
          .attach("thumbs", files[0])
          .attach("thumbs", files[1])
          .attach("thumbs", files[2]);
        req.cookies = cookies;
        const response = await req;

        expect(response.status).toBe(200);
        expect(response.body._id).toBeTruthy();
        const loaded = await Product.findById(response.body._id);

        expect(loaded.title).toBe(props.title);
        expect(loaded.price).toBe(props.description);
        expect(loaded.weight).toBe(props.weight);

        expect(loaded.frontImage.title).toBeTruthy();
        expect(loaded.frontImage.path).toBeTruthy();
        expect(loaded.images.length).toBe(2);
      });
    });
    describe("Make sure protected setupRoutes are secured", () => {});
  });
});
