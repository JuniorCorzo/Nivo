package dev.angelcorzo.nivo.api.security.config;

import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.awt.*;
import java.security.interfaces.RSAPublicKey;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authorization.AuthorizationManagerFactory;
import org.springframework.security.authorization.DefaultAuthorizationManagerFactory;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Slf4j
@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityChain {
  private final CustomJwtAuthenticationConverter jwtAuthenticationConverter;
  private final RSAPublicKey rsaPublicKey;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http.csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(
            sessionManagement ->
                sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth -> {
              auth.requestMatchers(
                      "/tenants/register",
                      "/users/accept-invitation/**",
                      "/actuator/**",
                      "/swagger-ui/**",
                      "/v3/api-docs/**",
                      "/swagger-resources/**",
                      "/swagger-resources",
                      "/webjars/**",
                      "/v3/api-docs/**",
                      "/context-path/**",
                      "/auth/**")
                  .permitAll();

              auth.anyRequest().authenticated();
            })
        .oauth2ResourceServer(
            oauth2 ->
                oauth2.jwt(
                    jwt ->
                        jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                            .decoder(jwtDecoder())))
        .build();
  }

  @Bean
  GrantedAuthorityDefaults grantedAuthorityDefaults() {
    return new GrantedAuthorityDefaults("ROLE_");
  }

  @Bean
  RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.withRolePrefix("ROLE_")
        .role(Roles.SUPERADMIN.name())
        .implies(Roles.OWNER.name())
        .role(Roles.OWNER.name())
        .implies(Roles.MANAGER.name())
        .role(Roles.MANAGER.name())
        .implies(Roles.OPERATOR.name())
        .role(Roles.OPERATOR.name())
        .implies(Roles.DRIVER.name())
        .role(Roles.DRIVER.name())
        .implies(Roles.AUDITOR.name())
        .build();
  }

  @Bean
  public <T> AuthorizationManagerFactory<T> authorizationManagerFactory(
      RoleHierarchy roleHierarchy) {
    final DefaultAuthorizationManagerFactory<T> factory =
        new DefaultAuthorizationManagerFactory<>();
    factory.setRoleHierarchy(roleHierarchy);

    return factory;
  }

  @Bean
  public MethodSecurityExpressionHandler methodSecurityExpressionHandler(
      AuthorizationManagerFactory<MethodInvocation> authorizationManagerFactory) {
    DefaultMethodSecurityExpressionHandler expressionHandler =
        new DefaultMethodSecurityExpressionHandler();

    expressionHandler.setAuthorizationManagerFactory(authorizationManagerFactory);

    return expressionHandler;
  }

  @Bean
  JwtDecoder jwtDecoder() {
    return NimbusJwtDecoder.withPublicKey(rsaPublicKey).build();
  }
}
