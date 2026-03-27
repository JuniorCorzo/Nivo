package dev.angelcorzo.nivo.api.tenants.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.api.tenants.dto.RegisterTenantDTO;
import dev.angelcorzo.nivo.api.tenants.enums.TenantsMessages;
import dev.angelcorzo.nivo.api.users.dto.CreatedUserDTO;
import dev.angelcorzo.nivo.api.users.dto.UserDTO;
import dev.angelcorzo.nivo.api.users.mappers.UserMapper;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.usecase.registertenant.RegisterTenantUseCase;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@WebMvcTest(TenantController.class)
@AutoConfigureMockMvc(addFilters = false)
@ExtendWith(MockitoExtension.class)
@ContextConfiguration(classes = TenantController.class)
class TenantControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @MockitoBean private RegisterTenantUseCase registerTenantUseCase;
  @MockitoBean private UserMapper userMapper;

  @Test
  @DisplayName("POST /tenants/register - Should return 201 Created when request is valid")
  void registerTenant_shouldReturn201_whenValid() throws Exception {
    // Arrange
    CreatedUserDTO userDto =
        CreatedUserDTO.builder()
            .fullName("Test User")
            .email("test@test.com")
            .password("test!password")
            .contactInfo("Test contact info")
            .build();

    RegisterTenantDTO requestDto =
        RegisterTenantDTO.builder().companyName("Test Company").user(userDto).build();

    Users userModel =
        Users.builder()
            .fullName("Test User")
            .email("test@test.com")
            .password("test!password")
            .role(Roles.OWNER)
            .build();

    UUID userId = UUID.randomUUID();
    OffsetDateTime now = OffsetDateTime.now();

    Users userCreatedModel =
        userModel.toBuilder().id(userId).role(Roles.OWNER).createdAt(now).updatedAt(now).build();

    UserDTO userCreatedDto =
        UserDTO.builder()
            .id(userCreatedModel.getId())
            .fullName(userCreatedModel.getFullName())
            .email(userCreatedModel.getEmail())
            .role(userCreatedModel.getRole())
            .createdAt(userCreatedModel.getCreatedAt())
            .updatedAt(userCreatedModel.getUpdatedAt())
            .build();

    when(userMapper.toModel(any(CreatedUserDTO.class))).thenReturn(userModel);
    when(registerTenantUseCase.register(any(Users.class), any(Tenants.class)))
        .thenReturn(userCreatedModel);
    when(userMapper.toDTO(any(Users.class))).thenReturn(userCreatedDto);

    // Act & Assert
    mockMvc
        .perform(
            post("/tenants/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value(HttpStatus.CREATED.toString()))
        .andExpect(jsonPath("$.data.id").value(userCreatedDto.id().toString()))
        .andExpect(jsonPath("$.data.fullName").value(userCreatedDto.fullName()))
        .andExpect(jsonPath("$.data.email").value(userCreatedDto.email()))
        .andExpect(jsonPath("$.data.role").value(userCreatedDto.role().name()))
        .andExpect(
            jsonPath("$.message").value(TenantsMessages.TENANT_CREATED_SUCCESSFULLY.toString()));
  }

  @Test
  @DisplayName("POST /tenants/register - Should return 400 Bad Request when company name is empty")
  void registerTenant_shouldReturn400_whenCompanyNameIsEmpty() throws Exception {
    // Arrange
    CreatedUserDTO userDto =
        CreatedUserDTO.builder()
            .fullName("Test User")
            .email("test@user.com")
            .password("password123")
            .contactInfo("Test contact info")
            .build();

    RegisterTenantDTO requestDto =
        RegisterTenantDTO.builder().companyName("").user(userDto).build();

    // Act & Assert
    mockMvc
        .perform(
            post("/tenants/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("POST /tenants/register - Should return 400 Bad Request when user email is invalid")
  void registerTenant_shouldReturn400_whenUserEmailIsInvalid() throws Exception {
    // Arrange
    CreatedUserDTO userDto =
        CreatedUserDTO.builder()
            .fullName("Test User")
            .email("invalid-email")
            .password("password123")
            .contactInfo("Test contact info")
            .build();

    RegisterTenantDTO requestDto =
        RegisterTenantDTO.builder().companyName("Test Company").user(userDto).build();

    // Act & Assert
    mockMvc
        .perform(
            post("/tenants/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isBadRequest());
  }
}
