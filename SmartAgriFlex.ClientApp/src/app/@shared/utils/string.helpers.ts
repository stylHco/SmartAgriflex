export function emptyStringToNull(str: string): string | null {
  return str === '' ? null : str;
}
