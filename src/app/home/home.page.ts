import { Component, OnInit } from '@angular/core';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Point from '@arcgis/core/geometry/Point';
import { Geolocation } from '@capacitor/geolocation';
import { PopoverController, AlertController } from '@ionic/angular';
import { PopoverComponent } from './popover.component'; // Pastikan ini diimport

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private popoverController: PopoverController,
    private alertController: AlertController
  ) {}

  public async ngOnInit() {
    try {
      // Initialize the Map
      const map = new Map({
        basemap: 'topo-vector' // Use a basemap for the map
      });

      // Initialize the MapView and assign it to the container
      const view = new MapView({
        container: 'container', // Ensure this div exists in your HTML
        map: map,
        zoom: 15 // Adjust zoom as needed
      });

      // Attempt to get the user's current position
      const position = await Geolocation.getCurrentPosition();
      const userLongitude = position.coords.longitude;
      const userLatitude = position.coords.latitude;

      // Update MapView center with user's current location
      view.center = new Point({
        longitude: userLongitude,
        latitude: userLatitude
      });

      // Create a marker symbol
      const markerSymbol = new SimpleMarkerSymbol({
        color: [255, 0, 0], // Red color
        outline: {
          color: [255, 255, 255], // White outline
          width: 1
        }
      });

      // Create a point geometry for the marker
      const point = new Point({
        longitude: userLongitude,
        latitude: userLatitude
      });

      // Create a graphic with the marker symbol and point geometry
      const pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol
      });

      // Add the marker graphic to the view
      view.graphics.add(pointGraphic);

    } catch (error) {
      console.error('Error getting location', error);

      // Default coordinates if location cannot be obtained
      const defaultLongitude = 106.767033;
      const defaultLatitude = -6.428596;

      // Initialize the Map
      const map = new Map({
        basemap: 'topo-vector'
      });

      // Initialize the MapView and assign it to the container
      const view = new MapView({
        container: 'container',
        map: map,
        zoom: 15,
        center: [defaultLongitude, defaultLatitude] // Default center
      });

      // Create a marker symbol
      const markerSymbol = new SimpleMarkerSymbol({
        color: [0, 0, 255], // Blue color
        outline: {
          color: [255, 255, 255], // White outline
          width: 1
        }
      });

      // Create a point geometry for the marker
      const point = new Point({
        longitude: defaultLongitude,
        latitude: defaultLatitude
      });

      // Create a graphic with the marker symbol and point geometry
      const pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol
      });

      // Add the marker graphic to the view
      view.graphics.add(pointGraphic);
    }
  }

  // Function to show popup information
  async showPopup() {
    const popoverElement = await this.popoverController.create({
      component: PopoverComponent, // Memanggil komponen popover yang didefinisikan
      translucent: true
    });
    await popoverElement.present();
  }

  // Function to show alert for location
  async findLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const userLongitude = position.coords.longitude;
      const userLatitude = position.coords.latitude;

      const alert = await this.alertController.create({
        header: 'Your Location',
        message: `Longitude: ${userLongitude}, Latitude: ${userLatitude}`,
        buttons: ['OK']
      });

      await alert.present();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Unable to find your location.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
