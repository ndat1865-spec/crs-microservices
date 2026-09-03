package vn.edu.crs.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.crs.authservice.dto.ApiKeyCreateRequestDTO;
import vn.edu.crs.authservice.dto.ApiKeyResponseDTO;
import vn.edu.crs.authservice.entity.ApiKey;
import vn.edu.crs.authservice.repository.ApiKeyRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private static final String ACTIVE = "ACTIVE";
    private static final String REVOKED = "REVOKED";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ApiKeyRepository apiKeyRepository;

    @Transactional
    public ApiKeyResponseDTO create(ApiKeyCreateRequestDTO dto) {
        LocalDateTime now = LocalDateTime.now();
        ApiKey apiKey = new ApiKey();
        apiKey.setKeyValue(generateRandomKey());
        apiKey.setOwnerName(dto.getOwnerName().trim());
        apiKey.setScopes(normalizeScopes(dto.getScopes()));
        apiKey.setStatus(ACTIVE);
        apiKey.setCreatedAt(now);
        apiKey.setExpiresAt(dto.getValidDays() == null ? null : now.plusDays(dto.getValidDays()));
        return toDTO(apiKeyRepository.save(apiKey));
    }

    @Transactional(readOnly = true)
    public List<ApiKeyResponseDTO> getAll() {
        return apiKeyRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional
    public void revoke(Long id) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy API Key id = " + id));
        apiKey.setStatus(REVOKED);
    }

    @Transactional(readOnly = true)
    public boolean isValidForScope(String keyValue, String requiredScope) {
        LocalDateTime now = LocalDateTime.now();
        return apiKeyRepository.findByKeyValue(keyValue)
                .filter(key -> ACTIVE.equals(key.getStatus()))
                .filter(key -> key.getExpiresAt() == null || key.getExpiresAt().isAfter(now))
                .map(ApiKey::getScopes)
                .stream()
                .flatMap(scopes -> Arrays.stream(scopes.split(",")))
                .map(String::trim)
                .anyMatch(requiredScope::equals);
    }

    private String normalizeScopes(String scopes) {
        return Arrays.stream(scopes.split(","))
                .map(String::trim)
                .filter(scope -> !scope.isEmpty())
                .distinct()
                .reduce((left, right) -> left + "," + right)
                .orElseThrow(() -> new IllegalArgumentException("Danh sách scope không được để trống"));
    }

    private String generateRandomKey() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return "crs_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private ApiKeyResponseDTO toDTO(ApiKey key) {
        return new ApiKeyResponseDTO(
                key.getId(),
                key.getKeyValue(),
                key.getOwnerName(),
                key.getScopes(),
                key.getStatus(),
                key.getExpiresAt(),
                key.getCreatedAt()
        );
    }
}
