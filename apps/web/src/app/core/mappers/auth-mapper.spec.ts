import { mapToLoginResponseModel } from "./auth.mapper";

describe("AuthMapper", () => {
  it("should map AuthenticationResponseDto to LoginResponseModel", () => {
    const res = mapToLoginResponseModel({
      accessToken: "token1",
      refreshToken: "token2",
    });
    expect(res).toEqual({
      accessToken: "token1",
      refreshToken: "token2",
    });
  });
});
