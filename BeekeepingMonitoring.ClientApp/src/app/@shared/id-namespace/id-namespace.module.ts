import {NgModule} from '@angular/core';
import {IdNamespaceContainerDirective} from "./id-namespace-container.directive";
import {NamespaceIdPipe} from "./namespace-id.pipe";
import {NamespacedIdDirective} from './namespaced-id.directive';
import {NamespacedForDirective} from "./namespaced-for.directive";

@NgModule({
  declarations: [
    IdNamespaceContainerDirective,
    NamespaceIdPipe,
    NamespacedIdDirective,
    NamespacedForDirective,
  ],
  exports: [
    IdNamespaceContainerDirective,
    NamespaceIdPipe,
    NamespacedIdDirective,
    NamespacedForDirective,
  ],
})
export class IdNamespaceModule {
}
