package dev.angelcorzo.nivo.domain.model.slots;

import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Slots {
  private UUID id;
  private ParkingLotsReference parking;
  private TenantReference tenant;
  private String slotNumber;
  private String zone;
  private String prefix;
  private SlotType type;
  private SlotStatus status;
  @Builder.Default
  private boolean hasCharger = false;
  @Builder.Default
  private boolean isAccessible = false;
  @Builder.Default
  private boolean isActive = true;
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;
  private OffsetDateTime deletedAt;

  public boolean isHasCharger() {
    return hasCharger;
  }

  public boolean getHasCharger() {
    return hasCharger;
  }

  public boolean hasCharger() {
    return hasCharger;
  }

  public boolean isAccessible() {
    return isAccessible;
  }

  public void setIsAccessible(boolean isAccessible) {
    this.isAccessible = isAccessible;
  }

  public boolean getIsAccessible() {
    return isAccessible;
  }

  public boolean isActive() {
    return isActive;
  }

  public void setIsActive(boolean isActive) {
    this.isActive = isActive;
  }

  public boolean getIsActive() {
    return isActive;
  }
}
