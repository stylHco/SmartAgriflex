import {
  ComponentRef,
  createNgModule,
  EnvironmentInjector, Injector,
  NgModuleRef,
  StaticProvider,
  ViewContainerRef
} from "@angular/core";
import {LazyComponentBlueprint} from "./lazy-component-loader";

export interface LazyComponentRef<TModule, TComponent> {
  readonly module: NgModuleRef<TModule>;
  readonly component: ComponentRef<TComponent>;

  /**
   * Shorthand for calling destroy on first module and then component
   */
  destroy(): void;
}

type LazyComponentCreationOptionsFull = {
  injectorName: string;
  componentProviders: StaticProvider[];
};

export type LazyComponentCreationOptions = Partial<LazyComponentCreationOptionsFull>;

const lazyComponentOptionsDefaults: LazyComponentCreationOptionsFull = {
  injectorName: 'createLazyComponent',
  componentProviders: [],
};

export function createLazyComponent<TModule, TComponent>(
  blueprint: LazyComponentBlueprint<TModule, TComponent>,
  viewContainerRef: ViewContainerRef,
  options: LazyComponentCreationOptions = {},
): LazyComponentRef<TModule, TComponent> {
  const mergedOptions = {...lazyComponentOptionsDefaults, ...options};

  const componentParentInjector = viewContainerRef.injector;
  const environmentInjector = componentParentInjector.get(EnvironmentInjector);

  const moduleRef = createNgModule(blueprint.module, environmentInjector);
  const componentType = blueprint.component(moduleRef);

  const componentInjector = Injector.create({
    name: mergedOptions.injectorName,
    parent: componentParentInjector,
    providers: mergedOptions.componentProviders,
  });

  const componentRef = viewContainerRef.createComponent(componentType, {
    ngModuleRef: moduleRef,
    injector: componentInjector,
  });

  return new LazyComponentRefImpl(moduleRef, componentRef);
}

class LazyComponentRefImpl<TModule, TComponent> implements LazyComponentRef<TModule, TComponent> {
  constructor(
    public readonly module: NgModuleRef<TModule>,
    public readonly component: ComponentRef<TComponent>,
  ) {
  }

  destroy() {
    this.component.destroy();
    this.module.destroy();
  }
}
