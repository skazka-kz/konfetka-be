import * as del from "del";
import { Application } from "express";
import "jest";
import * as makeDir from "make-dir";
import supertest = require("supertest");
import {
  createSampleImage,
  createSampleProduct,
  createSampleUser
} from "../../helpers/FakeFactory";
import { IImageMetaData } from "../../interfaces/ImageDocument";
import { IProductProps } from "../../interfaces/ProductDocument";
import Image from "../../models/Image";
import Product from "../../models/Product";
import User from "../../models/User";
import Server from "../../server";

const app: Application = new Server().app;
const request: supertest.SuperTest<supertest.Test> = supertest(app);

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

    afterAll(async () => {
      // Doesn't work if not assigned to a variable
      const result = await Product.deleteMany({});
      const result2 = await User.deleteMany({});
      const result3 = await Image.deleteMany({});
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
      beforeAll(async () => {
        await makeDir("uploads_test");
      });

      afterAll(async () => {
        await del("uploads_test/*.jpg");
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
        const loaded = await Product.findById(response.body._id)
          .populate("frontImage")
          .populate("images");

        expect(loaded.title).toBe(props.title);
        expect(loaded.price).toBe(props.price);
        expect(loaded.weight).toBe(props.weight);

        expect(loaded.frontImage.title).toBeTruthy();
        expect(loaded.frontImage.path).toBeTruthy();
        // Make sure the first image in the list becomes the front image
        expect(loaded.frontImage.title).toBe(filesMetadata[0].title);
        expect(loaded.frontImage.thumbnail.title).toBe(filesMetadata[0].title);

        expect(loaded.images[1].title).toBe(filesMetadata[2].title);
        expect(loaded.images.length).toBe(2);
      });
      test("PUT /products/:id changes an existing product", async () => {
        const loginRes = await request
          .post("/api/v1/auth/login")
          .send(editorCredentials);
        expect(loginRes.status).toBe(200);
        const cookies = loginRes.header["set-cookie"];

        const product = createSampleProduct();
        await product.save();
        const changedProps: IProductProps = {
          title: "A new title, better",
          description: "A new description",
          weight: "Heavy",
          price: 999
        };

        const putReq = request
          .put(`/api/v1/products/${product.id}`)
          .send(changedProps);
        putReq.cookies = cookies;
        const putRes = await putReq;
        expect(putRes.status).toBe(200);
        expect(putRes.body.title).toBe(changedProps.title);
        expect(putRes.body.description).toBe(changedProps.description);
        expect(putRes.body.weight).toBe(changedProps.weight);
        expect(putRes.body.price).toBe(changedProps.price);

        // Double check, load from DB
        const productLoaded = await Product.findById(product.id);
        expect(productLoaded.title).toBe(changedProps.title);
        expect(productLoaded.description).toBe(changedProps.description);
        expect(productLoaded.weight).toBe(changedProps.weight);
        expect(productLoaded.price).toBe(changedProps.price);
      });
      test("DELETE /products/:id deletes an existing product", async () => {
        const loginRes = await request
          .post("/api/v1/auth/login")
          .send(editorCredentials);
        expect(loginRes.status).toBe(200);
        const cookies = loginRes.header["set-cookie"];

        const product = createSampleProduct();
        await product.save();

        const putReq = request.delete(`/api/v1/products/${product.id}`);
        putReq.cookies = cookies;
        const putRes = await putReq;

        expect(putRes.status).toBe(200);
        // Double check the product is actually deleted
        const productLoaded = await Product.findById(product.id);
        expect(productLoaded).toBeFalsy();
      });
      test("PUT /products/:id returns a meaningful error when passed a wrong ID", async () => {
        const loginRes = await request
          .post("/api/v1/auth/login")
          .send(editorCredentials);
        expect(loginRes.status).toBe(200);
        const cookies = loginRes.header["set-cookie"];

        const putReq = request
          .put("/api/v1/products/invalidId")
          .send({ title: "Some title" });
        putReq.cookies = cookies;
        const putRes = await putReq;
        expect(putRes.status).toBe(400);
        expect(putRes.body.message).toBe("Error: Not a valid ID");
      });
      test("DELETE /products/:id returns a meaningful error when passed a wrong ID", async () => {
        const loginRes = await request
          .post("/api/v1/auth/login")
          .send(editorCredentials);
        expect(loginRes.status).toBe(200);
        const cookies = loginRes.header["set-cookie"];

        const putReq = request.delete("/api/v1/products/invalidId");
        putReq.cookies = cookies;
        const putRes = await putReq;
        expect(putRes.status).toBe(400);
        expect(putRes.body.message).toBe("Error: Not a valid ID");
      });
    });
    describe("Make sure protected setupRoutes are secured", () => {
      test("Non-authenticated requests can't POST, PUR or DELETE /products", async () => {
        const props: IProductProps = {
          title: "Some title",
          price: 550,
          description: "a super long description",
          weight: "Much weight wow"
        };

        const postRes = await request.post("/api/v1/products").send(props);
        expect(postRes.status).toBe(403);
        expect(postRes.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );

        // Assert PUT requests don't actually edit products
        const actualProduct = createSampleProduct();
        await actualProduct.save();

        const putRes = await request
          .put(`/api/v1/products/${actualProduct.id}`)
          .send({
            title: "Some other title"
          });
        expect(putRes.status).toBe(403);
        expect(putRes.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );
        // The request was good, but double check the product wasn't actually edited
        const loadedProduct = await Product.findById(actualProduct.id);
        expect(loadedProduct.title).not.toBe("Some other title");
        expect(loadedProduct.title).toBe(actualProduct.title);

        const deleteRes = await request
          .delete("/api/v1/products/someId")
          .send(props);
        expect(deleteRes.status).toBe(403);
        expect(deleteRes.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );

        // Same as above, request was good but check the product wasn't actually deleted
        const loadedAgain = await Product.findById(actualProduct.id);
        expect(loadedAgain).toBeTruthy();
        expect(loadedAgain.title).toBe(actualProduct.title);
      });
      test("Authenticated requests without editor rights can't POST, PUT or DELETE /products", async () => {
        const loginRes = await request
          .post("/api/v1/auth/login")
          .send(readonlyCredentials);
        expect(loginRes.status).toBe(200);
        const cookies = loginRes.header["set-cookie"];

        const props: IProductProps = {
          title: "Some title",
          price: 550,
          description: "a super long description",
          weight: "Much weight wow"
        };

        const req = request.post("/api/v1/products").send(props);
        req.cookies = cookies;

        const response = await req;
        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );

        // Assert PUT requests don't actually edit products
        const actualProduct = createSampleProduct();
        await actualProduct.save();

        const putReq = request
          .put(`/api/v1/products/${actualProduct.id}`)
          .send({
            title: "Some other title"
          });
        putReq.cookies = cookies;
        const putRes = await putReq;
        expect(putRes.status).toBe(403);
        expect(putRes.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );
        // The request was good, but double check the product wasn't actually edited
        const loadedProduct = await Product.findById(actualProduct.id);
        expect(loadedProduct.title).not.toBe("Some other title");
        expect(loadedProduct.title).toBe(actualProduct.title);

        const deleteReq = request.delete("/api/v1/products/someId").send(props);
        deleteReq.cookies = cookies;
        const deleteRes = await deleteReq;
        expect(deleteRes.status).toBe(403);
        expect(deleteRes.body.message).toBe(
          "Error: Not logged in or insufficient privileges"
        );

        // Same as above, request was good but check the product wasn't actually deleted
        const loadedAgain = await Product.findById(actualProduct.id);
        expect(loadedAgain).toBeTruthy();
        expect(loadedAgain.title).toBe(actualProduct.title);
      });
    });
  });
});
