import { Component, OnInit } from '@angular/core';
import Map from '@arcgis/core/Map'; // Import the ArcGIS Map class
import MapView from '@arcgis/core/views/MapView'; // Import MapView to display the map
import Graphic from '@arcgis/core/Graphic'; // Import Graphic for rendering geometry and symbols on the map
import Point from '@arcgis/core/geometry/Point'; // Import Point for defining geographic points
import { Geolocation } from '@capacitor/geolocation'; // Import Geolocation from Capacitor for obtaining user location
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol'; // Import SimpleMarkerSymbol to create marker styles
import ImageryLayer from '@arcgis/core/layers/ImageryLayer'; // Import ImageryLayer for adding satellite/radar layers to the map
import { PopoverController, AlertController } from '@ionic/angular'; // Import Ionic controllers for popups and alerts
import { PopoverComponent } from './popover.component'; // Import custom popover component (adjust path as needed)

@Component({
  selector: 'app-home', // Define the selector used to include this component in HTML
  templateUrl: 'home.page.html', // Link to the component's HTML file
  styleUrls: ['home.page.scss'], // Link to the component's stylesheet
})
export class HomePage implements OnInit {
  mapView: MapView | any; // MapView instance to display the map
  userLocationGraphic: Graphic | any; // Variable to hold the user's location graphic
  map!: Map; // Definite assignment assertion to declare the map variable without initializing it

  constructor(private popoverController: PopoverController, private alertController: AlertController) {}
  // Inject Ionic popover and alert controllers for use later

  async ngOnInit() {
    // On component initialization
    this.map = new Map({
      basemap: 'topo-vector', // Set default basemap to a topographic vector style
    });

    this.mapView = new MapView({
      container: 'container', // HTML container for displaying the map
      map: this.map, // Assign the map instance
      zoom: 12, // Initial zoom level
    });

    let weatherServiceFL = new ImageryLayer({ url: WeatherServiceUrl });
    // Add weather service layer to the map
    this.map.add(weatherServiceFL);

    await this.updateUserLocationOnMap();
    // Get and update user's location on the map

    this.mapView.center = this.userLocationGraphic.geometry as Point;
    // Center the map at the user's current location

    setInterval(this.updateUserLocationOnMap.bind(this), 10000);
    // Update user location on the map every 10 seconds

    this.addUSAMarker();
    // Add a marker for the USA location
  }

  async getLocationService(): Promise<number[]> {
    // Get user location using browser's geolocation API
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((resp) => {
        resolve([resp.coords.latitude, resp.coords.longitude]);
      });
    });
  }

  async updateUserLocationOnMap() {
    // Function to update the user's location on the map
    let latLng = await this.getLocationService();
    // Fetch the current latitude and longitude
    let geom = new Point({ latitude: latLng[0], longitude: latLng[1] });
    // Create a Point geometry using the coordinates

    // Define a red marker symbol for the user's location
    const redMarkerSymbol = new SimpleMarkerSymbol({
      color: [255, 0, 0, 1], // Red marker color (RGBA)
      size: 8, // Marker size
      outline: {
        color: [255, 255, 255, 1], // White outline color
        width: 1 // Outline width
      }
    });

    if (this.userLocationGraphic) {
      // If the user's location graphic already exists, update its geometry
      this.userLocationGraphic.geometry = geom;
    } else {
      // If it doesn't exist, create a new graphic with the red marker symbol
      this.userLocationGraphic = new Graphic({
        symbol: redMarkerSymbol, // Red marker symbol
        geometry: geom,
      });
      this.mapView.graphics.add(this.userLocationGraphic);
      // Add the user's location graphic to the map view
    }
  }

  // Function to add a marker in the USA (New York City)
  addUSAMarker() {
    const usaCoordinates = { latitude: 41.926065, longitude: -83.837319 };
    // Coordinates for New York City

    // Define a blue marker symbol for the USA marker
    const usaMarkerSymbol = new SimpleMarkerSymbol({
      color: [0, 0, 255, 1], // Blue marker color (RGBA)
      size: 8, // Marker size
      outline: {
        color: [255, 255, 255, 1], // White outline color
        width: 1 // Outline width
      }
    });

    const usaPoint = new Point({
      latitude: usaCoordinates.latitude,
      longitude: usaCoordinates.longitude
    });
    // Create a Point geometry for New York City's coordinates

    const usaGraphic = new Graphic({
      symbol: usaMarkerSymbol, // Use the blue marker symbol
      geometry: usaPoint
    });

    this.mapView.graphics.add(usaGraphic);
    // Add the USA marker to the map view
  }

  // Function to show a popup using Ionic's PopoverController
  async showPopup() {
    const popoverElement = await this.popoverController.create({
      component: PopoverComponent, // Popover content from PopoverComponent
      translucent: true, // Make the popup translucent
    });
    await popoverElement.present();
    // Present the popover
  }

  // Function to show an alert displaying the user's location
  async findLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      // Get the user's current position using Capacitor's Geolocation plugin
      const userLongitude = position.coords.longitude;
      const userLatitude = position.coords.latitude;

      // Create an alert displaying the user's location
      const alert = await this.alertController.create({
        header: 'Your Location',
        message: `Longitude: ${userLongitude}, Latitude: ${userLatitude}`,
        buttons: ['OK'],
      });

      await alert.present();
      // Present the alert
    } catch (error) {
      // Handle errors by showing an error alert
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Unable to find your location.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  // Function to change the basemap of the map
  changeBasemap(basemap: string) {
    if (this.map) {
      // Check if the map object is initialized
      this.map.basemap = basemap as any;
      // Change the basemap type to the selected one
    }
  }
}

// URL for the weather service to display radar data
const WeatherServiceUrl = 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer';
