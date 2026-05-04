package dev.angelcorzo.nivo.model.slots.mappers;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.valueobject.CreatedSlots;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class SlotMapper {

  public static List<Slots> toEntities(
      List<CreatedSlots> creationRequests, Tenants tenant, ParkingLots parking) {
    Map<GroupingKey, List<CreatedSlots>> slotsByPrefixAndZone =
        groupByPrefixAndZone(creationRequests);

    List<CompletableFuture<List<Slots>>> groupFutures =
        slotsByPrefixAndZone.values().stream()
            .map(group -> processGroupAsync(group, tenant, parking))
            .toList();

    return awaitAllAndFlatten(groupFutures);
  }

  private static Map<GroupingKey, List<CreatedSlots>> groupByPrefixAndZone(
      List<CreatedSlots> creationRequests) {
    return creationRequests.stream()
        .collect(Collectors.groupingBy(
            request -> new GroupingKey(request.prefix(), request.zone())));
  }

  private static CompletableFuture<List<Slots>> processGroupAsync(
      List<CreatedSlots> group, Tenants tenant, ParkingLots parking) {
    return CompletableFuture.supplyAsync(() -> {
      List<Slots> slots = new ArrayList<>();
      int correlative = resolveStartingNumber(group);

      for (CreatedSlots request : group) {
        for (int i = 0; i < request.numberSlots(); i++) {
          slots.add(toSlot(request, correlative, tenant, parking));
          correlative++;
        }
      }

      return slots;
    });
  }

  private static List<Slots> awaitAllAndFlatten(
      List<CompletableFuture<List<Slots>>> futures) {
    return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
        .thenApply(
            _ -> futures.stream().flatMap(future -> future.join().stream()).toList())
        .join();
  }

  private static int resolveStartingNumber(List<CreatedSlots> group) {
    int currentCount = group.stream()
        .mapToInt(CreatedSlots::currentNumberSlots)
        .max()
        .orElse(0);
    return currentCount + 1;
  }

  private static Slots toSlot(
      CreatedSlots request, int correlative, Tenants tenant, ParkingLots parking) {
    return Slots.builder()
        .zone(request.zone())
        .tenant(TenantReference.of(tenant))
        .type(request.slotType())
        .slotNumber("%03d".formatted(correlative))
        .prefix(request.prefix())
        .parking(ParkingLotsReference.of(parking))
        .status(SlotStatus.AVAILABLE)
        .build();
  }

  private record GroupingKey(String prefix, String zone) {}
}
