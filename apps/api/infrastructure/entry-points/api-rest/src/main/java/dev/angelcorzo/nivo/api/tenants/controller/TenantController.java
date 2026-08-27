package dev.angelcorzo.nivo.api.tenants.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.specialpolicies.dto.CreateSpecialPolicies;
import dev.angelcorzo.nivo.api.specialpolicies.dto.SpecialPoliciesDTO;
import dev.angelcorzo.nivo.api.specialpolicies.enums.SpecialPoliciesMessages;
import dev.angelcorzo.nivo.api.specialpolicies.mapper.SpecialPoliciesMapper;
import dev.angelcorzo.nivo.api.tenants.dto.RegisterTenantDTO;
import dev.angelcorzo.nivo.api.tenants.enums.TenantsMessages;
import dev.angelcorzo.nivo.api.users.dto.UserDTO;
import dev.angelcorzo.nivo.api.users.mappers.UserMapper;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.usecase.createspecialpolicy.CreateSpecialPolicyUseCase;
import dev.angelcorzo.nivo.usecase.registertenant.RegisterTenantUseCase;
import dev.angelcorzo.nivo.usecase.showspecialpoliciesbytenant.ShowSpecialPoliciesByTenantUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Tenant registration and special policies management")
public class TenantController {
  private final UserMapper userMapper;
  private final SpecialPoliciesMapper specialPoliciesMapper;
  private final AuthenticationContextGateway authenticationContext;

  private final RegisterTenantUseCase registerTenantUseCase;
  private final CreateSpecialPolicyUseCase createSpecialPolicyUseCase;
  private final ShowSpecialPoliciesByTenantUseCase showSpecialPoliciesByTenantUseCase;

  @Operation(
      summary = "List special policies for tenant",
      description = "Retrieves all active special policies configured for the authenticated tenant")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Special policies retrieved successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required")
  })
  @GetMapping("/special-policies")
  @PreAuthorize("hasRole('OPERATOR')")
  public Response<Iterable<SpecialPoliciesDTO>> showSpecialPoliciesByTenant() {
    final UUID tenantId = this.getTenantId();

    final List<SpecialPoliciesDTO> specialPolicies =
        this.showSpecialPoliciesByTenantUseCase.execute(tenantId).stream()
            .map(specialPoliciesMapper::toDto)
            .toList();

    return Response.ok(
        specialPolicies, SpecialPoliciesMessages.SHOW_SPECIAL_POLICIES_BY_TENANT.toString());
  }

  @Operation(
      summary = "Register new tenant and owner",
      description = "Registers a new tenant organization along with its initial owner user account",
      security = {})
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Tenant registered successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid registration payload")
  })
  @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  Response<UserDTO> registerTenant(@RequestBody @Valid RegisterTenantDTO registerTenant) {
    final Users user = this.userMapper.toModel(registerTenant.user());
    final Tenants tenant = Tenants.builder().companyName(registerTenant.companyName()).build();

    final Users userCreated = this.registerTenantUseCase.register(user, tenant);

    return Response.created(
        this.userMapper.toDTO(userCreated), TenantsMessages.TENANT_CREATED_SUCCESSFULLY.toString());
  }

  @Operation(
      summary = "Create special policy",
      description = "Creates a new special policy (discount/surcharge) for the current tenant")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Special policy created successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid policy payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Owner role required")
  })
  @PostMapping("/create/special-policy")
  @PreAuthorize("hasRole('OWNER')")
  public Response<SpecialPoliciesDTO> createAtSpecialPolicies(
      @Valid @RequestBody CreateSpecialPolicies policies) {

    final CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand specialPolicyCommand =
        this.specialPoliciesMapper.toModel(policies).toBuilder()
            .tenantId(this.getTenantId())
            .build();

    final SpecialPolicies specialPoliciesCreated =
        this.createSpecialPolicyUseCase.execute(specialPolicyCommand);

    return Response.created(
        this.specialPoliciesMapper.toDto(specialPoliciesCreated),
        SpecialPoliciesMessages.SHOW_SPECIAL_POLICIES_BY_TENANT.toString());
  }

  private UUID getTenantId() {
    return this.authenticationContext.getCurrentTenantId();
  }
}
