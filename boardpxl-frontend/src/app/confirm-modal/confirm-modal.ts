import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface InvoiceData {
  title: string;
  amount: number;
  items?: { label: string; value: any }[];
}

@Component({
  selector: 'app-confirm-modal',
  standalone: false,
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  @Input() isVisible: boolean = false;
  @Input() invoiceData: InvoiceData | null = null;
  @Input() titleText: string = 'Confirmer la facture';
  @Input() checkboxLabel: string = 'Je confirme la création de cette facture';
  @Input() confirmLabel: string = 'Confirmer';
  @Input() cancelLabel: string = 'Annuler';
  @Input() showAmount: boolean = true;
  @Output() confirm = new EventEmitter<void>();
  @Output() discard = new EventEmitter<void>();

  isChecked: boolean = false;

  onConfirm() {
    if (this.isChecked) {
      this.confirm.emit();
      this.reset();
    }
  }

  onDiscard() {
    this.discard.emit();
    this.reset();
  }

  private reset() {
    this.isChecked = false;
    this.isVisible = false;
  }
}
