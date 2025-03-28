import {
  ChangeDetectionStrategy,
  Component, ComponentRef,
  Directive, EmbeddedViewRef, EnvironmentInjector,
  Input,
  NgModule, OnChanges, SimpleChanges,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {TranslocoModule} from "@ngneat/transloco";

@Component({
  selector: 'app-null-replacement',
  template: `
    <ng-container *transloco="let t">
      <i>{{ t('generic.na') }}</i>
    </ng-container>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NullReplacementComponent {
}

@Directive({
  selector: '[appNullReplacer]',
})
export class NullReplacerDirective<T = unknown> implements OnChanges {
  @Input('appNullReplacer')
  value: T|null = null;

  private replacementComponentRef: ComponentRef<NullReplacementComponent>|null = null;
  private embeddedViewRef: EmbeddedViewRef<unknown>|null = null;

  constructor(
    private readonly environmentInjector: EnvironmentInjector,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<unknown>,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    const shouldReplace = this.value === null;

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
        this.replacementComponentRef = this.viewContainerRef.createComponent(NullReplacementComponent, {
          environmentInjector: this.environmentInjector,
        });
      }
    }
  }

  static ngTemplateGuard_appNullReplacer<T>(
    dir: NullReplacerDirective<T>,
    value: T|null
  ): value is Exclude<T, null> {
    return true;
  }
}

@NgModule({
  imports: [
    TranslocoModule,
  ],
  declarations: [
    NullReplacerDirective,
    NullReplacementComponent,
  ],
  exports: [
    NullReplacerDirective,
    NullReplacementComponent,
  ],
})
export class NullReplacerModule {
}
