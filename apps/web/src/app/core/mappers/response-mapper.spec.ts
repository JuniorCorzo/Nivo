import { mapResponseError } from "./response.mapper";

describe("ResponseMapper", () => {
  it("should map response error when valid", () => {
    const res = mapResponseError({
      code: "400",
      error: "Bad Request",
      status: "400",
    });
    expect(res).toBeTruthy();
  });
});
