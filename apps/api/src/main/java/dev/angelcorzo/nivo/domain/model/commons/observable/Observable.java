package dev.angelcorzo.nivo.domain.model.commons.observable;

public interface Observable<T> {
  void update(T event);
}
