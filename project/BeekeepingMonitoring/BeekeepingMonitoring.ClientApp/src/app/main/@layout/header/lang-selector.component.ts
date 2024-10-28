import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {TranslocoService} from "@ngneat/transloco";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {autoMarkForCheck} from "../../../@shared/utils/change-detection-helpers";

interface LangOption {
  displayName: string;
  code: string;
}

@UntilDestroy()
@Component({
  selector: 'app-lang-selector',
  template: `
    <p-listbox [options]="langOptions" optionLabel="displayName"
               [ngModel]="activeLangOption" (ngModelChange)="optionSelected($event)">
    </p-listbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangSelectorComponent implements OnInit {
  langOptions: LangOption[] = [
    {code: 'en', displayName: 'English'},
    {code: 'gr', displayName: 'Greek'},
    {code: 'ru', displayName: 'Russian'},
  ];

  activeLangOption!: LangOption;

  constructor(
    private readonly transloco: TranslocoService,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.transloco.langChanges$
      .pipe(
        autoMarkForCheck(this.cd),
        untilDestroyed(this),
      )
      .subscribe(lang => this.activeLangOption = this.langOptions.find(o => o.code === lang)!);
  }

  optionSelected(option: LangOption) {
    this.transloco.setActiveLang(option.code);
  }
}
