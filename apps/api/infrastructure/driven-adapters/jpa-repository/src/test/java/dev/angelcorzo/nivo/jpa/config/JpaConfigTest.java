package dev.angelcorzo.nivo.jpa.config;

import org.springframework.core.env.Environment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

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
        .thenReturn(
            "jdbc:postgresql://localhost:5432/nivo_db?currentSchema=test_scheme");
    when(env.getProperty("spring.datasource.username")).thenReturn("postgres");
    when(env.getProperty("spring.datasource.password")).thenReturn("angel2003");

    DBSecret secretResult = jpaConfigUnderTest.dbSecret(env);

    assertEquals(dbSecretUnderTest.getUrl(), secretResult.getUrl());
    assertEquals(dbSecretUnderTest.getUsername(), secretResult.getUsername());
    assertEquals(dbSecretUnderTest.getPassword(), secretResult.getPassword());
  }

  @Test
  void datasourceTest() {
    final DataSource result = jpaConfigUnderTest.datasource(dbSecretUnderTest, "org.postgresql.Driver");

    assertNotNull(result);
  }

  @Test
  void entityManagerFactoryTest() {

    final LocalContainerEntityManagerFactoryBean result =
        jpaConfigUnderTest.entityManagerFactory(dataSource, "dialect", beanFactory);

    assertNotNull(result);
  }
}
