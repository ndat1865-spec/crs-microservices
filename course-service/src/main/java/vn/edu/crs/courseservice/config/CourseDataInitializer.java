package vn.edu.crs.courseservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourseDataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        insertIfMissing(1L, "Lap trinh Java co ban", 3, 40, 12);
        insertIfMissing(2L, "Co so du lieu", 4, 35, 0);
    }

    private void insertIfMissing(Long id, String tenMonHoc, int soTinChi, int soChoToiDa, int soChoConLai) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from course where id = ?",
                Integer.class,
                id
        );

        if (count != null && count == 0) {
            jdbcTemplate.update(
                    "insert into course (id, ten_mon_hoc, so_tin_chi, so_cho_toi_da, so_cho_con_lai) values (?, ?, ?, ?, ?)",
                    id,
                    tenMonHoc,
                    soTinChi,
                    soChoToiDa,
                    soChoConLai
            );
        }
    }
}
