const request = require("supertest");
const app = require("./server");

describe("Book Search API", () => {
  it("should return books and statistics", async () => {
    const response = await request(app).get("/api/search").query({ query: "react" });
    expect(response.status).toBe(200);
    expect(response.body.books).toBeDefined();
    expect(response.body.statistics).toBeDefined();
  });
});