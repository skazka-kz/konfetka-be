import { Application, Response } from "express";
import "jest";
import supertest = require("supertest");
import Server from "../server";

let app: Application;
let request: supertest.SuperTest<supertest.Test>;

describe("Server App tests", () => {
  beforeEach(() => {
    app = new Server().app;
    request = supertest(app);
  });

  afterEach(() => {
    app = undefined;
    request = undefined;
  });

  test("/ping returns the right code and content", async () => {
    const response: any = await request.get("/ping");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Pong");
  });

});
