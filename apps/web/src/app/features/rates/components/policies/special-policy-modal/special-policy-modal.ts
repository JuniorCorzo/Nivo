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
import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
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
  lucideClock,
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
import { finalize } from "rxjs";

const trimmedMinLengthValidator =
  (minLength: number): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? "").trim();
    return value.length >= minLength
      ? null
      : {
          minlength: {
            actualLength: value.length,
            requiredLength: minLength,
          },
        };
  };

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
      lucideClock,
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
      validators: [Validators.required, trimmedMinLengthValidator(3)],
    }),
    operation: new FormControl<RatePolicyOperation>("SET", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    valueToModify: new FormControl<number>(18_000, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  readonly modifiesOptions: ModifiesOption[] = [
    { label: "Recargo adicional a la tarifa", value: "SURCHARGE" },
    { label: "Descuento sobre la liquidación", value: "DISCOUNT" },
    { label: "Tarifa plana / Precio fijado", value: "PRICE" },
    { label: "Ajuste de tiempo de estadía", value: "TIME" },
  ];

  private readonly allOperationOptions: OperationOption[] = [
    { label: "Monto fijo en dinero ($)", value: "SET" },
    { label: "Porcentaje de cálculo (%)", value: "PERCENTAGE" },
    { label: "Deducción directa en valor (-$)", value: "SUBTRACT" },
  ];

  private readonly timeOperationOptions: OperationOption[] = [
    { label: "Tiempo fijo (unidades de tarifa)", value: "SET" },
    { label: "Porcentaje de tiempo (%)", value: "PERCENTAGE" },
    { label: "Deducción de tiempo (-unidades)", value: "SUBTRACT" },
  ];

  private readonly allowedOperationsByTarget = {
    DISCOUNT: ["SUBTRACT", "PERCENTAGE"],
    PRICE: ["SET", "SUBTRACT", "PERCENTAGE"],
    SURCHARGE: ["SET", "PERCENTAGE"],
    TIME: ["SET", "SUBTRACT", "PERCENTAGE"],
  } satisfies Record<RatePolicyTarget, RatePolicyOperation[]>;

  readonly displayModifies = displayModifiesOption;
  readonly modifiesValue = modifiesOptionValue;

  readonly displayOperation = displayOperationOption;
  readonly operationValue = operationOptionValue;

  private readonly formValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  readonly operationOptions = computed<OperationOption[]>(() => {
    const mod = this.formValues().modifies;
    const allowed: readonly RatePolicyOperation[] =
      mod && mod in this.allowedOperationsByTarget
        ? this.allowedOperationsByTarget[mod]
        : ["SET"];
    const sourceOptions =
      mod === "TIME" ? this.timeOperationOptions : this.allOperationOptions;
    return sourceOptions.filter((option) => allowed.includes(option.value));
  });

  readonly valueLabel = computed(() => {
    const { modifies, operation } = this.formValues();
    if (operation === "PERCENTAGE") {
      return "Porcentaje a Aplicar (%)";
    }
    if (modifies === "TIME") {
      return "Unidades de tiempo (según tarifa)";
    }
    return "Monto a Aplicar ($ COP)";
  });

  readonly valuePlaceholder = computed(() => {
    const { modifies, operation } = this.formValues();
    if (operation === "PERCENTAGE") {
      return "Ej. 15";
    }
    if (modifies === "TIME") {
      return "Ej. 1";
    }
    return "Ej. 18000";
  });

  readonly valueStartIcon = computed(() => {
    const { modifies, operation } = this.formValues();
    if (operation === "PERCENTAGE") {
      return "lucidePercent";
    }
    if (modifies === "TIME") {
      return "lucideClock";
    }
    return "lucideReceipt";
  });

  readonly previewText = computed(() => {
    const values = this.formValues();
    const rawVal = values.valueToModify;
    const op = values.operation;
    const mod = values.modifies;

    const val = Number(rawVal) || 0;
    if (mod === "TIME") {
      if (op === "PERCENTAGE") {
        return `-${val}% tiempo`;
      }
      if (op === "SUBTRACT") {
        return `-${val} unidad(es)`;
      }
      return `${val} unidad(es)`;
    }
    if (op === "PERCENTAGE") {
      return mod === "SURCHARGE" ? `+${val}% Recargo` : `-${val}% Descuento`;
    }
    if (op === "SUBTRACT") {
      return mod === "SURCHARGE"
        ? `+$${val.toLocaleString("es-CO")} COP`
        : `-$${val.toLocaleString("es-CO")} COP`;
    }
    if (mod === "PRICE" || mod === "DISCOUNT") {
      return `$${val.toLocaleString("es-CO")} COP`;
    }
    return `+$${val.toLocaleString("es-CO")} COP`;
  });

  readonly previewIsDiscount = computed(() => {
    const { modifies, operation } = this.formValues();
    return (
      modifies === "DISCOUNT" ||
      ((modifies === "PRICE" || modifies === "TIME") &&
        (operation === "SUBTRACT" || operation === "PERCENTAGE"))
    );
  });

  onModifiesChange(newMod: unknown): void {
    if (
      newMod === "SURCHARGE" ||
      newMod === "DISCOUNT" ||
      newMod === "PRICE" ||
      newMod === "TIME"
    ) {
      this.form.controls.modifies.setValue(newMod);
      const allowed: readonly RatePolicyOperation[] =
        this.allowedOperationsByTarget[newMod];
      const currentOp = this.form.controls.operation.value;
      if (!allowed.includes(currentOp)) {
        const [nextOp] = allowed;
        this.form.controls.operation.setValue(nextOp);
        this.updateValueValidators(nextOp);
      }
      this.onCustomPreset();
    }
  }

  onOperationChange(newOp: unknown): void {
    if (newOp === "SET" || newOp === "PERCENTAGE" || newOp === "SUBTRACT") {
      const mod = this.form.controls.modifies.value;
      if (mod in this.allowedOperationsByTarget) {
        const allowed: readonly RatePolicyOperation[] =
          this.allowedOperationsByTarget[mod];
        if (!allowed.includes(newOp)) {
          return;
        }
      }
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

  private resetForm(): void {
    this.selectedPresetId.set("lavado-service");
    this.updateValueValidators("SET");
    this.form.reset({
      modifies: "SURCHARGE",
      name: "Tarifa de Lavado Ecológico",
      operation: "SET",
      valueToModify: 18_000,
    });
  }

  onCancel(): void {
    this.resetForm();
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

    this.rateService
      .createSpecialPolicy(model)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        error: () => {
          this.toastService.showToast({
            message: "Error al crear la política especial",
            type: "error",
          });
        },
        next: () => {
          this.toastService.showToast({
            message: "Política especial creada con éxito",
            type: "success",
          });
          this.policyCreated.emit(model);
          this.resetForm();
          this.closed.emit();
        },
      });
  }
}
