import { Component } from '@angular/core';
import { PhotographerService } from '../services/photographer-service';

@Component({
  selector: 'app-test-caching',
  standalone: false,
  templateUrl: './test-caching.html',
  styleUrl: './test-caching.scss',
})
export class TestCaching {
  protected photographers: any[] = [];

  constructor(private photographerService: PhotographerService) {}
  loadPhotographers() {
    this.photographerService.getPhotographers().subscribe(data => {
      this.photographers = data;
    });
  }
}
