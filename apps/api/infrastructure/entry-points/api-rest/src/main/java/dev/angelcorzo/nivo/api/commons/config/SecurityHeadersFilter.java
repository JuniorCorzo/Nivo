package dev.angelcorzo.nivo.api.commons.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.Set;

@Configuration
@WebFilter("/**")
public class SecurityHeadersFilter implements Filter {

    private static final Set<String> DOC_PATH_PREFIXES = Set.of(
        "/scalar", "/docs", "/swagger-ui", "/v3/api-docs", "/api-docs",
        "/swagger-resources", "/webjars"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String servletPath = httpRequest.getServletPath() != null ? httpRequest.getServletPath() : "";
        String requestUri = httpRequest.getRequestURI() != null ? httpRequest.getRequestURI() : "";
        boolean isDocPath = DOC_PATH_PREFIXES.stream().anyMatch(prefix ->
            servletPath.startsWith(prefix) || requestUri.startsWith(prefix) || requestUri.contains(prefix)
        );

        if (!isDocPath) {
            httpResponse.setHeader("Content-Security-Policy", "default-src 'self'; frame-ancestors 'self'; form-action 'self'");
        }

        httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000;");
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        httpResponse.setHeader("Server", "");
        httpResponse.setHeader("Cache-Control", "no-store");
        httpResponse.setHeader("Pragma", "no-cache");
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        chain.doFilter(request, response);
    }
}
