package dev.angelcorzo.nivo.model.parkingtickets;

import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotsReference;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class ParkingTickets {
  private UUID id;
  private SlotsReference slot;
  private TenantReference tenant;
  private UserReference user;
  private RateReference rate;
  private String licensePlate;
  private OffsetDateTime entryTime;
  private OffsetDateTime exitTime;
  private BigDecimal totalToCharge;
  private ParkingTicketStatus status;
  private OffsetDateTime closedAt;
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;
  private OffsetDateTime deletedAt;
}
