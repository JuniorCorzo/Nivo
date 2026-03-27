package dev.angelcorzo.nivo.jpa;

import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Minimal Spring Boot application class for tests in the jpa-repository module.
 * This class is placed in a parent package of the tests, so @DataJpaTest and other
 * test slices can find it automatically without needing to load the main application from another module.
 */
@SpringBootApplication
public class TestApplication {
}
