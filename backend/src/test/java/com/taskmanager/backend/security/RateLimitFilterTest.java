package com.taskmanager.backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class RateLimitFilterTest {

    private MockHttpServletRequest requestTo(String uri, String remoteAddr) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI(uri);
        request.setRemoteAddr(remoteAddr);
        return request;
    }

    @Test
    void doFilter_allowsRequestsToUnprotectedPaths_withoutLimiting() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(true, 10, 15 * 60 * 1000L);
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 50; i++) {
            filter.doFilter(requestTo("/api/tasks", "203.0.113.1"), new MockHttpServletResponse(), chain);
        }

        verify(chain, times(50)).doFilter(any(), any());
    }

    @Test
    void doFilter_blocksLoginAttempts_afterExceedingTheLimit() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(true, 10, 15 * 60 * 1000L);
        FilterChain chain = mock(FilterChain.class);
        MockHttpServletResponse lastResponse = new MockHttpServletResponse();

        for (int i = 0; i < 11; i++) {
            lastResponse = new MockHttpServletResponse();
            filter.doFilter(requestTo("/api/auth/login", "203.0.113.7"), lastResponse, chain);
        }

        assertThat(lastResponse.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        verify(chain, times(10)).doFilter(any(), any());
    }

    @Test
    void doFilter_tracksDifferentIpsIndependently() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(true, 10, 15 * 60 * 1000L);
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 10; i++) {
            filter.doFilter(requestTo("/api/auth/login", "203.0.113.10"), new MockHttpServletResponse(), chain);
        }

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(requestTo("/api/auth/login", "203.0.113.11"), response, chain);

        assertThat(response.getStatus()).isNotEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
    }

    @Test
    void doFilter_neverBlocks_whenDisabled() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(false, 10, 15 * 60 * 1000L);
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 30; i++) {
            filter.doFilter(requestTo("/api/auth/login", "203.0.113.20"), new MockHttpServletResponse(), chain);
        }

        verify(chain, times(30)).doFilter(any(), any());
    }
}
