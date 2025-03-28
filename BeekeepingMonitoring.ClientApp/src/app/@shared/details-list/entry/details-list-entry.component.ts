import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-details-list-entry',
  templateUrl: './details-list-entry.component.html',
  styleUrls: ['./details-list-entry.component.scss'],
  host: {
    'class': 'grid grid-nogutter',
  },
})
export class DetailsListEntryComponent {
  @Input()
  public label: string = '';

  @Input()
  public disableLabel = false;
}
