import { TestBed } from "@angular/core/testing";
import type {
  ResponseListUserDto,
  ResponseUserDto,
  ResponseVoid,
  UserDto,
} from "@core/api/generated/models";
import { UsersService } from "@core/api/generated/services";
import { of } from "rxjs";

import { UserService } from "./user-service";

interface MockUsersService {
  getCurrentUser: ReturnType<typeof vi.fn>;
  getUsers: ReturnType<typeof vi.fn>;
  inviteUserWithRol: ReturnType<typeof vi.fn>;
  modifyRol: ReturnType<typeof vi.fn>;
  deactivateUser: ReturnType<typeof vi.fn>;
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

  const mockUserDto2: UserDto = {
    contactInfo: "0987654321",
    createdAt: "2026-01-02T00:00:00.000Z",
    email: "jane@example.com",
    fullName: "Jane Operator",
    id: "user-2",
    role: "OPERATOR",
    tenant: {
      companyName: "ACME Corp",
      id: "tenant-1",
    },
    updatedAt: "2026-01-02T00:00:00.000Z",
  };

  beforeEach(() => {
    usersServiceSpy = {
      deactivateUser: vi.fn(),
      getCurrentUser: vi.fn(),
      getUsers: vi.fn(),
      inviteUserWithRol: vi.fn(),
      modifyRol: vi.fn(),
    };
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

  it("should list users and update users signal", () => {
    const mockListResponse: ResponseListUserDto = {
      data: [mockUserDto, mockUserDto2],
      message: "OK",
      status: "200",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    usersServiceSpy.getUsers.mockReturnValue(of(mockListResponse));

    let resultUsers: unknown;
    service.listUsers().subscribe((users) => {
      resultUsers = users;
    });

    expect(usersServiceSpy.getUsers).toHaveBeenCalledTimes(1);
    expect(resultUsers).toHaveLength(2);
    expect(service.users()).toHaveLength(2);
    expect(service.users()[0].id).toBe("user-1");
    expect(service.users()[1].id).toBe("user-2");
  });

  it("should invite user with role and return observable", () => {
    usersServiceSpy.inviteUserWithRol.mockReturnValue(of({ message: "OK" }));

    let emitted = false;
    service.inviteUser("new@example.com", "OPERATOR", "New User").subscribe(() => {
      emitted = true;
    });

    expect(usersServiceSpy.inviteUserWithRol).toHaveBeenCalledWith({
      body: {
        email: "new@example.com",
        inviteBy: "user-1",
        role: "OPERATOR",
        tenantId: "tenant-1",
      },
    });
    expect(emitted).toBe(true);
  });

  it("should modify user role and update user in users signal", () => {
    const updatedDto: UserDto = { ...mockUserDto2, role: "MANAGER" };
    usersServiceSpy.modifyRol.mockReturnValue(
      of({ data: updatedDto, message: "OK", status: "200", timestamp: "" })
    );

    // Pre-populate users signal via listUsers
    usersServiceSpy.getUsers.mockReturnValue(
      of({
        data: [mockUserDto, mockUserDto2],
        message: "OK",
        status: "200",
        timestamp: "",
      })
    );
    service.listUsers().subscribe();

    let updatedResult: unknown;
    service.modifyRole("user-2", "MANAGER").subscribe((res) => {
      updatedResult = res;
    });

    expect(usersServiceSpy.modifyRol).toHaveBeenCalledWith({
      body: {
        newRole: "MANAGER",
        tenantId: "tenant-1",
        userId: "user-2",
      },
    });
    expect(updatedResult).toBeTruthy();
    const found = service.users().find((u) => u.id === "user-2");
    expect(found?.role).toBe("MANAGER");
  });

  it("should deactivate user and remove from users signal", () => {
    const mockVoidResponse: ResponseVoid = {
      data: null,
      message: "OK",
      status: "200",
      timestamp: "",
    };
    usersServiceSpy.deactivateUser.mockReturnValue(of(mockVoidResponse));

    // Pre-populate users signal
    usersServiceSpy.getUsers.mockReturnValue(
      of({
        data: [mockUserDto, mockUserDto2],
        message: "OK",
        status: "200",
        timestamp: "",
      })
    );
    service.listUsers().subscribe();

    let deactivated = false;
    service.deactivateUser("user-2").subscribe(() => {
      deactivated = true;
    });

    expect(usersServiceSpy.deactivateUser).toHaveBeenCalledWith({
      body: {
        deactivatedBy: "user-1",
        tenantId: "tenant-1",
        userId: "user-2",
      },
    });
    expect(deactivated).toBe(true);
    expect(service.users().find((u) => u.id === "user-2")).toBeUndefined();
  });
});
