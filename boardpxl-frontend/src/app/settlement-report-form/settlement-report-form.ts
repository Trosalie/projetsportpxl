import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settlement-report-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settlement-report-form.html',
  styleUrls: ['./settlement-report-form.scss']
})
export class SettlementReportFormComponent implements OnInit {
  settlementForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.settlementForm = this.fb.group({
      photographer: ['', Validators.required],
      totalSalesAmount: ['', [Validators.required, Validators.min(0)]],
      commission: ['', [Validators.required, Validators.min(0)]],
      advancePayments: ['', Validators.min(0)],
      periodStartDate: ['', Validators.required],
      periodEndDate: [today, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.settlementForm.valid) {
      console.log('Form data:', this.settlementForm.value);
      // TODO: Appeler le service pour créer le rapport de règlement
    } else {
      console.log('Form is invalid');
    }
  }

  resetForm(): void {
    this.settlementForm.reset();
  }
}
