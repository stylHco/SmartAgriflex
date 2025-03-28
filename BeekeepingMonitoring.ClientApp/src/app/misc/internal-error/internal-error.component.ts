import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {sendToNotFound} from "../../@shared/error-handling/error-handling.helpers";

export const IS_INTERNAl_RESOLVE_KEY = 'isInternal';

@Component({
  templateUrl: './internal-error.component.html',
  styleUrls: ['./internal-error.component.scss']
})
export class InternalErrorComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    const isInternalNavigation = this.activatedRoute.snapshot.data[IS_INTERNAl_RESOLVE_KEY] ?? false;

    // Disallow navigating to internal error page just by typing it in the URL
    if (!isInternalNavigation) {
      sendToNotFound(this.router);
    }
  }

}
