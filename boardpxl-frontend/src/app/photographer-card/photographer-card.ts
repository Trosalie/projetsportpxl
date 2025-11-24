import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-photographer-card',
  standalone: false,
  templateUrl: './photographer-card.html',
  styleUrl: './photographer-card.scss',
})
export class PhotographerCard {
  @Input() photographer!: any;
  
}
