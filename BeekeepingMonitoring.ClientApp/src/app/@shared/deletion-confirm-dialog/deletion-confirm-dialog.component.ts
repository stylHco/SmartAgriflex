import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-deletion-confirm-dialog',
  templateUrl: './deletion-confirm-dialog.component.html',
  styleUrls: ['./deletion-confirm-dialog.component.scss'],
})
export class DeletionConfirmDialogComponent {
  @Input()
  isOpen = false;

  @Output()
  isOpenChange = new EventEmitter<boolean>();

  @Input()
  isDraft = false;

  @Input()
  itemDeletedName = '';

  @Input()
  inProgress = false;

  @Output()
  accepted = new EventEmitter<never>();

  @Output()
  rejected = new EventEmitter<never>();

  onAccept() {
    this.accepted.emit(undefined);
  }

  onReject() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);

    this.rejected.emit(undefined);
  }
}
