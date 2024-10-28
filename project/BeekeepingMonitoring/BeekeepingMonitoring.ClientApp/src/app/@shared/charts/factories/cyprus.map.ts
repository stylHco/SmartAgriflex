import {ICommonChartDataSetter, ICommonChartWrapper} from "../common-chart.structures";
import {getDefaultOrFirstDataset, getDefaultOrFirstSeries} from "./shared";
import {
  CommonVizDataContainer,
  CommonVizTabularDataset,
  CommonVizTabularDatasetDescriptor,
  DEFAULT_SERIES_VALUE
} from "../common-viz-data";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_cyprus from "@amcharts/amcharts5-geodata/cyprusLow";

export interface CyprusMapOptions {
  //
}

export function configureCyprusMap(wrapper: ICommonChartWrapper, options: CyprusMapOptions): void {
  const datasetKey = getDefaultOrFirstDataset(wrapper.dataDescriptor);
  const datasetDescriptor = wrapper.dataDescriptor[datasetKey] as CommonVizTabularDatasetDescriptor;

  const categoryField = datasetDescriptor.keyFields[0];
  const valueField = datasetDescriptor.valueFields[getDefaultOrFirstSeries(datasetDescriptor)][DEFAULT_SERIES_VALUE];

  const root = wrapper.root;

  const chart = root.container.children.push(am5map.MapChart.new(root, {
    panX: 'rotateX',
    projection: am5map.geoMercator(),
    layout: root.horizontalLayout,
  }));

  const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    geoJSON: am5geodata_cyprus,
  }));

  polygonSeries.mapPolygons.template.setAll({
    tooltipText: "{name} ({value})",
    interactive: true,
  });

  wrapper.dataSetters.push(new CyprusMapDataSetter(datasetKey, polygonSeries, categoryField, valueField));
}

const districtToIdMap: { [district: string]: string } = {
  'Larnaca': 'CY-03',
  'Pafos': 'CY-05',
  'Limassol': 'CY-02',
  'Famagusta': 'CY-04',
  'Nicosia': 'CY-01',
};

export class CyprusMapDataSetter implements ICommonChartDataSetter {
  constructor(
    private readonly datasetKey: string,
    private readonly polygonSeries: am5map.MapPolygonSeries,
    private readonly categoryField: string,
    private readonly valueField: string,
  ) {
  }

  setData(data: CommonVizDataContainer): void {
    const transformed = (data[this.datasetKey] as CommonVizTabularDataset)
      .map(entry => {
        const district: string|undefined = entry[this.categoryField] ?? undefined;

        let id: string|undefined;
        if (district) id = districtToIdMap[district] ?? undefined;

        return {
          id: id,
          value: entry[this.valueField],
        };
      })
      .filter(entry => !!entry.id);

    this.polygonSeries.data.setAll(transformed);
  }
}
