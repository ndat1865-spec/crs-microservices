package vn.edu.crs.authservice.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Table(name="app_user") @Data @NoArgsConstructor @AllArgsConstructor
public class User { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,unique=true) private String username; @Column(nullable=false) private String password; @Column(nullable=false) private String role; }
