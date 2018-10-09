import { Application, Response } from "express";
import "jest";
import supertest = require("supertest");
import Server from "../server";

const app: Application = new Server().app;
const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe("Server App tests", () => {
  test("/ping returns the right code and content", async () => {
    const response: any = await request.get("/ping");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Pong");
  });
});
