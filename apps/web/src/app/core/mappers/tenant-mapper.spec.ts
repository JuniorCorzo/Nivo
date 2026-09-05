import { mapToTenantInfoModel } from "./tenant.mapper";

describe("TenantMapper", () => {
  it("should map TenantInfoModel", () => {
    const res = mapToTenantInfoModel({
      companyName: "ACME",
      id: "tenant-1",
    });
    expect(res).toEqual({
      companyName: "ACME",
      id: "tenant-1",
    });
  });
});
