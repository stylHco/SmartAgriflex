import {ChangeDetectionStrategy, Component, HostBinding, Input, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LocalDate} from "@js-joda/core";
import {localDateToNative} from "./joda.helpers";

@Component({
  selector: 'app-date-time-display',
  template: `
    {{ value | date:format }}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeDisplayComponent {
  /**
   * Non-date values will simply produce no output - manually wrap in NullReplacerDirective if needed
   */
  @Input()
  value: Date | null = null;

  @Input()
  format = 'dd/MM/YYYY HH:mm:ss';

  @HostBinding('attr.title')
  get title(): string | undefined {
    return this.value instanceof Date ? this.value.toString() : undefined;
  }
}

@Component({
  selector: 'app-date-display',
  template: `
    {{ nativeDate | date:format }}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateDisplayComponent {
  /**
   * Non-date values will simply produce no output - manually wrap in NullReplacerDirective if needed
   */
  @Input()
  public set value(value: Date | LocalDate | null) {
    if (value instanceof Date) {
      this.nativeDate = value;
      return;
    }

    if (value instanceof LocalDate) {
      this.nativeDate = localDateToNative(value)!;
      return;
    }

    this.nativeDate = null;
  }

  @Input()
  public format = 'dd/MM/YYYY';

  nativeDate: Date | null = null;

  @HostBinding('attr.title')
  get title(): string | undefined {
    return this.nativeDate instanceof Date ? this.nativeDate.toDateString() : undefined;
  }
}

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    DateTimeDisplayComponent,
    DateDisplayComponent,
  ],
  exports: [
    DateTimeDisplayComponent,
    DateDisplayComponent,
  ],
})
export class DateTimeDisplayModule {
}
