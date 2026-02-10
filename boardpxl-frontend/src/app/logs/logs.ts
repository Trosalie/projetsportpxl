import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeadersService } from '../services/http-headers.service';
import { environment } from '../../environments/environment';

interface Log {
  id: number;
  action: string;
  user_id: number;
  photographer_name?: string;
  table_name: string;
  ip_address: string;
  details: string | object;
  created_at: string;
}

@Component({
  selector: 'app-logs',
  standalone: false,
  templateUrl: './logs.html',
  styleUrl: './logs.scss',
})
export class Logs implements OnInit {
  logs: Log[] = [];
  filteredLogs: Log[] = [];
  pagedLogs: Log[] = [];
  isLoading = false;
  
  // Filters
  searchTerm = '';
  selectedAction = '';
  startDate = '';
  endDate = '';
  uniqueActions: string[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private httpHeadersService: HttpHeadersService,
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading = true;
    this.http
      .get<Log[]>(`${this.apiUrl}/logs`, this.httpHeadersService.getAuthHeaders())
      .subscribe({
        next: (logs) => {
          this.logs = logs || [];
          this.extractUniqueActions();
          this.filterLogs();
          this.isLoading = false;
        },
        error: () => {
          this.logs = [];
          this.filteredLogs = [];
          this.pagedLogs = [];
          this.totalPages = 1;
          this.isLoading = false;
        },
      });
  }

  extractUniqueActions() {
    const actions = new Set(this.logs.map(log => log.action));
    this.uniqueActions = Array.from(actions).sort();
  }

  filterLogs() {
    let filtered = [...this.logs];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(term) ||
        log.table_name?.toLowerCase().includes(term) ||
        log.ip_address?.toLowerCase().includes(term)
      );
    }

    // Filter by action
    if (this.selectedAction) {
      filtered = filtered.filter(log => log.action === this.selectedAction);
    }

    // Filter by date range
    if (this.startDate) {
      filtered = filtered.filter(log => 
        new Date(log.created_at) >= new Date(this.startDate)
      );
    }

    if (this.endDate) {
      filtered = filtered.filter(log => 
        new Date(log.created_at) <= new Date(this.endDate + 'T23:59:59')
      );
    }

    this.filteredLogs = filtered;
    this.totalPages = Math.max(1, Math.ceil(this.filteredLogs.length / this.pageSize));
    this.currentPage = 1;
    this.paginateLogs();
  }

  paginateLogs() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedLogs = this.filteredLogs.slice(start, end);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateLogs();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateLogs();
    }
  }

  formatDetails(details: string | object): string {
    if (typeof details === 'string') {
      try {
        return JSON.stringify(JSON.parse(details), null, 2);
      } catch {
        return details;
      }
    }
    return JSON.stringify(details, null, 2);
  }
}
