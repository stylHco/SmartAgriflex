import {Directive, HostBinding, Input, OnInit} from '@angular/core';
import {IdNamespaceContainerDirective} from "./id-namespace-container.directive";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {BehaviorSubject, combineLatest, filter} from "rxjs";

@UntilDestroy()
@Directive({
  selector: '[namespacedFor]'
})
export class NamespacedForDirective implements OnInit {
  private localIdSubject = new BehaviorSubject<string|undefined>(undefined);

  @Input('namespacedFor')
  public set localId(newValue: string) {
    this.localIdSubject.next(newValue);
  }

  @HostBinding('for')
  finalId: string = '';

  constructor(
    private readonly namespaceContainer: IdNamespaceContainerDirective,
  ) {
  }

  ngOnInit(): void {
    combineLatest([
      this.namespaceContainer.namespace$
        .pipe(
          filter(value => !!value),
        ),

      this.localIdSubject
        .pipe(
          filter(value => !!value),
        ),
    ])
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(values => this.finalId = values[0] + values[1]);
  }
}
