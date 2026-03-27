package dev.angelcorzo.nivo.model.commons.observable;

public interface Observable<T> {
  void update(T event);
}
