import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import { ComboboxComponent } from '@nivo-sass/design-system';

interface TestItem {
  id: number;
  name: string;
}

const SAMPLE_ITEMS: TestItem[] = [
  { id: 1, name: 'Antioquia' },
  { id: 2, name: 'Atlántico' },
  { id: 3, name: 'Bogotá' },
  { id: 4, name: 'Valle del Cauca' },
];

describe('ComboboxComponent', () => {
  let fixture: ComponentFixture<ComboboxComponent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  function openDropdown() {
    const inputEl: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    inputEl.dispatchEvent(new Event('focusin', { bubbles: true }));
    const combobox = (fixture.componentInstance as any).combobox();
    if (combobox) {
      combobox._deferredContentAware?.contentVisible.set(true);
      combobox.open();
    }
    fixture.detectChanges();
  }

  function getOptions(): NodeListOf<HTMLElement> {
    return document.querySelectorAll('[role="option"]');
  }

  function getListbox(): HTMLElement | null {
    return document.querySelector('[role="listbox"]');
  }

  function getPopupText(): string {
    const listbox = document.querySelector('[role="listbox"]');
    const overlay = document.querySelector('.cdk-overlay-container');
    return (listbox?.textContent || overlay?.textContent || fixture.nativeElement.textContent || '');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ComboboxComponent],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    fixture = TestBed.createComponent(ComboboxComponent);
    // Disable debounce so filtering is synchronous in tests
    fixture.componentRef.setInput('debounceMs', 0);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('ControlValueAccessor', () => {
    it('should display the written value in the trigger input', () => {
      fixture.componentInstance.writeValue('Antioquia');
      fixture.detectChanges();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(inputEl.value).toBe('Antioquia');
    });

    it('should call onChange with display text when an item is selected via Enter', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      fixture.componentInstance.registerOnChange(onChangeSpy);
      fixture.componentRef.setInput('items', SAMPLE_ITEMS);
      fixture.componentRef.setInput('displayFn', (item: unknown) => (item as TestItem).name);
      fixture.detectChanges();

      openDropdown();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();

      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      fixture.detectChanges();

      expect(onChangeSpy).toHaveBeenCalledWith('Antioquia');
    });

    it('should call registerOnTouched when input loses focus', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      fixture.componentInstance.registerOnTouched(onTouchedSpy);
      fixture.detectChanges();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.focus();
      inputEl.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(onTouchedSpy).toHaveBeenCalledTimes(1);
    });

    it('should disable input via setDisabledState', () => {
      fixture.componentInstance.setDisabledState(true);
      fixture.detectChanges();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(inputEl.disabled).toBeTrue();
    });

    it('should reset disabled state when setDisabledState called with false', () => {
      fixture.componentInstance.setDisabledState(true);
      fixture.componentInstance.setDisabledState(false);
      fixture.detectChanges();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(inputEl.disabled).toBeFalse();
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('items', SAMPLE_ITEMS);
      fixture.componentRef.setInput(
        'displayFn',
        (item: unknown) => (item as TestItem).name,
      );
      fixture.detectChanges();
    });

    it('should show all items when dropdown opens with empty search', () => {
      openDropdown();

      const options = getOptions();
      expect(options.length).toBe(4);
    });

    it('should filter items by display text', () => {
      openDropdown();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.value = 'Anti';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      const options = getOptions();
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain('Antioquia');
    });

    it('should filter case-insensitively', () => {
      openDropdown();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.value = 'antioquia';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      const options = getOptions();
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain('Antioquia');
    });

    it('should use custom filterFn when provided', () => {
      fixture.componentRef.setInput(
        'filterFn',
        (item: unknown, _query: string) => (item as TestItem).id > 2,
      );
      fixture.detectChanges();

      openDropdown();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.value = 'a';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      const options = getOptions();
      expect(options.length).toBe(2);
    });

    it('should show no results when search matches nothing', () => {
      openDropdown();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.value = 'XYZ';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      expect(getPopupText()).toContain(
        'Sin resultados',
      );
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('items', SAMPLE_ITEMS);
      fixture.componentRef.setInput(
        'displayFn',
        (item: unknown) => (item as TestItem).name,
      );
      fixture.componentInstance.registerOnChange(() => {});
      fixture.detectChanges();
      openDropdown();
    });

    it('should highlight the first item on ArrowDown', () => {
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();

      const options = getOptions();
      expect(options[0].getAttribute('data-active')).toBe('true');
    });

    it('should highlight the next item on subsequent ArrowDown', () => {
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();

      const options = getOptions();
      expect(options[0].getAttribute('data-active')).toBe('false');
      expect(options[1].getAttribute('data-active')).toBe('true');
    });

    it('should highlight previous item on ArrowUp', () => {
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      fixture.detectChanges();

      const options = getOptions();
      expect(options[0].getAttribute('data-active')).toBe('true');
      expect(options[1].getAttribute('data-active')).toBe('false');
    });

    it('should wrap to last item on ArrowUp when at first item', () => {
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      fixture.detectChanges();

      const options = getOptions();
      expect(options[0].getAttribute('data-active')).toBe('false');
      expect(options[3].getAttribute('data-active')).toBe('true');
    });

    it('should close dropdown on Escape', () => {
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      fixture.detectChanges();

      const listbox = getListbox();
      expect(listbox).toBeNull();
    });

    it('should emit selectionChange and update input on Enter with highlighted item', () => {
      const selectionSpy = jasmine.createSpy('selectionChange');
      fixture.componentInstance.selectionChange.subscribe(selectionSpy);

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      fixture.detectChanges();

      expect(selectionSpy).toHaveBeenCalledWith(SAMPLE_ITEMS[0]);
      expect(inputEl.value).toBe('Antioquia');
    });

    it('should fire onChange when selecting an item via Enter', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      fixture.componentInstance.registerOnChange(onChangeSpy);

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      inputEl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      fixture.detectChanges();

      expect(onChangeSpy).toHaveBeenCalledWith('Antioquia');
    });
  });

  describe('Selection via mouse', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('items', SAMPLE_ITEMS);
      fixture.componentRef.setInput(
        'displayFn',
        (item: unknown) => (item as TestItem).name,
      );
      openDropdown();
    });

    it('should select an item on mousedown and emit selectionChange', () => {
      const selectionSpy = jasmine.createSpy('selectionChange');
      const onChangeSpy = jasmine.createSpy('onChange');
      fixture.componentInstance.selectionChange.subscribe(selectionSpy);
      fixture.componentInstance.registerOnChange(onChangeSpy);
      fixture.detectChanges();

      const options = getOptions();
      (options[1] as HTMLElement).dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();

      expect(selectionSpy).toHaveBeenCalledWith(SAMPLE_ITEMS[1]);
      expect(onChangeSpy).toHaveBeenCalledWith('Atlántico');
    });
  });

  describe('States', () => {
    it('should show loading message when loading is true', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.componentRef.setInput('items', []);
      fixture.detectChanges();
      openDropdown();

      expect(getPopupText()).toContain('Cargando...');
    });

    it('should show error message inside dropdown when error is set and dropdown is open', () => {
      fixture.componentRef.setInput('error', 'Error al cargar departamentos');
      fixture.componentRef.setInput('items', []);
      fixture.detectChanges();
      openDropdown();

      expect(getPopupText()).toContain(
        'Error al cargar departamentos',
      );
    });

    it('should show error message below input when dropdown is closed', () => {
      fixture.componentRef.setInput('error', 'Error al cargar departamentos');
      fixture.detectChanges();

      const alert = fixture.nativeElement.querySelector('[role="alert"]');
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain(
        'Error al cargar departamentos',
      );
    });

    it('should show empty state message when no items match', () => {
      fixture.componentRef.setInput('items', SAMPLE_ITEMS);
      fixture.componentRef.setInput(
        'displayFn',
        (item: unknown) => (item as TestItem).name,
      );
      fixture.detectChanges();
      openDropdown();

      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.value = 'XYZ';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      expect(getPopupText()).toContain(
        'Sin resultados',
      );
    });
  });

  describe('ARIA attributes', () => {
    it('should have role="combobox" on the trigger input', () => {
      const inputEl = fixture.nativeElement.querySelector('input');
      expect(inputEl.getAttribute('role')).toBe('combobox');
    });

    it('should have aria-expanded="false" when dropdown is closed', () => {
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(inputEl.getAttribute('aria-expanded')).toBe('false');
    });

    it('should have aria-expanded="true" when dropdown is open', () => {
      openDropdown();
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      expect(inputEl.getAttribute('aria-expanded')).toBe('true');
    });

    it('should have role="listbox" on the dropdown when open', () => {
      fixture.componentRef.setInput('items', SAMPLE_ITEMS);
      fixture.componentRef.setInput(
        'displayFn',
        (item: unknown) => (item as TestItem).name,
      );
      fixture.detectChanges();
      openDropdown();
      const listbox = getListbox();
      expect(listbox).toBeTruthy();
    });

    it('should have role="option" on each dropdown item', () => {
      fixture.componentRef.setInput('items', SAMPLE_ITEMS);
      fixture.componentRef.setInput(
        'displayFn',
        (item: unknown) => (item as TestItem).name,
      );
      fixture.detectChanges();
      openDropdown();

      const options = getOptions();
      expect(options.length).toBe(4);
    });
  });
});


