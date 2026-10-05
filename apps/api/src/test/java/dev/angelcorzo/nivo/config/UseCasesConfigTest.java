package dev.angelcorzo.nivo.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.aop.framework.autoproxy.BeanNameAutoProxyCreator;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.interceptor.TransactionInterceptor;

@DisplayName("UseCasesConfig Unit Tests")
public class UseCasesConfigTest {

  @Test
  @DisplayName("Should create transaction manager, interceptor, and auto proxy beans")
  void testUseCasesConfigBeans() {
    UseCasesConfig config = new UseCasesConfig();
    LocalContainerEntityManagerFactoryBean factoryBean =
        mock(LocalContainerEntityManagerFactoryBean.class);

    PlatformTransactionManager txManager = config.transactionManager(factoryBean);
    assertNotNull(txManager);

    TransactionInterceptor interceptor = config.customTransactionInterceptor(txManager);
    assertNotNull(interceptor);

    BeanNameAutoProxyCreator autoProxy = config.transactionAutoProxy();
    assertNotNull(autoProxy);
  }
}