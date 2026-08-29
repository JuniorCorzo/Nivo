import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsersService } from '@core/api/generated/services';
import { UserMapper } from '@core/mappers/user.mapper';
import { UserService } from './user-service';
import { UserDto } from '@core/api/generated/models';

describe('UserService', () => {
  let service: UserService;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  const mockUserDto: UserDto = {
    id: 'user-1',
    fullName: 'John Doe',
    email: 'john@example.com',
    contactInfo: '1234567890',
    role: 'MANAGER',
    tenant: {
      id: 'tenant-1',
      companyName: 'ACME Corp',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getCurrentUser']);
    usersServiceSpy.getCurrentUser.and.returnValue(of({ data: mockUserDto } as any));

    TestBed.configureTestingModule({
      providers: [
        UserService,
        UserMapper,
        { provide: UsersService, useValue: usersServiceSpy },
      ],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load current user on construction', () => {
    expect(usersServiceSpy.getCurrentUser).toHaveBeenCalledTimes(1);
    const currentUser = service.currentUser();
    expect(currentUser).toBeTruthy();
    expect(currentUser?.id).toBe('user-1');
    expect(currentUser?.fullName).toBe('John Doe');
  });

  it('should set currentUser to null if response has no data', () => {
    usersServiceSpy.getCurrentUser.and.returnValue(of({ data: undefined } as any));
    const newService = TestBed.runInInjectionContext(() => new UserService());
    expect(newService.currentUser()).toBeNull();
  });
});

