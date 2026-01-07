import { Component } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: false,
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  @Input() placeholder: string = 'Rechercher un photographe...';
  @Output() filter = new EventEmitter<string>();

  query = '';

  onQueryChange(value: string) {
    this.query = value;
    this.filter.emit(this.query);
  }
}