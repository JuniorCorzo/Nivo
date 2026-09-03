import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideCheck,
  lucideChevronDown,
  lucideMapPin,
  lucideParkingSquare,
} from '@ng-icons/lucide';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { ParkingService } from '@core/services/parking-service';
import { ActiveParkingService } from '@core/services/active-parking.service';

@Component({
  selector: 'app-parking-lot-selector',
  standalone: true,
  imports: [OverlayModule, NgIcon],
  providers: [
    provideIcons({
      lucideParkingSquare,
      lucideBuilding2,
      lucideChevronDown,
      lucideCheck,
      lucideMapPin,
    }),
  ],
  templateUrl: './parking-lot-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParkingLotSelector {
  public readonly activeParkingService = inject(ActiveParkingService);
  public readonly parkingService = inject(ParkingService);

  public readonly placeholder = input<string>('Seleccionar sede');
  public readonly disabled = input<boolean>(false);
  public readonly size = input<'sm' | 'default' | 'lg'>('default');
  public readonly showCapacity = input<boolean>(true);

  public readonly parkingChange = output<ParkingLotListItemModel>();

  public readonly isOpen = signal<boolean>(false);
  private readonly originElement = viewChild<ElementRef<HTMLElement>>('origin');

  public readonly parkingLots = computed<ParkingLotListItemModel[]>(() => {
    return this.parkingService.parkingLots() ?? [];
  });

  public readonly activeLot = computed<ParkingLotListItemModel | null>(() => {
    return this.activeParkingService.activeParkingLot();
  });

  public readonly overlayWidth = computed<number>(() => {
    return Math.max(this.originElement()?.nativeElement.offsetWidth ?? 0, 240);
  });

  public readonly overlayPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 4,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -4,
    },
  ];

  public toggleOpen(): void {
    if (this.disabled()) return;
    this.isOpen.update((v) => !v);
  }

  public close(): void {
    this.isOpen.set(false);
  }

  public selectParkingLot(lot: ParkingLotListItemModel): void {
    if (this.disabled()) return;
    this.activeParkingService.setActiveParking(lot);
    this.parkingChange.emit(lot);
    this.close();
  }

  public isSelected(lot: ParkingLotListItemModel): boolean {
    return this.activeLot()?.id === lot.id;
  }

  public getFormattedAddress(lot: ParkingLotListItemModel): string {
    const { street, city } = lot.address ?? {};
    return [street, city].filter(Boolean).join(', ');
  }
}
