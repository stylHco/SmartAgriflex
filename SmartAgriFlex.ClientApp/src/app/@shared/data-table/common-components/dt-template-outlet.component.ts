import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit, TemplateRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DT_ROW_MODEL_INPUT, DT_TEMPLATES_PROVIDER} from "../common";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {autoMarkForCheck} from "../../utils/change-detection-helpers";
import {DynamicComponentBlueprint} from "../../dynamic-component/dynamic-component.blueprint";

const TEMPLATE_NAME_KEY = 'templateName';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container
      [ngTemplateOutlet]="template"
      [ngTemplateOutletContext]="templateContext"/>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DtTemplateOutletComponent implements OnInit {
  private readonly templatesProvider = inject(DT_TEMPLATES_PROVIDER);
  private readonly cd = inject(ChangeDetectorRef);

  @Input(TEMPLATE_NAME_KEY)
  templateName?: string;

  @Input(DT_ROW_MODEL_INPUT)
  rowData?: any;

  ngOnInit(): void {
    this.templatesProvider.templates
      .changes
      .pipe(
        untilDestroyed(this),
        autoMarkForCheck(this.cd),
      )
      .subscribe();
  }

  get template(): TemplateRef<any> | null {
    if (!this.templateName) return null;

    return this.templatesProvider.templates
      .find(template => template.name === this.templateName)
      ?.templateRef ?? null;
  }

  // TODO: this makes very big assumptions:
  // * What if we are managing a template for non-cell (header/filter/etc)
  // * What if we want to add other data?
  // Also TODO: does this cause view re-instantiation when the rowData changes (not common but it shouldn't)?
  get templateContext(): Object | null {
    if (!this.rowData) return null;

    return {
      $implicit: this.rowData,
    };
  }
}

export function prepareTemplateOutlet(templateName: string): DynamicComponentBlueprint<unknown> {
  return {
    componentType: DtTemplateOutletComponent,
    initSetInputs: {
      [TEMPLATE_NAME_KEY]: templateName,
    },
  };
}
