package dev.angelcorzo.nivo.model.users.valueobject;

import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.util.UUID;

public record UserReference(
    UUID id, String fullName, String email, Roles role, String contactInfo) {
  public static UserReference of(Users user) {
    return new UserReference(
        user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getContactInfo());
  }
}
