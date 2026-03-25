package dev.angelcorzo.neoparking.config;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.aop.framework.autoproxy.BeanNameAutoProxyCreator;
import org.springframework.context.annotation.*;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.interceptor.*;

@Configuration
@EnableTransactionManagement
@EnableAspectJAutoProxy
@ComponentScan(
    basePackages = "dev.angelcorzo.neoparking.usecase",
    includeFilters = {
      @ComponentScan.Filter(type = FilterType.REGEX, pattern = "^.+UseCase$"),
      @ComponentScan.Filter(type = FilterType.REGEX, pattern = "^.+Notifier$")
    },
    useDefaultFilters = false)
@RequiredArgsConstructor
public class UseCasesConfig {
  /**
   * Configures and provides the {@link PlatformTransactionManager} bean. This bean is responsible
   * for managing transactions in the application.
   *
   * @param entityManagerFactory The JPA {@link jakarta.persistence.EntityManagerFactory}.
   * @return A configured {@link JpaTransactionManager}.
   */
  @Bean
  public PlatformTransactionManager transactionManager(
      LocalContainerEntityManagerFactoryBean entityManagerFactory) {
    JpaTransactionManager transactionManager = new JpaTransactionManager();
    transactionManager.setEntityManagerFactory(entityManagerFactory.getObject());
    return transactionManager;
  }

  @Bean
  public TransactionInterceptor customTransactionInterceptor(
      PlatformTransactionManager transactionManager) {
    TransactionInterceptor interceptor = new TransactionInterceptor();
    interceptor.setTransactionManager(transactionManager);

    NameMatchTransactionAttributeSource attributeSource = new NameMatchTransactionAttributeSource();
    RuleBasedTransactionAttribute txAttribute = new RuleBasedTransactionAttribute();
    txAttribute.setPropagationBehavior(RuleBasedTransactionAttribute.PROPAGATION_REQUIRED);

    txAttribute.setRollbackRules(
        Collections.singletonList(new RollbackRuleAttribute(Exception.class)));

    Map<String, TransactionAttribute> txMap = new HashMap<>();
    txMap.put("*", txAttribute);
    attributeSource.setNameMap(txMap);

    interceptor.setTransactionAttributeSource(attributeSource);
    return interceptor;
  }

  @Bean
  public BeanNameAutoProxyCreator transactionAutoProxy() {
    BeanNameAutoProxyCreator autoProxyCreator = new BeanNameAutoProxyCreator();
    autoProxyCreator.setProxyTargetClass(true);
    autoProxyCreator.setInterceptorNames("customTransactionInterceptor");
    autoProxyCreator.setBeanNames("*UseCase");

    return autoProxyCreator;
  }
}
