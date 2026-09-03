package vn.edu.crs.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ApiKeyCreateRequestDTO {

    @NotBlank(message = "Tên đối tác không được để trống")
    private String ownerName;

    @NotBlank(message = "Danh sách scope không được để trống")
    private String scopes;

    @Positive(message = "Số ngày hiệu lực phải lớn hơn 0")
    private Integer validDays;
}
