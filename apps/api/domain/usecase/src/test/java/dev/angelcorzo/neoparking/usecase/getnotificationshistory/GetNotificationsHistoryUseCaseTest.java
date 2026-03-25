package dev.angelcorzo.neoparking.usecase.getnotificationshistory;

import dev.angelcorzo.neoparking.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.neoparking.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.neoparking.model.notificationlogs.gateways.NotificationLogsRepository;
import dev.angelcorzo.neoparking.model.users.Users;
import dev.angelcorzo.neoparking.model.users.enums.Roles;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetNotificationsHistoryUseCaseTest {

    private final UUID userId = UUID.randomUUID();
    private final UUID tenantId = UUID.randomUUID();

    @Mock
    private NotificationLogsRepository notificationLogsRepository;

    @Mock
    private AuthenticationContextGateway authenticationContext;

    @InjectMocks
    private GetNotificationsHistoryUseCase getNotificationsHistoryUseCase;

    private NotificationLogs sampleLog;

    @BeforeEach
    void setUp() {
        sampleLog = NotificationLogs.builder()
                .id(UUID.randomUUID())
                .build();
    }

    @Test
    @DisplayName("When user is DRIVER: should call findAllByUserId and NOT findAllByTenantId")
    void shouldCallFindAllByUserIdWhenUserIsDriver() {
        // Arrange
        Users driver = Users.builder()
                .id(userId)
                .role(Roles.DRIVER)
                .build();

        when(authenticationContext.getCurrentUser()).thenReturn(driver);
        when(notificationLogsRepository.findAllByUserId(userId)).thenReturn(List.of(sampleLog));

        // Act
        List<NotificationLogs> result = getNotificationsHistoryUseCase.execute();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(sampleLog, result.get(0));

        verify(notificationLogsRepository, times(1)).findAllByUserId(userId);
        verify(notificationLogsRepository, never()).findAllByTenantId(any());
        verify(authenticationContext, never()).getCurrentTenantId();
    }

    @Test
    @DisplayName("When user is OPERATOR: should call findAllByUserId and NOT findAllByTenantId")
    void shouldCallFindAllByUserIdWhenUserIsOperator() {
        // Arrange
        Users operator = Users.builder()
                .id(userId)
                .role(Roles.OPERATOR)
                .build();

        when(authenticationContext.getCurrentUser()).thenReturn(operator);
        when(notificationLogsRepository.findAllByUserId(userId)).thenReturn(List.of(sampleLog));

        // Act
        List<NotificationLogs> result = getNotificationsHistoryUseCase.execute();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(sampleLog, result.get(0));

        verify(notificationLogsRepository, times(1)).findAllByUserId(userId);
        verify(notificationLogsRepository, never()).findAllByTenantId(any());
        verify(authenticationContext, never()).getCurrentTenantId();
    }

    @Test
    @DisplayName("When user is OWNER: should call findAllByTenantId and NOT findAllByUserId")
    void shouldCallFindAllByTenantIdWhenUserIsOwner() {
        // Arrange
        Users owner = Users.builder()
                .id(userId)
                .role(Roles.OWNER)
                .build();

        when(authenticationContext.getCurrentUser()).thenReturn(owner);
        when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
        when(notificationLogsRepository.findAllByTenantId(tenantId)).thenReturn(List.of(sampleLog));

        // Act
        List<NotificationLogs> result = getNotificationsHistoryUseCase.execute();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(sampleLog, result.get(0));

        verify(notificationLogsRepository, times(1)).findAllByTenantId(tenantId);
        verify(notificationLogsRepository, never()).findAllByUserId(any());
    }

    @Test
    @DisplayName("Should return the list from the repository correctly")
    void shouldReturnListFromRepositoryCorrectly() {
        // Arrange
        NotificationLogs log1 = NotificationLogs.builder().id(UUID.randomUUID()).build();
        NotificationLogs log2 = NotificationLogs.builder().id(UUID.randomUUID()).build();
        List<NotificationLogs> expectedList = List.of(log1, log2);

        Users manager = Users.builder()
                .id(userId)
                .role(Roles.MANAGER)
                .build();

        when(authenticationContext.getCurrentUser()).thenReturn(manager);
        when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
        when(notificationLogsRepository.findAllByTenantId(tenantId)).thenReturn(expectedList);

        // Act
        List<NotificationLogs> result = getNotificationsHistoryUseCase.execute();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedList, result);
    }
}
