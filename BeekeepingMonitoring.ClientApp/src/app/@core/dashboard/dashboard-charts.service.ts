import {Inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_BASE} from "../../app-constants";
import {Observable} from "rxjs";
import {CommonVizDataContainer} from "../../@shared/charts/common-viz-data";

@Injectable({
  providedIn: 'root'
})
export class DashboardChartsService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE) private readonly apiBase: string,
  ) {
  }

  private readonly resourceBase = this.apiBase + 'dashboard-charts/';

  public getCommonVizData(vizPath: string): Observable<CommonVizDataContainer> {
    return this.http.get<CommonVizDataContainer>(this.resourceBase + vizPath);
  }
}
