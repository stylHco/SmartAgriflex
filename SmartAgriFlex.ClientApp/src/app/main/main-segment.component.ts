import { Component, OnInit } from '@angular/core';

@Component({
  template: `
    <app-main-segment-layout>
      <app-main-segment-menu></app-main-segment-menu>
      <router-outlet></router-outlet>
    </app-main-segment-layout>
  `
})
export class MainSegmentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
