package dev.angelcorzo.nivo.infrastructure.entrypoint.websocket.config;

import dev.angelcorzo.nivo.domain.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.domain.model.payments.observer.PaymentEventBroker;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ObservableConfig {
  @Bean
  PaymentEventBroker transactionEventBroker(PaymentsRepository paymentsRepository) {
    return PaymentEventBroker.getInstance(paymentsRepository);
  }
}
