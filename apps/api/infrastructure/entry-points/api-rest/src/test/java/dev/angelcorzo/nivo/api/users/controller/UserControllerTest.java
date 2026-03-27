package dev.angelcorzo.nivo.api.users.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.api.userinvitations.dto.InviteUserDTO;
import dev.angelcorzo.nivo.api.userinvitations.mapper.UserInvitationsMapper;
import dev.angelcorzo.nivo.api.users.dto.CreatedUserDTO;
import dev.angelcorzo.nivo.api.users.dto.DeactivateUserDTO;
import dev.angelcorzo.nivo.api.users.dto.ModifyRolDTO;
import dev.angelcorzo.nivo.api.users.enums.UserMessages;
import dev.angelcorzo.nivo.api.users.mappers.UserMapper;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.usecase.acceptinvitation.AcceptInvitationUseCase;
import dev.angelcorzo.nivo.usecase.deactivateuser.DeactivateUserUseCase;
import dev.angelcorzo.nivo.usecase.inviteuserwithrol.InviteUserWithRolUseCase;
import dev.angelcorzo.nivo.usecase.modifyuserrole.ModifyUserRoleUseCase;
import java.time.OffsetDateTime;
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
@ContextConfiguration(classes = UserController.class)
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private UserInvitationsMapper userInvitationsMapper;
  @MockitoBean private UserMapper userMapper;
  @MockitoBean private InviteUserWithRolUseCase inviteUserWithRolUseCase;
  @MockitoBean private AcceptInvitationUseCase acceptInvitationUseCase;
  @MockitoBean private ModifyUserRoleUseCase modifyUserRoleUseCase;
  @MockitoBean private DeactivateUserUseCase deactivateUserUseCase;

  @Test
  @DisplayName("POST /users/invite-user - Should return 201 Created for valid invitation")
  void inviteUserWithRol_shouldReturn201() throws Exception {
    // Arrange
    final UUID tenantId = UUID.randomUUID();

    InviteUserDTO requestDto =
        InviteUserDTO.builder()
            .tenantId(tenantId)
            .inviteBy(UUID.randomUUID())
            .email("new@user.com")
            .role(Roles.MANAGER)
            .build();

    InviteUserWithRolUseCase.InviteUserWithRole inviteModel =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(requestDto.tenantId())
            .inviteBy(requestDto.inviteBy())
            .email(requestDto.email())
            .role(requestDto.role())
            .build();

    UserInvitations invitationModel = UserInvitations.builder().id(UUID.randomUUID()).build();

    when(userInvitationsMapper.toModel(any(InviteUserDTO.class))).thenReturn(inviteModel);
    when(inviteUserWithRolUseCase.registerInvitation(
            any(InviteUserWithRolUseCase.InviteUserWithRole.class)))
        .thenReturn(invitationModel);

    // Act & Assert
    mockMvc
        .perform(
            post("/users/invite-user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.message").value(UserMessages.USER_INVITATION_SEND.toString()));
  }

  @Test
  @DisplayName("PATCH /users/accept-invitation/{token} - Should return 200 OK when accepted")
  void acceptInvitation_shouldReturn200() throws Exception {
    // Arrange
    UUID token = UUID.randomUUID();
    CreatedUserDTO userDto =
        new CreatedUserDTO("New User", "new@user.com", "password", "contact-info");
    UserInvitations invitationAccepted = UserInvitations.builder().id(UUID.randomUUID()).build();

    when(acceptInvitationUseCase.accept(any(AcceptInvitationUseCase.Accept.class)))
        .thenReturn(invitationAccepted);

    // Act & Assert
    mockMvc
        .perform(
            patch("/users/accept-invitation/{token}", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userDto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(UserMessages.USER_INVITATION_ACCEPTED.toString()));
  }

  @Test
  @DisplayName("PATCH /users/modify-rol - Should return 200 OK when role is modified")
  void modifyRol_shouldReturn200() throws Exception {
    // Arrange
    ModifyRolDTO requestDto = new ModifyRolDTO(UUID.randomUUID(), Roles.MANAGER, UUID.randomUUID());
    Users userModel = Users.builder().id(requestDto.userId()).build();

    // Mapper debe devolver el comando de use case (ModifyUserRole)
    ModifyUserRoleUseCase.ModifyUserRole modifyCommand =
        ModifyUserRoleUseCase.ModifyUserRole.builder()
            .userId(requestDto.userId())
            .newRole(requestDto.newRole())
            .tenantId(requestDto.tenantId())
            .build();

    when(userMapper.toModel(any(ModifyRolDTO.class))).thenReturn(modifyCommand);
    when(modifyUserRoleUseCase.modifyRole(any(ModifyUserRoleUseCase.ModifyUserRole.class)))
        .thenReturn(userModel);

    // Act & Assert
    mockMvc
        .perform(
            patch("/users/modify-rol")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(UserMessages.USER_ROL_MODIFIED.toString()));
  }

  @Test
  @DisplayName("DELETE /users/deactivate-user - Should return 200 OK when user is deactivated")
  void deactivateUser_shouldReturn200() throws Exception {
    // Arrange
    DeactivateUserDTO requestDto =
        new DeactivateUserDTO(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), "no-reason");
    Users userModel = Users.builder().id(requestDto.userId()).build();

    // Mapper debe devolver el comando de use case
    DeactivateUserUseCase.DeactivateUserCommand deactivateCommand =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(requestDto.userId())
            .deactivatedBy(requestDto.deactivatedBy())
            .tenantId(requestDto.tenantId())
            .reason(requestDto.reason())
            .build();

    Users deactivatedUser = Users.builder()
        .id(userModel.getId())
        .deletedBy(requestDto.deactivatedBy())
        .deletedAt(OffsetDateTime.now())
        .build();

    when(userMapper.toModel(any(DeactivateUserDTO.class))).thenReturn(deactivateCommand);
    when(deactivateUserUseCase.deactivate(any(DeactivateUserUseCase.DeactivateUserCommand.class)))
        .thenReturn(deactivatedUser);

    // Act & Assert
    mockMvc
        .perform(
            delete("/users/deactivate-user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(UserMessages.USER_DEACTIVATED.toString()));
  }
}
