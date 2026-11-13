package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

@DisplayName("PublicApiRateLimitFilter Unit Tests")
class PublicApiRateLimitFilterTest {

  private TokenBucketRateLimiter rateLimiter;
  private BackendOperationsMetricsManager metricsManager;
  private PublicApiRateLimitFilter filter;
  private FilterChain filterChain;

  @BeforeEach
  void setUp() {
    rateLimiter = mock(TokenBucketRateLimiter.class);
    metricsManager = mock(BackendOperationsMetricsManager.class);
    filter = new PublicApiRateLimitFilter(rateLimiter, metricsManager);
    filterChain = mock(FilterChain.class);
  }

  @Test
  @DisplayName("Should pass through non-public requests without consuming rate limit tokens")
  void shouldPassThroughNonPublicRequests() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/private/data");
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    verifyNoInteractions(rateLimiter);
  }

  @Test
  @DisplayName("Should allow public request with valid X-Forwarded-For IP")
  void shouldAllowPublicRequestWithValidForwardedIp() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/public/simulator/calculate");
    request.addHeader("X-Forwarded-For", "203.0.113.195, 70.41.3.18");
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(rateLimiter.tryConsume("203.0.113.195")).thenReturn(true);
    when(rateLimiter.getRemainingTokens("203.0.113.195")).thenReturn(59L);

    filter.doFilterInternal(request, response, filterChain);

    assertThat(response.getHeader("X-RateLimit-Limit")).isEqualTo("60");
    assertThat(response.getHeader("X-RateLimit-Remaining")).isEqualTo("59");
    verify(filterChain).doFilter(request, response);
  }

  @Test
  @DisplayName("Should fallback to remote address when X-Forwarded-For is malformed or invalid")
  void shouldFallbackToRemoteAddrWhenForwardedHeaderInvalid() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/public/parkings/availability");
    request.addHeader("X-Forwarded-For", "invalid!ip<script>");
    request.setRemoteAddr("192.168.1.50");
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(rateLimiter.tryConsume("192.168.1.50")).thenReturn(true);
    when(rateLimiter.getRemainingTokens("192.168.1.50")).thenReturn(58L);

    filter.doFilterInternal(request, response, filterChain);

    assertThat(response.getHeader("X-RateLimit-Limit")).isEqualTo("60");
    assertThat(response.getHeader("X-RateLimit-Remaining")).isEqualTo("58");
    verify(filterChain).doFilter(request, response);
  }

  @Test
  @DisplayName("Should use unknown when both X-Forwarded-For and remote address are missing")
  void shouldUseUnknownWhenNoIpAvailable() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/public/ping");
    request.setRemoteAddr("");
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(rateLimiter.tryConsume("unknown")).thenReturn(true);
    when(rateLimiter.getRemainingTokens("unknown")).thenReturn(60L);

    filter.doFilterInternal(request, response, filterChain);

    verify(rateLimiter).tryConsume("unknown");
    verify(filterChain).doFilter(request, response);
  }

  @Test
  @DisplayName("Should block and return 429 Too Many Requests when rate limit is exceeded")
  void shouldReturn429WhenRateLimitExceeded() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/public/simulator/calculate");
    request.setRemoteAddr("10.0.0.1");
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(rateLimiter.tryConsume("10.0.0.1")).thenReturn(false);
    when(rateLimiter.getSecondsUntilRefill("10.0.0.1")).thenReturn(30L);

    filter.doFilterInternal(request, response, filterChain);

    assertThat(response.getStatus()).isEqualTo(429);
    assertThat(response.getHeader("Retry-After")).isEqualTo("30");
    assertThat(response.getHeader("X-RateLimit-Remaining")).isEqualTo("0");
    assertThat(response.getContentAsString()).contains("Too Many Requests");
    verify(metricsManager).recordPublicAvailabilityRateLimited();
    verify(filterChain, never()).doFilter(request, response);
  }
}
