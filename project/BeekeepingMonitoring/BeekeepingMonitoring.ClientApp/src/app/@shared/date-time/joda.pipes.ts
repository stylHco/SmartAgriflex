import {NgModule, Pipe, PipeTransform} from '@angular/core';
import {LocalDate} from "@js-joda/core";
import {localDateToNative} from "./joda.helpers";

@Pipe({
  name: 'fromLocalDate',
})
export class FromLocalDatePipe implements PipeTransform {
  transform(localDate: LocalDate): Date;
  transform(localDate: LocalDate | null): Date | null;
  transform(localDate: LocalDate | undefined): Date | undefined;
  transform(localDate: LocalDate | null | undefined): Date | null | undefined;
  transform(localDate: LocalDate | null | undefined): Date | null | undefined {
    return localDateToNative(localDate);
  }
}

@NgModule({
  declarations: [
    FromLocalDatePipe,
  ],
  exports: [
    FromLocalDatePipe,
  ]
})
export class JodaPipesModule {
}
