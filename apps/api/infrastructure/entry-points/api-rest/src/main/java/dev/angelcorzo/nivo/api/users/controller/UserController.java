package dev.angelcorzo.nivo.api.users.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.userinvitations.dto.InviteUserDTO;
import dev.angelcorzo.nivo.api.userinvitations.dto.UserInvitationsDTO;
import dev.angelcorzo.nivo.api.userinvitations.mapper.UserInvitationsMapper;
import dev.angelcorzo.nivo.api.users.dto.CreatedUserDTO;
import dev.angelcorzo.nivo.api.users.dto.DeactivateUserDTO;
import dev.angelcorzo.nivo.api.users.dto.ModifyRolDTO;
import dev.angelcorzo.nivo.api.users.dto.UserDTO;
import dev.angelcorzo.nivo.api.users.enums.UserMessages;
import dev.angelcorzo.nivo.api.users.mappers.UserMapper;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.usecase.acceptinvitation.AcceptInvitationUseCase;
import dev.angelcorzo.nivo.usecase.deactivateuser.DeactivateUserUseCase;
import dev.angelcorzo.nivo.usecase.getcurrentuser.GetCurrentUserUseCase;
import dev.angelcorzo.nivo.usecase.inviteuserwithrol.InviteUserWithRolUseCase;
import dev.angelcorzo.nivo.usecase.modifyuserrole.ModifyUserRoleUseCase;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
  private final UserInvitationsMapper userInvitationsMapper;
  private final UserMapper userMapper;

  private final InviteUserWithRolUseCase inviteUserWithRolUseCase;
  private final AcceptInvitationUseCase acceptInvitationUseCase;
  private final ModifyUserRoleUseCase modifyUserRoleUseCase;
  private final DeactivateUserUseCase deactivateUserUseCase;
  private final GetCurrentUserUseCase getCurrentUserUseCase;

  @PostMapping("/invite-user")
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  Response<UserInvitationsDTO> inviteUserWithRol(@RequestBody InviteUserDTO inviteUser) {
    final UserInvitations invitationRegistered =
        this.inviteUserWithRolUseCase.registerInvitation(
            this.userInvitationsMapper.toModel(inviteUser));

    return Response.created(
        this.userInvitationsMapper.toDTO(invitationRegistered),
        UserMessages.USER_INVITATION_SEND.toString());
  }

  @PatchMapping("/accept-invitation/{token}")
  Response<UserInvitationsDTO> acceptInvitation(
      @PathVariable("token") UUID token, @RequestBody CreatedUserDTO user) {
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

  @PatchMapping("/modify-rol")
  @PreAuthorize("hasRole('MANAGER')")
  Response<UserDTO> modifyRol(@RequestBody ModifyRolDTO modifyRol) {
    Users userWithRolUpdate =
        this.modifyUserRoleUseCase.modifyRole(this.userMapper.toModel(modifyRol));

    return Response.ok(
        this.userMapper.toDTO(userWithRolUpdate), UserMessages.USER_ROL_MODIFIED.toString());
  }

  @DeleteMapping("/deactivate-user")
  @PreAuthorize("hasRole('MANAGER')")
  Response<Void> deactivateUser(@RequestBody DeactivateUserDTO deactivateUser) {
    this.deactivateUserUseCase.deactivate(this.userMapper.toModel(deactivateUser));
    return Response.ok(null, UserMessages.USER_DEACTIVATED.toString());
  }

  @GetMapping("/me")
  Response<UserDTO> getCurrentUser() {
    Users currentUser = this.getCurrentUserUseCase.execute();
    return Response.ok(
        this.userMapper.toDTO(currentUser), UserMessages.USER_PROFILE_RETRIEVED.toString());
  }
}
