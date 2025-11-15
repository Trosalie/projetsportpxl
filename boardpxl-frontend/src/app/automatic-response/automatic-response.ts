import { Component } from '@angular/core';

@Component({
  selector: 'app-automatic-response',
  standalone: false,
  templateUrl: './automatic-response.html',
  styleUrl: './automatic-response.scss',
})
export class AutomaticResponse {
  protected requestType: 'versement' | 'crédits' = 'versement';
}
