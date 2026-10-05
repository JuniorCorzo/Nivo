package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@RequiredArgsConstructor
public class PublicApiRateLimitFilter extends OncePerRequestFilter {

  private final TokenBucketRateLimiter rateLimiter;
  private final BackendOperationsMetricsManager metricsManager;

  @Override
  protected void doFilterInternal(
      final HttpServletRequest request, final HttpServletResponse response, final FilterChain filterChain)
      throws ServletException, IOException {

    final String uri = request.getRequestURI();
    if (!isPublicApi(uri)) {
      filterChain.doFilter(request, response);
      return;
    }

    final String clientIp = resolveClientIp(request);
    final boolean allowed = rateLimiter.tryConsume(clientIp);

    response.setHeader("X-RateLimit-Limit", "60");

    if (allowed) {
      final long remaining = rateLimiter.getRemainingTokens(clientIp);
      response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
      filterChain.doFilter(request, response);
    } else {
      final long retryAfter = rateLimiter.getSecondsUntilRefill(clientIp);
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      response.setHeader("Retry-After", String.valueOf(retryAfter));
      response.setHeader("X-RateLimit-Remaining", "0");
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);

      metricsManager.recordPublicAvailabilityRateLimited();
      metricsManager.recordPublicAvailabilityRequest(HttpStatus.TOO_MANY_REQUESTS.value());

      response
          .getWriter()
          .write(
              """
              {"error":"Too Many Requests","message":"Rate limit of 60 requests per minute exceeded. Please try again later."}
              """);
    }
  }

  private boolean isPublicApi(final String uri) {
    return uri.contains("/public/parkings/") || uri.startsWith("/public/") || uri.contains("/api/v1/public/");
  }

  private String resolveClientIp(final HttpServletRequest request) {
    final String xForwarded = request.getHeader("X-Forwarded-For");
    if (xForwarded != null && !xForwarded.isBlank()) {
      return xForwarded.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}
