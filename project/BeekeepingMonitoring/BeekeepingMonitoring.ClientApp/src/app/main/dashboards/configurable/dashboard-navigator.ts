import {Injectable} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";

@Injectable()
export class DashboardNavigator {
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  public navigateToDashboard(targetDashboardId: number): Promise<boolean> {
    return this.router.navigate(
      [targetDashboardId],
      {relativeTo: this.activatedRoute.parent},
    );
  }
}
