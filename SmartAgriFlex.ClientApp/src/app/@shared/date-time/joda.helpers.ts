import {convert, LocalDate, nativeJs} from "@js-joda/core";

export function localDateToNative(localDate: LocalDate): Date;
export function localDateToNative(localDate: LocalDate | null): Date | null;
export function localDateToNative(localDate: LocalDate | undefined): Date | undefined;
export function localDateToNative(localDate: LocalDate | null | undefined): Date | null | undefined;
export function localDateToNative(localDate: LocalDate | null | undefined): Date | null | undefined {
  if (!localDate) return localDate;

  return convert(localDate).toDate();
}

export function nativeToLocalDate(nativeDate: Date): LocalDate;
export function nativeToLocalDate(nativeDate: Date | null): LocalDate | null;
export function nativeToLocalDate(nativeDate: Date | undefined): LocalDate | undefined;
export function nativeToLocalDate(nativeDate: Date | null | undefined): LocalDate | null | undefined;
export function nativeToLocalDate(nativeDate: Date | null | undefined): LocalDate | null | undefined {
  if (!nativeDate) return nativeDate;

  return LocalDate.from(nativeJs(nativeDate));
}
