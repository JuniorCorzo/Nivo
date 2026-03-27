package dev.angelcorzo.nivo.model.payments.observer;

import dev.angelcorzo.nivo.model.commons.observable.Observable;
import dev.angelcorzo.nivo.model.commons.observable.Subject;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentNotFound;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class PaymentEventBroker implements Subject<PaymentEvent> {
  private static volatile PaymentEventBroker INSTANCE;
  private final ConcurrentHashMap<String, Observable<PaymentEvent>> observers =
      new ConcurrentHashMap<>();

  private final PaymentsRepository paymentsRepository;

  public static PaymentEventBroker getInstance(PaymentsRepository paymentsRepository) {
    if (INSTANCE == null) {
      synchronized (PaymentEventBroker.class) {
        if (INSTANCE == null) {
          INSTANCE = new PaymentEventBroker(paymentsRepository);
        }
      }
    }

    return INSTANCE;
  }

  @Override
  public void subscribe(String event, Observable<PaymentEvent> observer) {
    this.paymentsRepository
        .findById(UUID.fromString(event))
        .ifPresentOrElse(
            payment -> {
              observers.put(event, observer);
              observer.update(PaymentEvent.of(payment.getId(), payment.getStatus()));
            },
            () -> {
              throw new PaymentNotFound(event);
            });
  }

  @Override
  public void unsubscribe(String event) {
    this.observers.remove(event);
  }

  @Override
  public void notifyObservers(String event, PaymentEvent data) {
    this.observers.get(event).update(data);
  }
}
