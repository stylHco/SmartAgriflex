import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {createAccountSubmenu} from "./account-submenu";
import {MenuItem} from "primeng/api";

@Component({
  template: `
    <div class="grid">
      <div class="md:col-3 lg:col-2">
        <p-menu [model]="menuItems" class="parent-width"></p-menu>
      </div>

      <div class="md:col-9 lg:col-10">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AccountComponent implements OnInit {
  menuItems!: MenuItem[];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    const path = this.activatedRoute.pathFromRoot
      .map(activatedRoute => activatedRoute.snapshot.url)
      .reduce((previousValue, currentValue) => previousValue.concat(currentValue))
      .map(urlSegment => urlSegment.toString())
      .reduce((previousValue, currentValue) => previousValue + '/' + currentValue);

    this.menuItems = createAccountSubmenu('/' + path);
  }
}
