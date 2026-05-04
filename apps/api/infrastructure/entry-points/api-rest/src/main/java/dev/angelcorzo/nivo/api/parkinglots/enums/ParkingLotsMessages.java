package dev.angelcorzo.nivo.api.parkinglots.enums;

public enum ParkingLotsMessages {
  PARKING_LOT_CREATED("Parqueadero creado con exito"),
  PARKING_LOTS_UPDATED("Parqueadero actualizado con exito"),
  PARKING_LOTS_LIST("Lista de parqueaderos obtenida con exito"),
  SLOT_GROUP_DELETED("Grupo de slots eliminado con exito"),
  ;

  private final String template;

  ParkingLotsMessages(String template) {
    this.template = template;
  }

  public String format(Object... args) {
    return String.format(this.template, args);
  }
}
