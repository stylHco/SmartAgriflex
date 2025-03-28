import {AfterViewInit, Directive, ElementRef, inject, OnDestroy} from '@angular/core';
import {MainSegmentLayoutService} from "./main-segment-layout.service";
import {removeElementFromArray} from "../../@shared/utils/collection.helpers";

@Directive({
  selector: '[appClicksInsideRetainMobileMenu]',
})
export class ClicksInsideRetainMobileMenuDirective implements AfterViewInit, OnDestroy {
  private readonly layoutService = inject(MainSegmentLayoutService);
  private readonly elementRef = inject(ElementRef);

  ngAfterViewInit(): void {
    this.layoutService.clicksInsideRetainMobileMenu.push(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    removeElementFromArray(this.layoutService.clicksInsideRetainMobileMenu, this.elementRef.nativeElement);
  }
}
