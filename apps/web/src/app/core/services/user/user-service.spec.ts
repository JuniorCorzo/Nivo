import { TestBed } from "@angular/core/testing";
import type { ResponseUserDto, UserDto } from "@core/api/generated/models";
import { UsersService } from "@core/api/generated/services";
import { of } from "rxjs";

import { UserService } from "./user-service";

interface MockUsersService {
  getCurrentUser: ReturnType<typeof vi.fn>;
}

describe("UserService", () => {
  let service: UserService;
  let usersServiceSpy: MockUsersService;
  const mockUserDto: UserDto = {
    contactInfo: "1234567890",
    createdAt: "2026-01-01T00:00:00.000Z",
    email: "john@example.com",
    fullName: "John Doe",
    id: "user-1",
    role: "MANAGER",
    tenant: {
      companyName: "ACME Corp",
      id: "tenant-1",
    },
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    usersServiceSpy = { getCurrentUser: vi.fn() };
    const mockResponse: ResponseUserDto = {
      data: mockUserDto,
      message: "OK",
      status: "200",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    usersServiceSpy.getCurrentUser.mockReturnValue(of(mockResponse));

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: UsersService, useValue: usersServiceSpy },
      ],
    });
    service = TestBed.inject(UserService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should load current user on construction", () => {
    expect(usersServiceSpy.getCurrentUser).toHaveBeenCalledTimes(1);
    const currentUser = service.currentUser();
    expect(currentUser).toBeTruthy();
    expect(currentUser?.id).toBe("user-1");
    expect(currentUser?.fullName).toBe("John Doe");
  });

  it("should set currentUser to null if response has no data", () => {
    const emptyResponse: Partial<ResponseUserDto> = {
      message: "Empty",
      status: "200",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    /* SAFETY: Simulating backend response with missing user payload */
    usersServiceSpy.getCurrentUser.mockReturnValue(
      of(emptyResponse as ResponseUserDto)
    );
    const newService = TestBed.runInInjectionContext(() => new UserService());
    expect(newService.currentUser()).toBeNull();
  });
});
