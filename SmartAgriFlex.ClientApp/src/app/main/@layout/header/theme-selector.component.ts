import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {ThemeSelection} from "../../../@theme/theme-selection.enum";
import {ThemingService} from "../../../@theme/management/theming.service";
import {autoMarkForCheck} from "../../../@shared/utils/change-detection-helpers";

interface ThemeOption {
  displayName: string;
  value: ThemeSelection;
}

@UntilDestroy()
@Component({
  selector: 'app-theme-selector',
  template: `
    <p-listbox [options]="langOptions" optionLabel="displayName" optionValue="value"
               [ngModel]="activeThemeSelection" (ngModelChange)="optionSelected($event)">
    </p-listbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSelectorComponent implements OnInit {
  langOptions: ThemeOption[] = [
    {value: ThemeSelection.System, displayName: 'System'},
    {value: ThemeSelection.Light, displayName: 'Light'},
    {value: ThemeSelection.Dark, displayName: 'Dark'},
  ];

  activeThemeSelection!: ThemeSelection;

  constructor(
    private readonly themingService: ThemingService,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.themingService.activeSelection.value$
      .pipe(
        autoMarkForCheck(this.cd),
        untilDestroyed(this),
      )
      .subscribe(newSelection => this.activeThemeSelection = newSelection);
  }

  optionSelected(value: ThemeSelection): void {
    this.themingService.setSelection(value);
  }
}
