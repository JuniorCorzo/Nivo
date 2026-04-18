package dev.angelcorzo.nivo.jpa.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.core.env.Environment;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

class JpaConfigTest {

  @Mock DataSource dataSource;
  @Mock ConfigurableListableBeanFactory beanFactory;

  private DBSecret dbSecretUnderTest;
  private JpaConfig jpaConfigUnderTest;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);

    jpaConfigUnderTest = new JpaConfig();

    dbSecretUnderTest =
        DBSecret.builder()
            .username("postgres")
            .password("angel2003")
            .url("jdbc:postgresql://localhost:5432/nivo_db?currentSchema=test_scheme")
            .build();
  }

  @Test
  void dbSecretTest() {
    Environment env = Mockito.mock(Environment.class);

    when(env.getProperty("spring.datasource.url"))
        .thenReturn("jdbc:postgresql://localhost:5432/nivo_db?currentSchema=test_scheme");
    when(env.getProperty("spring.datasource.username")).thenReturn("postgres");
    when(env.getProperty("spring.datasource.password")).thenReturn("angel2003");

    DBSecret secretResult = jpaConfigUnderTest.dbSecret(env);

    assertEquals(dbSecretUnderTest.getUrl(), secretResult.getUrl());
    assertEquals(dbSecretUnderTest.getUsername(), secretResult.getUsername());
    assertEquals(dbSecretUnderTest.getPassword(), secretResult.getPassword());
  }

  @Test
  void datasourceTest() {
    AtomicReference<HikariConfig> capturedConfig = new AtomicReference<>();

    try (MockedConstruction<HikariDataSource> mockedConstruction =
        Mockito.mockConstruction(
            HikariDataSource.class,
            (mock, context) -> capturedConfig.set((HikariConfig) context.arguments().getFirst()))) {
      HikariDataSource result =
          (HikariDataSource)
              jpaConfigUnderTest.datasource(dbSecretUnderTest, "org.postgresql.Driver", "nivo");

      assertNotNull(result);
      assertEquals(1, mockedConstruction.constructed().size());

      HikariConfig usedConfig = capturedConfig.get();

      assertEquals(dbSecretUnderTest.getUrl(), usedConfig.getJdbcUrl());
      assertEquals(dbSecretUnderTest.getUsername(), usedConfig.getUsername());
      assertEquals(dbSecretUnderTest.getPassword(), usedConfig.getPassword());
      assertEquals("org.postgresql.Driver", usedConfig.getDriverClassName());
      assertEquals("nivo", usedConfig.getSchema());
      assertEquals("nivo,public", usedConfig.getDataSourceProperties().getProperty("currentSchema"));
      assertEquals("SET search_path TO nivo,public", usedConfig.getConnectionInitSql());
    }
  }

  @Test
  void entityManagerFactoryTest() {
    LocalContainerEntityManagerFactoryBean result =
        jpaConfigUnderTest.entityManagerFactory(
            dataSource,
            "dialect",
            "nivo",
            "org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy",
            "true",
            beanFactory);

    assertNotNull(result);
    assertEquals("dialect", result.getJpaPropertyMap().get("hibernate.dialect"));
    assertEquals("nivo", result.getJpaPropertyMap().get("hibernate.default_schema"));
    assertEquals(
        "org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy",
        result.getJpaPropertyMap().get("hibernate.physical_naming_strategy"));
    assertEquals("true", result.getJpaPropertyMap().get("hibernate.globally_quoted_identifiers"));
  }
}
