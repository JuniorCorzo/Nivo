package dev.angelcorzo.nivo.domain.model.commons.result;

public interface DomainError {
  int status();

  String code();

  String message();

  Severity severity();

  enum Severity {
    INFO,
    WARNING,
    ERROR,
    CRITICAL
  }
}
