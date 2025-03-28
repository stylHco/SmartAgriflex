export type EnumKeys<T extends object> = (keyof T & string)[];

export function getAllEnumKeys<T extends object>(enumType: T): EnumKeys<T> {
  return Object
    .keys(enumType)
    .filter(key => isNaN(Number(key))) as any;
}

export type EnumValue<T> = T[keyof T];

export type EnumKeyValue<T extends object> = {
  key: keyof T & string,
  value: EnumValue<T>,
};

export function getAllEnumPairs<T extends object>(enumType: T): EnumKeyValue<T>[] {
  return getAllEnumKeys(enumType)
    .map(key => ({
      key: key,
      value: enumType[key],
    }));
}

export type EnumLabels<T extends object> = { [value in keyof T]: string };

export type EnumOption<T> = { value: EnumValue<T>, label: string };
export type EnumOptions<T> = EnumOption<T>[];

export function buildEnumOptions<T extends object>(enumType: T, labels: EnumLabels<T>): EnumOptions<T> {
  return getAllEnumKeys(enumType)
    .map(key => ({
      value: enumType[key],
      label: labels[key],
    }));
}
