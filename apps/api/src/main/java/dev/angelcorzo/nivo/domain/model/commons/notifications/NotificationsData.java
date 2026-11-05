package dev.angelcorzo.nivo.domain.model.commons.notifications;

import java.lang.reflect.RecordComponent;
import java.util.HashMap;
import java.util.Map;

public interface NotificationsData {
  String companyName();

  String supportUrl();

  String socialUrl();

  String unsubscribeUrl();

  String companyAddress();

  default Map<String, String> toMap() {
    final Map<String, String> dataMap = new HashMap<>();
    final RecordComponent[] components = this.getClass().getRecordComponents();
    if (components == null) {
      return dataMap;
    }

    for (final RecordComponent component : components) {
      try {
        final Object value = component.getAccessor().invoke(this);
        dataMap.put(component.getName(), value != null ? value.toString() : "null");
      } catch (final ReflectiveOperationException e) {
        System.getLogger(NotificationsData.class.getName())
          .log(System.Logger.Level.WARNING, "Failed to read notification record component: " + component.getName(), e);
      }
    }

    return dataMap;
  }
}
