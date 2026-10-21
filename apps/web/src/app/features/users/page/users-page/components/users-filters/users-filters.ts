import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { provideIcons } from "@ng-icons/core";
import { lucideSearch } from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  InputComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block w-full",
  },
  imports: [
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    InputComponent,
  ],
  providers: [provideIcons({ lucideSearch })],
  selector: "app-users-filters",
  standalone: true,
  templateUrl: "./users-filters.html",
})
export class UsersFiltersComponent {
  readonly searchQuery = input<string>("");
  readonly selectedRole = input<string>("ALL");
  readonly roleFilters =
    input.required<readonly { label: string; value: string }[]>();

  readonly searchChange = output<string>();
  readonly roleChange = output<string>();

  readonly texts = APP_TEXTS.users.actions;

  onSearchInput(event: Event): void {
    /* SAFETY: event target of text input is guaranteed HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  onRoleClick(role: string): void {
    this.roleChange.emit(role);
  }
}
