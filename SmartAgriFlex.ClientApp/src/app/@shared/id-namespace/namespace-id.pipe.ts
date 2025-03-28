import {OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {IdNamespaceContainerDirective} from "./id-namespace-container.directive";
import {Subscription} from "rxjs";

@Pipe({
  name: 'namespaceId',
  pure: false,
})
export class NamespaceIdPipe implements PipeTransform, OnDestroy {
  private latestResult?: string;
  private latestInput?: string;

  private subscription?: Subscription;

  constructor(
    private readonly namespaceContainer: IdNamespaceContainerDirective,
  ) {
  }

  transform(value: string): string {
    if (value !== this.latestInput) {
      this.unsubscribe();

      this.subscription = this.namespaceContainer.namespace$
        .subscribe(namespace => this.latestResult = namespace + value);

      this.latestInput = value;
    }

    return this.latestResult!;
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private unsubscribe(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      delete this.subscription;
    }
  }
}
