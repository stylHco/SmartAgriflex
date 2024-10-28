import {DynamicComponentBlueprint} from "../../../../@shared/dynamic-component/dynamic-component.blueprint";

export const TABLE_BLUEPRINT_INPUT = 'TABLE_BLUEPRINT';

export type SimpleTableComponentInputs = {
  [TABLE_BLUEPRINT_INPUT]: DynamicComponentBlueprint<any>,
};
