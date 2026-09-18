package com.taskmanager.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * A small in-memory sliding-window rate limiter for the unauthenticated auth endpoints
 * (register/login), to slow down credential-stuffing and brute-force attempts. Keyed by
 * client IP + path. Not a substitute for a proper API gateway / WAF in production, but a
 * meaningful baseline for a single-instance deployment.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> PROTECTED_PATHS = Set.of("/api/auth/login", "/api/auth/register");

    private final boolean enabled;
    private final int maxAttempts;
    private final long windowMillis;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, Window> attemptsByKey = new ConcurrentHashMap<>();

    public RateLimitFilter(
            @Value("${app.rate-limit.enabled:true}") boolean enabled,
            @Value("${app.rate-limit.max-attempts:10}") int maxAttempts,
            @Value("${app.rate-limit.window-ms:900000}") long windowMillis) {
        this.enabled = enabled;
        this.maxAttempts = maxAttempts;
        this.windowMillis = windowMillis;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        if (!enabled || !PROTECTED_PATHS.contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = clientIp(request) + ":" + request.getRequestURI();
        Window window = attemptsByKey.computeIfAbsent(key, k -> new Window());

        if (window.isExpired(windowMillis)) {
            window.reset(windowMillis);
        }

        if (window.count.incrementAndGet() > maxAttempts) {
            respondTooManyRequests(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void respondTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        var body = Map.of(
                "status", HttpStatus.TOO_MANY_REQUESTS.value(),
                "error", HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                "message", "Too many attempts. Please try again later."
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static final class Window {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile Instant windowStart = Instant.now();

        boolean isExpired(long windowMillis) {
            return Instant.now().isAfter(windowStart.plusMillis(windowMillis));
        }

        void reset(long windowMillis) {
            synchronized (this) {
                if (isExpired(windowMillis)) {
                    count.set(0);
                    windowStart = Instant.now();
                }
            }
        }
    }
}
