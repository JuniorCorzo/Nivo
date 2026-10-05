package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.controller;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.dto.Response;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.dto.InviteUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.dto.UserInvitationsDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.mapper.UserInvitationsMapper;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.CreatedUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.DeactivateUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.ModifyRolDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.UserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.enums.UserMessages;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.mappers.UserMapper;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.usecase.user.AcceptInvitationUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.DeactivateUserUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.GetCurrentUserUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.InviteUserWithRolUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.ModifyUserRoleUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management, invitations, profile and roles")
public class UserController {
  private final UserInvitationsMapper userInvitationsMapper;
  private final UserMapper userMapper;

  private final InviteUserWithRolUseCase inviteUserWithRolUseCase;
  private final AcceptInvitationUseCase acceptInvitationUseCase;
  private final ModifyUserRoleUseCase modifyUserRoleUseCase;
  private final DeactivateUserUseCase deactivateUserUseCase;
  private final GetCurrentUserUseCase getCurrentUserUseCase;

  @Operation(
      summary = "Invite a user with a role",
      description = "Sends an invitation email to a user with an assigned role for a tenant")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Invitation sent successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid request payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @PostMapping("/invite-user")
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  Response<UserInvitationsDTO> inviteUserWithRol(@RequestBody @Valid InviteUserDTO inviteUser) {
    final UserInvitations invitationRegistered =
        this.inviteUserWithRolUseCase.registerInvitation(
            this.userInvitationsMapper.toModel(inviteUser));

    return Response.created(
        this.userInvitationsMapper.toDTO(invitationRegistered),
        UserMessages.USER_INVITATION_SEND.toString());
  }

  @Operation(
      summary = "Accept user invitation",
      description = "Completes user registration using the invitation token received via email",
      security = {})
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Invitation accepted successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid token or user data")
  })
  @PatchMapping("/accept-invitation/{token}")
  Response<UserInvitationsDTO> acceptInvitation(
      @Parameter(description = "Invitation token", required = true) @PathVariable("token") UUID token,
      @RequestBody @Valid CreatedUserDTO user) {
    final UserInvitations invitationAccepted =
        this.acceptInvitationUseCase.accept(
            AcceptInvitationUseCase.Accept.builder()
                .user(this.userMapper.toModel(user))
                .token(token)
                .build());

    return Response.ok(
        this.userInvitationsMapper.toDTO(invitationAccepted),
        UserMessages.USER_INVITATION_ACCEPTED.toString());
  }

  @Operation(
      summary = "Modify user role",
      description = "Updates the assigned role of a user within a tenant")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "User role modified successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid request payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @PatchMapping("/modify-rol")
  @PreAuthorize("hasRole('MANAGER')")
  Response<UserDTO> modifyRol(@RequestBody @Valid ModifyRolDTO modifyRol) {
    Users userWithRolUpdate =
        this.modifyUserRoleUseCase.modifyRole(this.userMapper.toModel(modifyRol));

    return Response.ok(
        this.userMapper.toDTO(userWithRolUpdate), UserMessages.USER_ROL_MODIFIED.toString());
  }

  @Operation(
      summary = "Deactivate user",
      description = "Soft deletes/deactivates a user from the system")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "User deactivated successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid request payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @DeleteMapping("/deactivate-user")
  @PreAuthorize("hasRole('MANAGER')")
  Response<Void> deactivateUser(@RequestBody @Valid DeactivateUserDTO deactivateUser) {
    this.deactivateUserUseCase.deactivate(this.userMapper.toModel(deactivateUser));
    return Response.ok(null, UserMessages.USER_DEACTIVATED.toString());
  }

  @Operation(
      summary = "Get current user profile",
      description = "Retrieves the profile of the currently authenticated user")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
    @ApiResponse(responseCode = "401", description = "Unauthorized")
  })
  @GetMapping("/me")
  Response<UserDTO> getCurrentUser() {
    Users currentUser = this.getCurrentUserUseCase.execute();
    return Response.ok(
        this.userMapper.toDTO(currentUser), UserMessages.USER_PROFILE_RETRIEVED.toString());
  }
}
