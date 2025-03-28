import {NgModuleRef, Type} from "@angular/core";

export interface LazyComponentBlueprint<TModule = unknown, TComponent = unknown> {
  module: Type<TModule>;
  component: (moduleRef: NgModuleRef<TModule>) => Type<TComponent>;
}

export type LazyComponentLoader<TModule = unknown, TComponent = unknown> =
  () => Promise<LazyComponentBlueprint<TModule, TComponent>>;

export function buildComponentLoaderSeparate<TImport, TModule, TComponent>(
  importLoader: () => Promise<TImport>,
  moduleSelector: (i: TImport) => Type<TModule>,
  componentSelector: (i: TImport) => Type<TComponent>,
) : LazyComponentLoader<TModule, TComponent> {
  return async () => {
    const loaded = await importLoader();

    return {
      module: moduleSelector(loaded),
      component: () => componentSelector(loaded),
    };
  };
}

export function buildComponentLoaderLinked<TImport, TModule, TComponent>(
  importLoader: () => Promise<TImport>,
  moduleSelector: (i: TImport) => Type<TModule>,
  componentSelector: (moduleRef: NgModuleRef<TModule>) => Type<TComponent>,
) : LazyComponentLoader<TModule, TComponent> {
  return async () => {
    const loaded = await importLoader();

    return {
      module: moduleSelector(loaded),
      component: componentSelector,
    };
  };
}
