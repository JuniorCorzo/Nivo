package dev.angelcorzo.nivo.usecase.batchupsertslots;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.slots.mappers.SlotMapper;
import dev.angelcorzo.nivo.model.slots.valueobject.CreatedSlots;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.usecase.batchpersistslots.BatchPersistSlotsUseCase;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class BatchUpsertSlotsUseCase {
  private final SlotsRepository slotsRepository;
  private final BatchPersistSlotsUseCase batchPersistSlotsUseCase;

  public void execute(List<CreatedSlots> incoming, ParkingLots parking, Tenants tenant) {
    Map<GroupKey, List<Slots>> existingByGroup = this.loadExistingGroups(parking);
    this.createNewGroups(incoming, existingByGroup, parking, tenant);
    this.expandGroups(incoming, existingByGroup, parking, tenant);
    this.shrinkGroups(incoming, existingByGroup);
  }

  private Map<GroupKey, List<Slots>> loadExistingGroups(ParkingLots parking) {
    return this.slotsRepository.findAllByParkingLotsId(parking.getId())
        .stream()
        .collect(Collectors.groupingBy(GroupKey::of));
  }

  private void createNewGroups(
      List<CreatedSlots> incoming,
      Map<GroupKey, List<Slots>> existingByGroup,
      ParkingLots parking,
      Tenants tenant) {
    List<CreatedSlots> toCreate = incoming.stream()
        .filter(s -> !existingByGroup.containsKey(GroupKey.of(s)))
        .toList();

    if (toCreate.isEmpty())
      return;

    this.batchPersistSlotsUseCase.execute(SlotMapper.toEntities(toCreate, tenant, parking));
  }

  private void expandGroups(
      List<CreatedSlots> incoming,
      Map<GroupKey, List<Slots>> existingByGroup,
      ParkingLots parking,
      Tenants tenant) {
    List<CreatedSlots> toExpand = incoming.stream()
        .filter(s -> this.groupNeedsExpansion(s, existingByGroup))
        .map(s -> this.buildExpansionEntry(s, existingByGroup))
        .toList();

    if (toExpand.isEmpty())
      return;

    this.batchPersistSlotsUseCase.execute(SlotMapper.toEntities(toExpand, tenant, parking));
  }

  private boolean groupNeedsExpansion(CreatedSlots s, Map<GroupKey, List<Slots>> existingByGroup) {
    List<Slots> group = existingByGroup.get(GroupKey.of(s));
    return group != null && s.numberSlots() > group.size();
  }

  private CreatedSlots buildExpansionEntry(CreatedSlots s, Map<GroupKey, List<Slots>> existingByGroup) {
    int current = existingByGroup.get(GroupKey.of(s)).size();
    return new CreatedSlots(s.prefix(), s.zone(), s.slotType(), s.numberSlots() - current, current);
  }

  private void shrinkGroups(List<CreatedSlots> incoming, Map<GroupKey, List<Slots>> existingByGroup) {
    incoming.stream()
        .filter(s -> this.groupNeedsShrink(s, existingByGroup))
        .forEach(s -> this.deleteExcessSlots(s, existingByGroup));
  }

  private boolean groupNeedsShrink(CreatedSlots s, Map<GroupKey, List<Slots>> existingByGroup) {
    List<Slots> group = existingByGroup.get(GroupKey.of(s));
    return group != null && s.numberSlots() < group.size();
  }

  private void deleteExcessSlots(CreatedSlots s, Map<GroupKey, List<Slots>> existingByGroup) {
    List<Slots> group = existingByGroup.get(GroupKey.of(s));
    int excess = group.size() - s.numberSlots();
    group.stream()
        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
        .limit(excess)
        .forEach(slot -> this.slotsRepository.deleteById(slot.getId()));
  }

  private record GroupKey(SlotType type, String prefix, String zone) {

    static GroupKey of(Slots s) {
      return new GroupKey(s.getType(), s.getPrefix(), s.getZone());
    }

    static GroupKey of(CreatedSlots s) {
      return new GroupKey(s.slotType(), s.prefix(), s.zone());
    }

    @Override
    public boolean equals(Object o) {
      if (!(o instanceof GroupKey g))
        return false;
      return this.type == g.type
          && Objects.equals(this.prefix, g.prefix)
          && Objects.equals(this.zone, g.zone);
    }

    @Override
    public int hashCode() {
      return Objects.hash(this.type, this.prefix, this.zone);
    }
  }
}
