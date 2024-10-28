import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-multi-line-text',
  standalone: true,

  // Important: no whitespace around interpolation, else
  // https://stackoverflow.com/q/47438621/2588539
  template: `{{ text }}`,

  styles: [
    `:host {
      white-space: pre-wrap;
    }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiLineTextComponent {
  @Input()
  public text: string = '';
}
