import {Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {IdNamespaceAllocatorService} from "./id-namespace-allocator.service";
import {BehaviorSubject} from "rxjs";
import {distinctUntilChanged, shareReplay} from "rxjs/operators";

@Directive({
  selector: '[appIdNamespace]'
})
export class IdNamespaceContainerDirective implements OnInit, OnChanges, OnDestroy {
  @Input('appIdNamespace') customNamespace!: string;

  private allocatedNamespace!: string;
  private namespaceSubject = new BehaviorSubject<string>(undefined!);

  public namespace$ = this.namespaceSubject.asObservable()
    .pipe(
      distinctUntilChanged(),
      shareReplay(1),
    );

  constructor(
    private readonly allocatorService: IdNamespaceAllocatorService,
  ) {
  }

  ngOnInit(): void {
    this.allocatedNamespace = this.allocatorService.allocateNamespace();
    this.realizeNamespace();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.realizeNamespace();
  }

  private realizeNamespace() {
    if (this.customNamespace) this.namespaceSubject.next(this.customNamespace);
    else if (this.allocatedNamespace) this.namespaceSubject.next(this.allocatedNamespace);
  }

  ngOnDestroy(): void {
    this.namespaceSubject.complete();
  }
}
