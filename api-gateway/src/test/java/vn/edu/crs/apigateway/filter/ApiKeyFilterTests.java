package vn.edu.crs.apigateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import vn.edu.crs.apigateway.cache.ApiKeyValidationCache;
import vn.edu.crs.apigateway.client.AuthServiceClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ApiKeyFilterTests {

    private AuthServiceClient authServiceClient;
    private GatewayFilterChain chain;
    private ApiKeyFilter filter;

    @BeforeEach
    void setUp() {
        authServiceClient = mock(AuthServiceClient.class);
        chain = mock(GatewayFilterChain.class);
        when(chain.filter(org.mockito.ArgumentMatchers.any())).thenReturn(Mono.empty());
        filter = new ApiKeyFilter(authServiceClient, new ApiKeyValidationCache());
    }

    @Test
    void rejectsPartnerRequestWithoutApiKey() {
        var exchange = exchange("/api/public/courses", null);

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(chain, never()).filter(exchange);
    }

    @Test
    void validatesThenCachesKeyByScope() {
        when(authServiceClient.isValidForScope("partner-key", "courses:read")).thenReturn(Mono.just(true));
        var first = exchange("/api/public/courses", "partner-key");
        var second = exchange("/api/public/courses", "partner-key");

        filter.filter(first, chain).block();
        filter.filter(second, chain).block();

        verify(authServiceClient, times(1)).isValidForScope("partner-key", "courses:read");
        verify(chain, times(2)).filter(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void requiresDetailScopeForCourseDetail() {
        when(authServiceClient.isValidForScope("partner-key", "courses:read-detail"))
                .thenReturn(Mono.just(false));
        var exchange = exchange("/api/public/courses/42", "partner-key");

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(authServiceClient).isValidForScope("partner-key", "courses:read-detail");
    }

    @Test
    void leavesNonPartnerRoutesUntouched() {
        var exchange = exchange("/api/courses", null);

        filter.filter(exchange, chain).block();

        verify(chain).filter(exchange);
        verify(authServiceClient, never()).isValidForScope(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString()
        );
    }

    private MockServerWebExchange exchange(String path, String apiKey) {
        MockServerHttpRequest.BaseBuilder<?> request = MockServerHttpRequest.get(path);
        if (apiKey != null) {
            request.header("X-API-KEY", apiKey);
        }
        return MockServerWebExchange.from(request.build());
    }
}
