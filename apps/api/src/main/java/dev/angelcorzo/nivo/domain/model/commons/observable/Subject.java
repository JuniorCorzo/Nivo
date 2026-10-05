package dev.angelcorzo.nivo.domain.model.commons.observable;

public interface Subject<T> {

  void subscribe(String event, Observable<T> observable);

  void unsubscribe(String event);

  void notifyObservers(String event, T data);
}
