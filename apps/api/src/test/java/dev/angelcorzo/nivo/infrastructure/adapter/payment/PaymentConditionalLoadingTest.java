package dev.angelcorzo.nivo.infrastructure.adapter.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import dev.angelcorzo.nivo.domain.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.domain.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.domain.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.nivo.domain.usecase.payment.ConfirmPaymentUseCase;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.client.PaymentProviderClient;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.config.PaymentProviderProperties;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.config.WebClientConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.context.ProviderAuthenticationContext;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.service.PendingPaymentsReconciliationService;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.payments.controller.PaymentController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

@DisplayName("Payment Module Conditional Bean Loading Tests")
class PaymentConditionalLoadingTest {

  private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
    .withBean(PaymentProviderProperties.class, () -> {
      PaymentProviderProperties props = new PaymentProviderProperties();
      props.setUrl("http://localhost:8081");
      props.setProviderName("epayco");
      props.setPublicKey("test-key");
      props.setPrivateKey("test-secret");
      props.setExpirationTime(60);
      return props;
    })
    .withBean(ProviderAuthenticationContext.class, () -> mock(ProviderAuthenticationContext.class))
    .withBean(PaymentsRepository.class, () -> mock(PaymentsRepository.class))
    .withBean(TransactionsRepository.class, () -> mock(TransactionsRepository.class))
    .withBean(ConfirmPaymentUseCase.class, () -> mock(ConfirmPaymentUseCase.class))
    .withUserConfiguration(
      EpaycoPaymentAdapter.class,
      DisabledPaymentAdapter.class,
      PaymentProviderClient.class,
      WebClientConfig.class,
      PendingPaymentsReconciliationService.class,
      PaymentController.class);

  @Test
  @DisplayName("When payment.enabled=true, enable all payment beans and use EpaycoPaymentAdapter")
  void whenPaymentEnabled_shouldLoadActiveBeans() {
    contextRunner
      .withPropertyValues("payment.enabled=true")
      .run(
        context -> {
          assertThat(context).hasSingleBean(PaymentProviderGateway.class);
          assertThat(context).hasSingleBean(EpaycoPaymentAdapter.class);
          assertThat(context).doesNotHaveBean(DisabledPaymentAdapter.class);

          assertThat(context).hasSingleBean(PaymentProviderClient.class);
          assertThat(context).hasSingleBean(WebClientConfig.class);
          assertThat(context).hasSingleBean(PendingPaymentsReconciliationService.class);
          assertThat(context).hasSingleBean(PaymentController.class);
        });
  }

  @Test
  @DisplayName("When payment.enabled is missing, matchIfMissing should enable all payment beans")
  void whenPaymentPropertyMissing_shouldLoadActiveBeansByDefault() {
    contextRunner.run(
      context -> {
        assertThat(context).hasSingleBean(PaymentProviderGateway.class);
        assertThat(context).hasSingleBean(EpaycoPaymentAdapter.class);
        assertThat(context).doesNotHaveBean(DisabledPaymentAdapter.class);

        assertThat(context).hasSingleBean(PaymentProviderClient.class);
        assertThat(context).hasSingleBean(WebClientConfig.class);
        assertThat(context).hasSingleBean(PendingPaymentsReconciliationService.class);
        assertThat(context).hasSingleBean(PaymentController.class);
      });
  }

  @Test
  @DisplayName("When payment.enabled=false, load DisabledPaymentAdapter and disable other payment beans")
  void whenPaymentDisabled_shouldOnlyLoadDisabledAdapter() {
    contextRunner
      .withPropertyValues("payment.enabled=false")
      .run(
        context -> {
          assertThat(context).hasSingleBean(PaymentProviderGateway.class);
          assertThat(context).hasSingleBean(DisabledPaymentAdapter.class);
          assertThat(context).doesNotHaveBean(EpaycoPaymentAdapter.class);

          assertThat(context).doesNotHaveBean(PaymentProviderClient.class);
          assertThat(context).doesNotHaveBean(WebClientConfig.class);
          assertThat(context).doesNotHaveBean(PendingPaymentsReconciliationService.class);
          assertThat(context).doesNotHaveBean(PaymentController.class);
        });
  }

  @Test
  @DisplayName("ProviderAuthenticationContext is not loaded when payment.enabled=false")
  void providerAuthenticationContextNotLoadedWhenDisabled() {
    new ApplicationContextRunner()
      .withBean(PaymentProviderProperties.class, PaymentProviderProperties::new)
      .withPropertyValues("payment.enabled=false")
      .withUserConfiguration(ProviderAuthenticationContext.class)
      .run(context -> assertThat(context).doesNotHaveBean(ProviderAuthenticationContext.class));
  }
}
