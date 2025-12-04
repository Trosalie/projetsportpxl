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
  protected bufferedList: any[] = [];
  protected filterActive: boolean = false;

  constructor(private photographerService: PhotographerService) {
  }

  ngOnInit() {
    this.photographerService.getPhotographers().subscribe(photographers => {
      this.photographers = photographers;
      this.renderedList = this.photographers.slice(0, this.itemsToShow);
    });
  }

  onFilterChange(query: string) {
    let fieldsToFilter = ['name', 'email'];
    if (query.trim() === '') {
      this.renderedList = this.photographers.slice(0, this.itemsToShow);
      this.filterActive = false;
    } else {
      this.bufferedList = this.photographers.filter(photographer =>
        fieldsToFilter.some(field =>
          photographer[field]?.toString().toLowerCase().includes(query.toLowerCase())
        )
      );
      this.renderedList = this.bufferedList.slice(0, this.itemsToShow);
      this.filterActive = true;
    }
  }
}