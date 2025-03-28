import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AbstractTableContentComponent, TableContentImportsModule} from "../abstract-table-content.component";
import {IDashboardTableAssociationRule} from "../../../../../../@core/app-api";
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  imports: [TableContentImportsModule, CommonModule],
  templateUrl: './association-rules.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AssociationRulesComponent extends AbstractTableContentComponent<IDashboardTableAssociationRule[]> {
}
