import { Component, EventEmitter, Output } from '@angular/core';
import { PhotographerService } from '../services/photographer-service';

@Component({
  selector: 'app-photographers-list',
  standalone: false,
  templateUrl: './photographers-list.html',
  styleUrls: ['./photographers-list.scss'],
})
export class PhotographersList {
  protected photographers: any[] = [];
  protected renderedList: any[] = [];
  protected itemsToShow: number = 20;

  constructor(private photographerService: PhotographerService) {
  }

  ngOnInit() {
    this.photographerService.getPhotographers().subscribe(photographers => {
      this.photographers = photographers;
      this.renderedList = this.photographers.slice(0, this.itemsToShow);
    });
  }

  onFilterChange(query: string) {
    if (query.trim() === '') {
      this.renderedList = this.photographers.slice(0, this.itemsToShow);
    } else {
      this.renderedList = this.photographers.filter(photographer =>
        photographer.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, this.itemsToShow);
    }
  }
}