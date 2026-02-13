import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-title',
  standalone: false,
  templateUrl: './title.html',
  styleUrls: ['./title.scss'],
})
export class Title {
  @Input() title?: string = this.translate.instant('TITLE.TITLE');
  @Input() icon?: string = 'assets/logo-tableau-de-bord.png';
}
