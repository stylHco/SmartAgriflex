import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Directive,
  EmbeddedViewRef, EnvironmentInjector,
  Input,
  NgModule,
  OnChanges, SimpleChanges, TemplateRef, ViewContainerRef
} from '@angular/core';
import {TranslocoModule} from "@ngneat/transloco";

@Component({
  selector: 'app-empty-replacement',
  template: `
    <ng-container *transloco="let t">
      <i>{{ t('generic.empty') }}</i>
    </ng-container>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyReplacementComponent {
}

type ReplacedTypes = ''|[];

@Directive({
  selector: '[appEmptyReplacer]',
})
export class EmptyReplacerDirective<T = unknown> implements OnChanges {
  @Input('appEmptyReplacer')
  value: T|ReplacedTypes = '';

  private replacementComponentRef: ComponentRef<EmptyReplacementComponent>|null = null;
  private embeddedViewRef: EmbeddedViewRef<unknown>|null = null;

  constructor(
    private readonly environmentInjector: EnvironmentInjector,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<unknown>,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    const shouldReplace = this.value instanceof Array
      ? this.value.length < 1
      : this.value === '';

    if (!shouldReplace) {
      // Create content when it should exist
      if (!this.embeddedViewRef) {
        this.embeddedViewRef = this.viewContainerRef.createEmbeddedView(this.templateRef);
      }

      // Destroy the replacement when it should exist
      if (!!this.replacementComponentRef) {
        this.replacementComponentRef.destroy();
        this.replacementComponentRef = null;
      }
    } else {
      // Destroy content when it shouldn't exist
      if (!!this.embeddedViewRef) {
        this.embeddedViewRef.destroy();
        this.embeddedViewRef = null;
      }

      // Create the replacement when it should exist
      if (!this.replacementComponentRef) {
        this.replacementComponentRef = this.viewContainerRef.createComponent(EmptyReplacementComponent, {
          environmentInjector: this.environmentInjector,
        });
      }
    }
  }

  static ngTemplateGuard_appNullReplacer<T>(
    dir: EmptyReplacerDirective<T>,
    value: T|ReplacedTypes
  ): value is Exclude<T, ReplacedTypes> {
    return true;
  }
}

@NgModule({
  imports: [
    TranslocoModule,
  ],
  declarations: [
    EmptyReplacementComponent,
    EmptyReplacerDirective,
  ],
  exports: [
    EmptyReplacerDirective,
    EmptyReplacementComponent,
  ]
})
export class EmptyReplacerModule {
}
