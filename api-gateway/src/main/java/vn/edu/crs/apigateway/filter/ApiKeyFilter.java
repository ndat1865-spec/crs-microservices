package vn.edu.crs.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import vn.edu.crs.apigateway.cache.ApiKeyValidationCache;
import vn.edu.crs.apigateway.client.AuthServiceClient;

import java.util.regex.Pattern;

@Component
public class ApiKeyFilter implements GlobalFilter, Ordered {

    private static final String PARTNER_PATH = "/api/public/courses";
    private static final String COURSES_READ = "courses:read";
    private static final String COURSES_READ_DETAIL = "courses:read-detail";
    private static final Pattern COURSE_DETAIL_PATH = Pattern.compile("^/api/public/courses/[^/]+/?$");

    private final AuthServiceClient authServiceClient;
    private final ApiKeyValidationCache cache;

    public ApiKeyFilter(AuthServiceClient authServiceClient, ApiKeyValidationCache cache) {
        this.authServiceClient = authServiceClient;
        this.cache = cache;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String requiredScope = requiredScope(request);
        if (requiredScope == null) {
            return chain.filter(exchange);
        }

        String apiKey = request.getHeaders().getFirst("X-API-KEY");
        if (apiKey == null || apiKey.isBlank()) {
            return reject(exchange);
        }

        String cacheKey = apiKey + ":" + requiredScope;
        Boolean cached = cache.get(cacheKey);
        if (cached != null) {
            return cached ? chain.filter(exchange) : reject(exchange);
        }

        return authServiceClient.isValidForScope(apiKey, requiredScope)
                .flatMap(valid -> {
                    cache.put(cacheKey, valid);
                    return valid ? chain.filter(exchange) : reject(exchange);
                });
    }

    private String requiredScope(ServerHttpRequest request) {
        if (request.getMethod() != HttpMethod.GET) {
            return null;
        }
        String path = request.getURI().getPath();
        if (PARTNER_PATH.equals(path) || (PARTNER_PATH + "/").equals(path)) {
            return COURSES_READ;
        }
        if (COURSE_DETAIL_PATH.matcher(path).matches()) {
            return COURSES_READ_DETAIL;
        }
        return null;
    }

    private Mono<Void> reject(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
