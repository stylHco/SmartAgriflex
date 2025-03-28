import {Injectable} from "@angular/core";
import {Loadable} from "../../@shared/loadables/loadable";
import {ConfigurableDashboardClient} from "../app-api";

@Injectable()
export class ConfigurableDashboardsRegistry {
  constructor(
    private readonly dashboardClient: ConfigurableDashboardClient,
  ) {
  }

  public readonly dashboardsLoadable = new Loadable(() => this.dashboardClient.list(), false);
}
