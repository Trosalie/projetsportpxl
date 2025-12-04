import { Component } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: false,
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  @Input() list: any[] = [];
  @Input() fieldsToFilter: string[] = [];
  @Output() filter = new EventEmitter<string>();
  @Output() listProvided = new EventEmitter<any[]>();

  query = '';

  onQueryChange(value: string) {
    this.query = value;
    this.filter.emit(this.query);
  }

  filterList(value: string) {
    let sortedList = [...this.list];
    sortedList = sortedList.filter(item =>
      this.fieldsToFilter.some(field =>
        item[field]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    this.listProvided.emit(sortedList);
  }
}