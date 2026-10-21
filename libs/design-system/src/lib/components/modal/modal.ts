import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  viewChild,
} from "@angular/core";

export type ModalSize = "sm" | "md" | "lg" | "xl";
export type ModalRole = "dialog" | "alertdialog";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-modal",
  standalone: true,
  template: `
    <dialog
      #dialog
      class="m-auto border-0 bg-transparent p-0 transition-all backdrop:bg-black/55 backdrop:backdrop-blur-[2px]"
      [class]="sizeClasses()"
      [attr.role]="role()"
      aria-modal="true"
      [attr.aria-labelledby]="titleId()"
      [attr.aria-describedby]="descriptionId()"
      (cancel)="onCancel($event)"
      (click)="onDialogClick($event)"
    >
      <div
        class="border-border bg-card text-card-foreground relative w-full rounded-2xl border p-5 shadow-2xl transition-all"
      >
        <ng-content select="[modal-header], [dialog-header]" />
        <ng-content select="[modal-body], [dialog-body]" />
        <ng-content />
        <ng-content select="[modal-footer], [dialog-footer]" />
      </div>
    </dialog>
  `,
})
export class ModalComponent implements OnDestroy {
  readonly isOpen = input<boolean>(false);
  readonly size = input<ModalSize>("md");
  readonly role = input<ModalRole>("dialog");
  readonly closeOnBackdropClick = input<boolean>(true);
  readonly closeOnEsc = input<boolean>(true);
  readonly titleId = input<string>();
  readonly descriptionId = input<string>();

  readonly closed = output();

  readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>("dialog");

  readonly sizeClasses = computed<string>(() => {
    const sizes = {
      lg: "w-[min(100%-2rem,36rem)]",
      md: "w-[min(100%-2rem,28rem)]",
      sm: "w-[min(100%-2rem,24rem)]",
      xl: "w-[min(100%-2rem,48rem)]",
    } satisfies Record<ModalSize, string>;
    return sizes[this.size()];
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const el = this.dialogRef()?.nativeElement;
      if (!el) {
        return;
      }
      if (open && !el.open) {
        el.showModal();
      } else if (!open && el.open) {
        el.close();
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    if (this.closeOnEsc()) {
      this.closed.emit();
    }
  }

  onDialogClick(event: MouseEvent): void {
    if (
      this.closeOnBackdropClick() &&
      event.target === this.dialogRef()?.nativeElement
    ) {
      this.closed.emit();
    }
  }

  ngOnDestroy(): void {
    const el = this.dialogRef()?.nativeElement;
    if (el?.open) {
      el.close();
    }
  }
}
