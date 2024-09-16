import { Component } from '@angular/core';

@Component({
  selector: 'app-popover',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Information</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>This is the map to locate places easily using GPS.</p>
    </ion-content>
  `
})
export class PopoverComponent {}
