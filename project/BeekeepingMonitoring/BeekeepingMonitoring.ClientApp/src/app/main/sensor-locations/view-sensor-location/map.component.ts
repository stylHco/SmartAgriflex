/// <reference types="@types/google.maps" />
import {Component, AfterViewInit, ElementRef, ViewChild, Input} from '@angular/core';

@Component({
  selector: 'app-map',
  template: `
    <div #mapContainer style="width: 100%; height: 400px;"></div>
    <script
      src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE&libraries=maps&v=beta"
      defer
    ></script>
  `,
  standalone: true
})
export class MapComponent implements AfterViewInit  {
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;
  private map!: google.maps.Map;

  @Input() lng!:number;
  @Input() lat!:number;

  ngAfterViewInit(): void {
    const location = { lat: this.lat, lng: this.lng };

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center:location , zoom: 8, mapId: '1234' } as google.maps.MapOptions);

  }
}
