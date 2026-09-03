package vn.edu.crs.authservice.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import vn.edu.crs.authservice.dto.ApiKeyCreateRequestDTO;
import vn.edu.crs.authservice.repository.ApiKeyRepository;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ApiKeyServiceTests {

    @Autowired
    private ApiKeyService service;

    @Autowired
    private ApiKeyRepository repository;

    @Test
    void createsValidKeyAndNormalizesScopes() {
        ApiKeyCreateRequestDTO request = new ApiKeyCreateRequestDTO();
        request.setOwnerName("  Đối tác Test  ");
        request.setScopes("courses:read, courses:read-detail, courses:read");
        request.setValidDays(30);

        var created = service.create(request);

        assertThat(created.getKeyValue()).startsWith("crs_").hasSize(36);
        assertThat(created.getOwnerName()).isEqualTo("Đối tác Test");
        assertThat(created.getScopes()).isEqualTo("courses:read,courses:read-detail");
        assertThat(created.getStatus()).isEqualTo("ACTIVE");
        assertThat(created.getExpiresAt()).isAfter(LocalDateTime.now().plusDays(29));
        assertThat(service.isValidForScope(created.getKeyValue(), "courses:read")).isTrue();
        assertThat(service.isValidForScope(created.getKeyValue(), "unknown:scope")).isFalse();
    }

    @Test
    void revokedAndExpiredKeysAreRejected() {
        ApiKeyCreateRequestDTO request = new ApiKeyCreateRequestDTO();
        request.setOwnerName("Đối tác thu hồi");
        request.setScopes("courses:read");
        var created = service.create(request);

        service.revoke(created.getId());
        assertThat(service.isValidForScope(created.getKeyValue(), "courses:read")).isFalse();

        var expired = repository.findById(created.getId()).orElseThrow();
        expired.setStatus("ACTIVE");
        expired.setExpiresAt(LocalDateTime.now().minusSeconds(1));
        repository.save(expired);
        assertThat(service.isValidForScope(created.getKeyValue(), "courses:read")).isFalse();
    }
}
