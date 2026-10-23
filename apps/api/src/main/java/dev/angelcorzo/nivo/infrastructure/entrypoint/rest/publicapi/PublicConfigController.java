package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import dev.angelcorzo.nivo.domain.model.commons.valueobjects.AppProperties;

@RestController
@RequestMapping("/public/config")
@Tag(name = "Public Configuration", description = "Public feature flags and application configuration")
@RequiredArgsConstructor
public class PublicConfigController {

  private final AppProperties appProperties;

  @GetMapping
  @Operation(summary = "Get public application configuration", description = "Retrieves public feature flags such as account creation status")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Public configuration retrieved successfully")
  })
  public ResponseEntity<PublicConfigResponse> getConfig() {
    return ResponseEntity.ok(new PublicConfigResponse(this.appProperties.isAccountCreationEnabled()));
  }
}
