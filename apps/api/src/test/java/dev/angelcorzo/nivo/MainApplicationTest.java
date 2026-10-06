package dev.angelcorzo.nivo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@SpringBootTest(classes = MainApplication.class)
class MainApplicationTest {

  @Test
  @DisplayName("Should successfully load full Spring Boot application context")
  void contextLoads() {}
}
