package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

public interface OccupiedSlotProjection {
  String getSlotNumber();
  String getZone();
  String getPrefix();
  String getType();
  String getLicensePlate();
}
