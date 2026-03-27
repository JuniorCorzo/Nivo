package dev.angelcorzo.nivo.model.commons.notifications;

import java.util.Arrays;
import java.util.Map;

public interface NotificationsData {
  String companyName();

  String supportUrl();

  String socialUrl();

  String unsubscribeUrl();

  String companyAddress();

  default Map<String, String> toMap() {
    Map<String, String> dataMap = new java.util.HashMap<>();
    Arrays.stream(this.getClass().getRecordComponents())
        .forEach(
            component -> {
              try {
                Object value = component.getAccessor().invoke(this);
                dataMap.put(component.getName(), value != null ? value.toString() : "null");
              } catch (Exception e) {
                e.printStackTrace();
              }
            });

    return dataMap;
  }
}
