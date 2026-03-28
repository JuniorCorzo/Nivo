package dev.angelcorzo.nivo.jpa.transactions.converts;

import dev.angelcorzo.nivo.model.commons.encryption.exceptions.EncryptionException;
import dev.angelcorzo.nivo.model.commons.encryption.gateways.EncryptionGateway;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Converter
@Component
@Slf4j
public class EncryptedResponseConverter implements AttributeConverter<Object, String> {
  private final EncryptionGateway encryptionGateway;

  public EncryptedResponseConverter(EncryptionGateway encryptionGateway) {
    log.info("Initializing {}", getClass().getSimpleName());
    this.encryptionGateway = encryptionGateway;
  }

  @Override
  public String convertToDatabaseColumn(Object attribute) {
    return this.encryptionGateway.encrypt(attribute).orElseThrow(EncryptionException::new);
  }

  @Override
  public Object convertToEntityAttribute(String dbData) {
    return this.encryptionGateway
        .decrypt(dbData, Object.class)
        .orElseThrow(EncryptionException::new);
  }
}
