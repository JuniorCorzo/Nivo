package dev.angelcorzo.nivo.usecase.registertenant;

import dev.angelcorzo.nivo.model.commons.valueobjects.AppProperties;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.EmailAlreadyExistsException;
import dev.angelcorzo.nivo.model.users.gateways.PasswordEncodeGateway;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.sendnotifications.SendNotificationsUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegisterTenantUseCaseTest {

    private final UUID tenantId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    // Mocks for dependencies (ports in hexagonal architecture)
    @Mock
    private UsersRepository usersRepository;
    @Mock
    private TenantsRepository tenantsRepository;
    @Mock
    private PasswordEncodeGateway passwordEncode;
    @Mock
    private SendNotificationsUseCase sendNotificationsUseCase;
    @Mock
    private AppProperties appProperties;

    @InjectMocks
    private RegisterTenantUseCase registerTenantUseCase;
    private Users userToRegister;
    private Tenants tenantToRegister;
    private Tenants tenant;

    @BeforeEach
    void setUp() {
        // Input data for tests
        tenantToRegister = Tenants.builder()
                .id(tenantId)
                .companyName("Test Tenant")
                .build();

        tenant = Tenants.builder()
                .id(tenantId)
                .companyName("Test Tenant")
                .build();

        userToRegister = Users.builder()
                .id(userId)
                .fullName("Test User")
                .email("test@example.com")
                .password("password123")
                .contactInfo("3000000000")
                .build();

        when(appProperties.getCtaUrl()).thenReturn("https://cta.test");
        when(appProperties.getCompanyName()).thenReturn("Nivo");
        when(appProperties.getSupportUrl()).thenReturn("https://support.test");
        when(appProperties.getSocialUrl()).thenReturn("https://social.test");
        when(appProperties.getUnsubscribeUrl()).thenReturn("https://unsubscribe.test");
        when(appProperties.getAddressCompany()).thenReturn("Street 123");
    }

    @Test
    @DisplayName("Should successfully register a tenant and a user")
    void shouldRegisterTenantAndUserSuccessfully() {
        // Arrange
        Users userReturn = userToRegister;
        userReturn.setTenant(TenantReference.of(tenant));

        // 1. When checking if email exists, return false (does not exist)
        when(usersRepository.existsByEmail(userToRegister.getEmail())).thenReturn(false);

        when(passwordEncode.encrypt(anyString())).thenReturn("encryptedPassword");
        when(tenantsRepository.getReferenceById(tenantToRegister.getId())).thenReturn(tenant);

        // 2. When saving the tenant, return the same tenant (simulating save)
        when(tenantsRepository.save(any(Tenants.class))).thenReturn(tenantToRegister);

        // 3. When saving the user, return the same user
        when(usersRepository.save(any(Users.class))).thenReturn(userReturn);

        // Act
        Users response = registerTenantUseCase.register(userToRegister, tenantToRegister);

        // Assert

        // Verify that the response is not null and contains the expected data
        assertNotNull(response);
        assertEquals(response, userReturn);
        assertEquals(tenantToRegister, response.getTenant());
        assertEquals(userId, response.getId());
        assertEquals(Roles.OWNER, response.getRole());
        // ArgumentCaptor to verify the state of the User object passed to the save method
        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);

        // Verify that repository methods were called
        verify(usersRepository, times(1)).existsByEmail("test@example.com");
        verify(tenantsRepository, times(1)).save(any(Tenants.class));
        verify(usersRepository, times(1)).save(userCaptor.capture()); // Capture the argument
        verify(sendNotificationsUseCase, times(1))
                .send(any(), any(), anyString(), any(), any(), any());

        // Verify that the tenant was correctly assigned to the user before saving
        assertEquals(tenant, userCaptor.getValue().getTenant());
        assertEquals(tenantId, userCaptor.getValue().getTenant().id());
    }

    @Test
    @DisplayName("Should throw EmailAlreadyExistsException if email already exists")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // Arrange

        // 1. When checking if email exists, return true (it does exist)
        when(usersRepository.existsByEmail(userToRegister.getEmail())).thenReturn(true);

        // Act & Assert

        // Verify that the correct exception is thrown
        EmailAlreadyExistsException exception = assertThrows(EmailAlreadyExistsException.class, () -> {
            registerTenantUseCase.register(userToRegister, tenantToRegister);
        });

        // Optional: verify the exception message
        assertEquals("El email test@example.com ya existe", exception.getMessage());

        // VERY IMPORTANT: Verify that nothing was attempted to be saved
        verify(tenantsRepository, never()).save(any(Tenants.class));
        verify(usersRepository, never()).save(any(Users.class));
    }
}
