import { Component } from '@angular/core';
import { PhotographerService } from '../services/photographer-service';

@Component({
  selector: 'app-photographers-list',
  standalone: false,
  templateUrl: './photographers-list.html',
  styleUrls: ['./photographers-list.scss'],
})
export class PhotographersList {
  protected photographers: any[] = [];

  constructor(private photographerService: PhotographerService) {
  }

  ngOnInit() {
    this.photographerService.getPhotographers().subscribe(photographers => {
      this.photographers = photographers;
    });
  }
}
