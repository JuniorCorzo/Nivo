import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-minimal',
  imports: [RouterOutlet],
  template: `
    <div class="flex">
      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutMinimal {}
