package dev.angelcorzo.nivo.jpa.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.hibernate.SpringBeanContainer;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.Properties;

/**
 * Configuration class for JPA (Java Persistence API) settings.
 *
 * <p>
 * This class sets up the data source, entity manager factory, and other
 * JPA-related beans required for database interaction in the application.
 * </p>
 *
 * <p>
 * <strong>Layer:</strong> Infrastructure (Driven Adapter - JPA Config)
 * </p>
 * <p>
 * <strong>Responsibility:</strong> To configure and provide JPA-related
 * components.
 * </p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see DBSecret
 */
@Configuration
public class JpaConfig {

  /**
   * Creates a {@link DBSecret} bean by extracting database credentials from the
   * environment.
   *
   * @param env The Spring {@link Environment} to retrieve properties from.
   * @return A {@link DBSecret} object containing database connection details.
   */
  @Bean
  public DBSecret dbSecret(Environment env) {
    String url;
    try {
      url = env.getProperty("spring.datasource.url");
    } catch (Exception ex) {
      url = null;
    }

    if (url == null || url.isBlank() || url.contains("${")) {
      String host = env.getProperty("DB_HOST", "database");
      String port = env.getProperty("DB_PORT", "5432");
      String defaultDb = env.getProperty("POSTGRES_DB", "nivo_db");
      String name = env.getProperty("DB_NAME", defaultDb != null ? defaultDb : "nivo_db");
      String sslMode = env.getProperty("DB_SSL_MODE", "require");
      String channelBinding = env.getProperty("DB_CHANNEL_BINDING", "require");
      url = String.format(
          "jdbc:postgresql://%s:%s/%s?currentSchema=nivo&sslmode=%s&channelBinding=%s",
          host, port, name, sslMode, channelBinding);
    }

    String defaultUser = env.getProperty("DB_USERNAME", "postgres");
    String username = env.getProperty("spring.datasource.username");
    if (username == null || username.isBlank()) {
      username = env.getProperty("spring.datasource.username", defaultUser != null ? defaultUser : "postgres");
    }

    String defaultPassword = env.getProperty("DB_PASSWORD", "postgres");
    String password = env.getProperty("spring.datasource.password");
    if (password == null || password.isBlank()) {
      password = env.getProperty("spring.datasource.password", defaultPassword != null ? defaultPassword : "postgres");
    }

    return DBSecret.builder()
        .url(url)
        .username(username)
        .password(password)
        .build();
  }

  /**
   * Configures and provides the {@link DataSource} bean using HikariCP.
   *
   * @param secret      The {@link DBSecret} containing database credentials.
   * @param driverClass The JDBC driver class name, injected from properties.
   * @return A configured HikariCP {@link DataSource}.
   */
  @Bean
  public DataSource datasource(
      DBSecret secret,
      @Value("${spring.datasource.driverClassName}") String driverClass,
      @Value("${spring.jpa.properties.hibernate.default_schema}") String defaultSchema) {
    HikariConfig config = new HikariConfig();
    String searchPath = defaultSchema + ",public";
    config.setJdbcUrl(secret.getUrl());
    config.setUsername(secret.getUsername());
    config.setPassword(secret.getPassword());
    config.setDriverClassName(driverClass);
    config.setSchema(defaultSchema);
    config.addDataSourceProperty("currentSchema", searchPath);
    config.setConnectionInitSql("SET search_path TO " + searchPath);
    return new HikariDataSource(config);
  }

  /**
   * Configures and provides the {@link LocalContainerEntityManagerFactoryBean}.
   * This bean is responsible for creating the JPA
   * {@link jakarta.persistence.EntityManagerFactory}.
   *
   * @param dataSource The configured {@link DataSource}.
   * @param dialect    The Hibernate dialect, injected from properties.
   * @return A configured {@link LocalContainerEntityManagerFactoryBean}.
   */
  @Bean
  public LocalContainerEntityManagerFactoryBean entityManagerFactory(
      DataSource dataSource,
      @Value("${spring.jpa.databasePlatform}") String dialect,
      @Value("${spring.jpa.properties.hibernate.default_schema}") String defaultSchema,
      ConfigurableListableBeanFactory beanFactory) {
    LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
    em.setDataSource(dataSource);
    em.setPackagesToScan("dev.angelcorzo.nivo.jpa");

    JpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
    em.setJpaVendorAdapter(vendorAdapter);

    Properties properties = new Properties();
    properties.setProperty("hibernate.dialect", dialect);
    properties.setProperty("hibernate.default_schema", defaultSchema);
    properties.setProperty("hibernate.jdbc.time_zone", "UTC");

    em.setJpaProperties(properties);
    em.getJpaPropertyMap().put("hibernate.resource.beans.container", new SpringBeanContainer(beanFactory));

    return em;
  }

}
