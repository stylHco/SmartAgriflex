import {FilterService} from "primeng/api";

export function ensureFilterModeExists(service: FilterService, mode: string | symbol, filterFn: Function): void {
  if (!(mode in service.filters)) {
    // @ts-ignore
    service.filters[mode] = filterFn;
  }
}
