import {
  ComponentMirror,
  ComponentRef,
  Directive, DoCheck,
  inject,
  Injector,
  Input, KeyValueDiffer, KeyValueDiffers, reflectComponentType,
  StaticProvider,
  ViewContainerRef,
} from '@angular/core';
import {DynamicComponentBlueprint, DynamicComponentInputs} from "./dynamic-component.blueprint";

type ComponentRuntimeData<TComponent> = {
  readonly ref: ComponentRef<TComponent>;

  readonly dynamicInputsDiffer: KeyValueDiffer<string, any>;
  readonly optionalInputsDiffer: KeyValueDiffer<string, any>;

  /**
   * Fetched/cached on demand.
   * https://github.com/angular/angular/blob/8d99ad0a39d4092407972265dbd69b4d3ae1b241/packages/core/src/render3/component.ts#L168
   */
  mirror?: ComponentMirror<TComponent>;
};

@Directive({
  selector: 'ng-container [appDynamicComponentOutlet]',
  standalone: true,
})
export class DynamicComponentOutletDirective<
  TComponent = any,
  TInputs extends DynamicComponentInputs = DynamicComponentInputs,
> implements DoCheck {
  get blueprint(): DynamicComponentBlueprint<TComponent, TInputs> | undefined {
    return this._blueprint;
  }

  @Input('appDynamicComponentOutlet')
  set blueprint(value: DynamicComponentBlueprint<TComponent, TInputs> | undefined) {
    this._blueprint = value;
    this._blueprintDirty = true;
  }

  /**
   * A map of inputs that will be set on the component. This uses shallow diffing.
   *
   * * If there is no blueprint set, this will silently do nothing.
   * * If the blueprint is changed at the same time as the inputs, the new inputs **will not** be set on the old component.
   * * If an input is missing on the component, an error will be thrown.
   */
  @Input() public dynamicInputs: Partial<TInputs> = {};

  /**
   * A map of inputs that will be set on the component. This uses shallow diffing.
   *
   * * If there is no blueprint set, this will silently do nothing.
   * * If the blueprint is changed at the same time as the inputs, the new inputs **will not** be set on the old component.
   * * If an input is missing on the component, the specific key-value pair will silently do nothing.
   */
  @Input() public optionalInputs: Partial<TInputs> | DynamicComponentInputs = {};

  private _blueprint?: DynamicComponentBlueprint<TComponent, TInputs>;
  private _blueprintDirty: boolean = false;

  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _kvDifferFactory = inject(KeyValueDiffers).find({});

  private _componentRuntime?: ComponentRuntimeData<TComponent>;

  ngDoCheck() {
    if (this._blueprintDirty) {
      this._blueprintDirty = false;
      this.reCreateComponent();
    }

    this.processDynamicInputs();
  }

  private reCreateComponent() {
    this._componentRuntime?.ref.destroy();
    this._componentRuntime = undefined;

    if (!this._blueprint) return;

    let injector: Injector | undefined = undefined;
    if (this._blueprint.providers?.length ?? 0 > 0) {
      injector = Injector.create({
        providers: this._blueprint.providers as StaticProvider[], // Need to remove readonly
        parent: this._viewContainerRef.injector,
        name: 'DynamicComponentOutletDirective',
      });
    }

    this._componentRuntime = {
      ref: this._viewContainerRef.createComponent(this._blueprint.componentType, {
        injector: injector,
      }),

      dynamicInputsDiffer: this._kvDifferFactory.create(),
      optionalInputsDiffer: this._kvDifferFactory.create(),
    };

    if (!this._blueprint.initSetInputs) return;

    for (let inputName in this._blueprint.initSetInputs) {
      this._componentRuntime.ref.setInput(inputName, this._blueprint.initSetInputs[inputName]);
    }

    // No need to set dynamic inputs here - they will be automatically processed by the differ as all new right after
  }

  private processDynamicInputs(): void {
    if (!this._componentRuntime) return;

    this.diffAndApplyInputs(this._componentRuntime.dynamicInputsDiffer, this.dynamicInputs, false);
    this.diffAndApplyInputs(this._componentRuntime.optionalInputsDiffer, this.optionalInputs, true);
  }

  // To be called ONLY FROM processDynamicInputs()
  private diffAndApplyInputs(
    differ: KeyValueDiffer<string, any>,
    inputs: DynamicComponentInputs,
    isOptional: boolean,
  ): void {
    const changes = differ.diff(inputs);
    if (!changes) return;

    let setInput: (name: string, value: unknown) => void;
    if (!isOptional) {
      setInput = (name, value) => {
        this._componentRuntime!.ref.setInput(name, value);
      }
    } else {
      setInput = (name, value) => {
        // Check if the input exists
        const mirror = getAndCacheComponentMirror(this._componentRuntime!);
        if (!mirror.inputs.some(input => input.templateName === name)) return;

        // Exists, proceed to set
        this._componentRuntime!.ref.setInput(name, value);
      }
    }

    changes.forEachAddedItem(change => {
      setInput(change.key, change.currentValue);
    });

    changes.forEachChangedItem(change => {
      setInput(change.key, change.currentValue);
    });

    changes.forEachRemovedItem(change => {
      setInput(change.key, undefined);
    });
  }
}

function getAndCacheComponentMirror<T>(runtime: ComponentRuntimeData<T>): ComponentMirror<T> {
  if (!runtime.mirror) {
    runtime.mirror = reflectComponentType(runtime.ref.componentType) ?? undefined;

    if (!runtime.mirror) {
      throw 'Failed to reflect component';
    }
  }

  return runtime.mirror;
}
