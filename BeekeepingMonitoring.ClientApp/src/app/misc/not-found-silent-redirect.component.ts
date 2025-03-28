import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {sendToNotFound} from "../@shared/error-handling/error-handling.helpers";

@Component({
  template: ``,
})
export class NotFoundSilentRedirectComponent implements OnInit {
  constructor(
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    sendToNotFound(this.router);
  }
}
