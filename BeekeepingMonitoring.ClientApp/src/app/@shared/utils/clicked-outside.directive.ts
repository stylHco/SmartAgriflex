import {Directive, ElementRef, EventEmitter, HostListener, inject, Output} from '@angular/core';

@Directive({
  selector: '[appClickedOutside]',
  standalone: true,
})
export class ClickedOutsideDirective {
  private readonly elementRef = inject(ElementRef);

  @Output()
  public readonly clickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  protected onClick($event: Event) {
    const target = $event.target;
    if (!target) return;

    if (this.elementRef.nativeElement.isSameNode(target)) return;
    if (this.elementRef.nativeElement.contains(target)) return;

    this.clickOutside.emit();
  }
}
