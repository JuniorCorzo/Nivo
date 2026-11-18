import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import type {
  CreateSpecialPolicyModel,
  SpecialPolicyPreset,
} from "@core/models/parking-policy.model";
import { SPECIAL_POLICY_PRESETS } from "@core/models/parking-policy.model";
import type {
  RatePolicyOperation,
  RatePolicyTarget,
} from "@core/models/rate.model";
import { RateService } from "@core/services/rate-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCheck,
  lucideHandshake,
  lucidePercent,
  lucidePlus,
  lucideReceipt,
  lucideShieldCheck,
  lucideSliders,
  lucideSparkles,
  lucideTag,
  lucideX,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  ModalComponent,
  SelectComponent,
  ToastService,
  TypographyH3,
} from "@nivo-sass/design-system";

export interface ModifiesOption {
  label: string;
  value: RatePolicyTarget;
}

export interface OperationOption {
  label: string;
  value: RatePolicyOperation;
}

const displayModifiesOption = (item: ModifiesOption): string => item.label;
const modifiesOptionValue = (item: ModifiesOption): string => item.value;

const displayOperationOption = (item: OperationOption): string => item.label;
const operationOptionValue = (item: OperationOption): string => item.value;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    InputComponent,
    ModalComponent,
    NgIcon,
    ReactiveFormsModule,
    SelectComponent,
    TypographyH3,
  ],
  providers: [
    provideIcons({
      lucideCheck,
      lucideHandshake,
      lucidePercent,
      lucidePlus,
      lucideReceipt,
      lucideShieldCheck,
      lucideSliders,
      lucideSparkles,
      lucideTag,
      lucideX,
    }),
  ],
  selector: "app-special-policy-modal",
  standalone: true,
  templateUrl: "./special-policy-modal.html",
})
export class SpecialPolicyModalComponent {
  private readonly rateService = inject(RateService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly closed = output();
  readonly policyCreated = output<CreateSpecialPolicyModel>();

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedPresetId = signal<string | null>("lavado-service");
  readonly presets = SPECIAL_POLICY_PRESETS;

  readonly form = new FormGroup({
    modifies: new FormControl<RatePolicyTarget>("SURCHARGE", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    name: new FormControl<string>("Tarifa de Lavado Ecológico", {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    operation: new FormControl<RatePolicyOperation>("SET", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    valueToModify: new FormControl<number>(18000, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  readonly modifiesOptions: ModifiesOption[] = [
    { label: "Recargo adicional a la tarifa", value: "SURCHARGE" },
    { label: "Descuento sobre la liquidación", value: "DISCOUNT" },
    { label: "Tarifa plana / Precio fijado", value: "PRICE" },
  ];

  readonly operationOptions: OperationOption[] = [
    { label: "Monto fijo en dinero ($)", value: "SET" },
    { label: "Porcentaje de cálculo (%)", value: "PERCENTAGE" },
    { label: "Deducción directa en valor (-$)", value: "SUBTRACT" },
  ];

  readonly displayModifies = displayModifiesOption;
  readonly modifiesValue = modifiesOptionValue;

  readonly displayOperation = displayOperationOption;
  readonly operationValue = operationOptionValue;

  readonly valueLabel = computed(() =>
    this.formValues().operation === "PERCENTAGE"
      ? "Porcentaje a Aplicar (%)"
      : "Monto a Aplicar ($ COP)"
  );

  readonly valuePlaceholder = computed(() =>
    this.formValues().operation === "PERCENTAGE" ? "Ej. 15" : "Ej. 18000"
  );

  readonly valueStartIcon = computed(() =>
    this.formValues().operation === "PERCENTAGE"
      ? "lucidePercent"
      : "lucideReceipt"
  );

  private readonly formValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  readonly previewText = computed(() => {
    const values = this.formValues();
    const rawVal = values.valueToModify;
    const op = values.operation;
    const mod = values.modifies;

    const val = Number(rawVal) || 0;
    if (op === "PERCENTAGE") {
      return mod === "DISCOUNT" ? `-${val}% Descuento` : `+${val}% Recargo`;
    }
    if (op === "SUBTRACT") {
      return `-$${val.toLocaleString("es-CO")} COP`;
    }
    return mod === "DISCOUNT"
      ? `-$${val.toLocaleString("es-CO")} COP`
      : `+$${val.toLocaleString("es-CO")} COP`;
  });

  readonly previewIsDiscount = computed(
    () => this.formValues().modifies === "DISCOUNT"
  );

  onModifiesChange(newMod: unknown): void {
    if (newMod === "SURCHARGE" || newMod === "DISCOUNT" || newMod === "PRICE") {
      this.form.controls.modifies.setValue(newMod);
      this.onCustomPreset();
    }
  }

  onOperationChange(newOp: unknown): void {
    if (newOp === "SET" || newOp === "PERCENTAGE" || newOp === "SUBTRACT") {
      this.form.controls.operation.setValue(newOp);
      this.updateValueValidators(newOp);
      this.onCustomPreset();
    }
  }

  private updateValueValidators(op: RatePolicyOperation): void {
    const control = this.form.controls.valueToModify;
    if (op === "PERCENTAGE") {
      control.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(100),
      ]);
    } else {
      control.setValidators([Validators.required, Validators.min(1)]);
    }
    control.updateValueAndValidity();
  }

  applyPreset(preset: SpecialPolicyPreset): void {
    this.selectedPresetId.set(preset.id);
    this.updateValueValidators(preset.operation);
    this.form.patchValue({
      modifies: preset.modifies,
      name: preset.title,
      operation: preset.operation,
      valueToModify: preset.defaultValue,
    });
    this.form.markAsDirty();
  }

  onCustomPreset(): void {
    this.selectedPresetId.set("custom");
  }

  onCancel(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const model: CreateSpecialPolicyModel = {
      modifies: val.modifies,
      name: val.name.trim(),
      operation: val.operation,
      valueToModify: Number(val.valueToModify),
    };

    this.isSubmitting.set(true);

    this.rateService.createSpecialPolicy(model).subscribe({
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.showToast({
          message: "Error al crear la política especial",
          type: "error",
        });
      },
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.showToast({
          message: "Política especial creada con éxito",
          type: "success",
        });
        this.policyCreated.emit(model);
        this.closed.emit();
      },
    });
  }
}
