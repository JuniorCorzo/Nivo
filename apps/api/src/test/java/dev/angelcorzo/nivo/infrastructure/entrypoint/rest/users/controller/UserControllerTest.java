package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.domain.model.users.exceptions.CannotModifyOwnerRoleException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.SelfDeactivationNotAllowedException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.SelfRoleModificationNotAllowedException;
import dev.angelcorzo.nivo.domain.usecase.user.AcceptInvitationUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.DeactivateUserUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.GetCurrentUserUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.InviteUserWithRolUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.ListUsersByTenantUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.ModifyUserRoleUseCase;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.exception.ExceptionHandlerController;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.dto.InviteUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.mapper.UserInvitationsMapper;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.CreatedUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.DeactivateUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.ModifyRolDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.UserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.enums.UserMessages;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.mappers.UserMapper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {UserController.class, ExceptionHandlerController.class})
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private UserInvitationsMapper userInvitationsMapper;

    @MockitoBean
    private UserMapper userMapper;

    @MockitoBean
    private InviteUserWithRolUseCase inviteUserWithRolUseCase;

    @MockitoBean
    private AcceptInvitationUseCase acceptInvitationUseCase;

    @MockitoBean
    private ModifyUserRoleUseCase modifyUserRoleUseCase;

    @MockitoBean
    private DeactivateUserUseCase deactivateUserUseCase;

    @MockitoBean
    private GetCurrentUserUseCase getCurrentUserUseCase;

    @MockitoBean
    private ListUsersByTenantUseCase listUsersByTenantUseCase;

    @Test
    @DisplayName("POST /users/invite-user - Should return 201 Created for valid invitation")
    void inviteUserWithRol_shouldReturn201() throws Exception {
        // Arrange
        final UUID tenantId = UUID.randomUUID();

        final InviteUserDTO requestDto = InviteUserDTO.builder()
                .tenantId(tenantId)
                .inviteBy(UUID.randomUUID())
                .email("new@user.com")
                .role(Roles.MANAGER)
                .build();

        final InviteUserWithRolUseCase.InviteUserWithRole inviteModel =
                InviteUserWithRolUseCase.InviteUserWithRole.builder()
                        .tenantId(requestDto.tenantId())
                        .inviteBy(requestDto.inviteBy())
                        .email(requestDto.email())
                        .role(requestDto.role())
                        .build();

        final UserInvitations invitationModel =
                UserInvitations.builder().id(UUID.randomUUID()).build();

        when(userInvitationsMapper.toModel(any(InviteUserDTO.class))).thenReturn(inviteModel);
        when(inviteUserWithRolUseCase.registerInvitation(any(InviteUserWithRolUseCase.InviteUserWithRole.class)))
                .thenReturn(invitationModel);

        // Act & Assert
        mockMvc.perform(post("/users/invite-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value(UserMessages.USER_INVITATION_SEND.toString()));
    }

    @Test
    @DisplayName("PATCH /users/accept-invitation/{token} - Should return 200 OK when accepted")
    void acceptInvitation_shouldReturn200() throws Exception {
        // Arrange
        final UUID token = UUID.randomUUID();
        final CreatedUserDTO userDto = new CreatedUserDTO("New User", "new@user.com", "password", "contact-info");
        final UserInvitations invitationAccepted =
                UserInvitations.builder().id(UUID.randomUUID()).build();

        when(acceptInvitationUseCase.accept(any(AcceptInvitationUseCase.Accept.class)))
                .thenReturn(invitationAccepted);

        // Act & Assert
        mockMvc.perform(patch("/users/accept-invitation/{token}", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(UserMessages.USER_INVITATION_ACCEPTED.toString()));
    }

    @Test
    @DisplayName("PATCH /users/modify-rol - Should return 200 OK when role is modified")
    void modifyRol_shouldReturn200() throws Exception {
        // Arrange
        final ModifyRolDTO requestDto = new ModifyRolDTO(UUID.randomUUID(), Roles.MANAGER, UUID.randomUUID());
        final Users userModel = Users.builder().id(requestDto.userId()).build();

        final ModifyUserRoleUseCase.ModifyUserRole modifyCommand = ModifyUserRoleUseCase.ModifyUserRole.builder()
                .userId(requestDto.userId())
                .newRole(requestDto.newRole())
                .build();

        when(userMapper.toModel(any(ModifyRolDTO.class))).thenReturn(modifyCommand);
        when(modifyUserRoleUseCase.modifyRole(any(ModifyUserRoleUseCase.ModifyUserRole.class)))
                .thenReturn(userModel);

        // Act & Assert
        mockMvc.perform(patch("/users/modify-rol")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(UserMessages.USER_ROL_MODIFIED.toString()));
    }

    @Test
    @DisplayName("PATCH /users/modify-rol - Should return 403 Forbidden when modifying OWNER or SUPERADMIN role")
    void modifyRol_shouldReturn403_whenModifyingOwnerRole() throws Exception {
        // Arrange
        final ModifyRolDTO requestDto = new ModifyRolDTO(UUID.randomUUID(), Roles.MANAGER, UUID.randomUUID());
        final ModifyUserRoleUseCase.ModifyUserRole modifyCommand = ModifyUserRoleUseCase.ModifyUserRole.builder()
                .userId(requestDto.userId())
                .newRole(requestDto.newRole())
                .build();

        when(userMapper.toModel(any(ModifyRolDTO.class))).thenReturn(modifyCommand);
        when(modifyUserRoleUseCase.modifyRole(any(ModifyUserRoleUseCase.ModifyUserRole.class)))
                .thenThrow(new CannotModifyOwnerRoleException());

        // Act & Assert
        mockMvc.perform(patch("/users/modify-rol")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("CANNOT_MODIFY_OWNER_ROLE"));
    }

    @Test
    @DisplayName("PATCH /users/modify-rol - Should return 403 Forbidden when self-demoting / modifying own role")
    void modifyRol_shouldReturn403_whenSelfDemotionAttempted() throws Exception {
        // Arrange
        final ModifyRolDTO requestDto = new ModifyRolDTO(UUID.randomUUID(), Roles.OPERATOR, UUID.randomUUID());
        final ModifyUserRoleUseCase.ModifyUserRole modifyCommand = ModifyUserRoleUseCase.ModifyUserRole.builder()
                .userId(requestDto.userId())
                .newRole(requestDto.newRole())
                .build();

        when(userMapper.toModel(any(ModifyRolDTO.class))).thenReturn(modifyCommand);
        when(modifyUserRoleUseCase.modifyRole(any(ModifyUserRoleUseCase.ModifyUserRole.class)))
                .thenThrow(new SelfRoleModificationNotAllowedException());

        // Act & Assert
        mockMvc.perform(patch("/users/modify-rol")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("SELF_ROLE_MODIFICATION_NOT_ALLOWED"));
    }

    @Test
    @DisplayName("DELETE /users/deactivate-user - Should return 200 OK when user is deactivated")
    void deactivateUser_shouldReturn200() throws Exception {
        // Arrange
        final DeactivateUserDTO requestDto =
                new DeactivateUserDTO(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), "no-reason");
        final Users userModel = Users.builder().id(requestDto.userId()).build();

        final DeactivateUserUseCase.DeactivateUserCommand deactivateCommand =
                DeactivateUserUseCase.DeactivateUserCommand.builder()
                        .userIdToDeactivate(requestDto.userId())
                        .reason(requestDto.reason())
                        .build();

        final Users deactivatedUser = Users.builder()
                .id(userModel.getId())
                .deletedBy(requestDto.deactivatedBy())
                .deletedAt(OffsetDateTime.now())
                .build();

        when(userMapper.toModel(any(DeactivateUserDTO.class))).thenReturn(deactivateCommand);
        when(deactivateUserUseCase.deactivate(any(DeactivateUserUseCase.DeactivateUserCommand.class)))
                .thenReturn(deactivatedUser);

        // Act & Assert
        mockMvc.perform(delete("/users/deactivate-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(UserMessages.USER_DEACTIVATED.toString()));
    }

    @Test
    @DisplayName("DELETE /users/deactivate-user - Should return 403 Forbidden when self-deactivation is attempted")
    void deactivateUser_shouldReturn403_whenSelfDeactivationAttempted() throws Exception {
        // Arrange
        final DeactivateUserDTO requestDto =
                new DeactivateUserDTO(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), "leaving");
        final DeactivateUserUseCase.DeactivateUserCommand deactivateCommand =
                DeactivateUserUseCase.DeactivateUserCommand.builder()
                        .userIdToDeactivate(requestDto.userId())
                        .reason(requestDto.reason())
                        .build();

        when(userMapper.toModel(any(DeactivateUserDTO.class))).thenReturn(deactivateCommand);
        when(deactivateUserUseCase.deactivate(any(DeactivateUserUseCase.DeactivateUserCommand.class)))
                .thenThrow(new SelfDeactivationNotAllowedException());

        // Act & Assert
        mockMvc.perform(delete("/users/deactivate-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("SELF_DEACTIVATION_NOT_ALLOWED"));
    }

    @Test
    @DisplayName("GET /users/me - Should return 200 OK with current user profile")
    void getCurrentUser_shouldReturn200() throws Exception {
        // Arrange
        final UUID userId = UUID.randomUUID();
        final UUID tenantId = UUID.randomUUID();
        final OffsetDateTime now = OffsetDateTime.now();

        final Users currentUser = Users.builder()
                .id(userId)
                .fullName("Test User")
                .email("test@example.com")
                .role(Roles.MANAGER)
                .tenant(dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference.builder()
                        .id(tenantId)
                        .companyName("Test Corp")
                        .build())
                .contactInfo("+5491112345678")
                .createdAt(now.minusDays(30))
                .updatedAt(now)
                .build();

        when(getCurrentUserUseCase.execute()).thenReturn(currentUser);
        when(userMapper.toDTO(any(Users.class)))
                .thenReturn(dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.UserDTO.builder()
                        .id(userId)
                        .fullName("Test User")
                        .email("test@example.com")
                        .role(Roles.MANAGER)
                        .tenant(dev.angelcorzo.nivo.infrastructure.entrypoint.rest.tenants.dto.TenantInfo.builder()
                                .id(tenantId)
                                .companyName("Test Corp")
                                .build())
                        .contactInfo("+5491112345678")
                        .createdAt(now.minusDays(30))
                        .updatedAt(now)
                        .build());

        // Act & Assert
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(UserMessages.USER_PROFILE_RETRIEVED.toString()))
                .andExpect(jsonPath("$.data.id").value(userId.toString()))
                .andExpect(jsonPath("$.data.fullName").value("Test User"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.role").value("MANAGER"));
    }

    @Test
    @DisplayName("GET /users - Should return 200 OK and list of users for tenant")
    void getUsers_shouldReturn200AndUserList() throws Exception {
        final UUID userId = UUID.randomUUID();
        final Users domainUser =
                Users.builder().id(userId).fullName("Carlos Manager").build();
        final UserDTO userDto =
                UserDTO.builder().id(userId).fullName("Carlos Manager").build();

        when(listUsersByTenantUseCase.execute()).thenReturn(List.of(domainUser));
        when(userMapper.toDTO(domainUser)).thenReturn(userDto);

        mockMvc.perform(get("/users").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(UserMessages.USERS_RETRIEVED.toString()))
                .andExpect(jsonPath("$.data[0].id").value(userId.toString()))
                .andExpect(jsonPath("$.data[0].fullName").value("Carlos Manager"));
    }
}
