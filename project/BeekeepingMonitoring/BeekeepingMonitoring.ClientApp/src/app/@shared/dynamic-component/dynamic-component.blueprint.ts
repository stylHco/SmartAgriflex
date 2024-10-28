import {StaticProvider, Type} from "@angular/core";

export type DynamicComponentBlueprint<
  TComponent,
  TInputs extends DynamicComponentInputs = DynamicComponentInputs,
> = Readonly<{
  /**
   * Unless you really know what you are doing, the component should be marked as standalone.
   */
  componentType: Type<TComponent>;
  providers?: Readonly<StaticProvider[]>;

  /**
   * A map of inputs that will be set right after the component is instantiated.
   *
   * If an input is missing on the component, an error will be thrown.
   */
  initSetInputs?: Readonly<Partial<TInputs>>,
}>;

/**
 * Each key-value pair is a single input.
 *
 * The key is the name specified in the @Input() decorator parameter.
 */
export type DynamicComponentInputs = { [key: string]: unknown };
