import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Popup } from '../popup/popup';
import { PhotographerService } from '../services/photographer-service';

@Component({
  selector: 'app-edit-photographer-form',
  standalone: false,
  templateUrl: './edit-photographer-form.html',
  styleUrl: './edit-photographer-form.scss',
})
export class EditPhotographerForm implements OnInit {
  @ViewChild('popup') popup!: Popup;

  photographerType: 'individual' | 'company' = 'individual';
  typeLocked = false;
  isSubmitting = false;
  photographerIdInput: number | null = null;
  givenName = '';
  familyName = '';
  companyName = '';
  email = '';
  address = '';
  postalCode = '';
  city = '';
  countryAlpha2 = '';
  billingIban = '';
  feeInPercent: number | null = null;
  fixFee: number | null = null;

  isLoading = false;

  constructor(
    private photographerService: PhotographerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      const numericId = Number(routeId);
      if (!Number.isNaN(numericId)) {
        this.photographerIdInput = numericId;
        this.loadPhotographer(numericId);
      }
    }
  }

  onTypeChange(type: string) {
    if (this.typeLocked) return;
    this.photographerType = type as 'individual' | 'company';
  }

  loadPhotographer(id: number | null) {
    if (!id || Number.isNaN(id)) {
      this.popup.showNotification('Veuillez renseigner un identifiant valide.');
      return;
    }

    this.isLoading = true;
    this.photographerService.getPhotographer(id).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.prefillForm(data);
        this.popup.showNotification('Photographe chargé.');
      },
      error: (error) => {
        this.isLoading = false;
        let msg = 'Impossible de charger le photographe.';
        if (error.status === 404) {
          msg = 'Photographe introuvable.';
        } else if (error.error && error.error.message) {
          msg = error.error.message;
        }
        this.popup.showNotification(msg);
      }
    });
  }

  private prefillForm(data: any) {
    this.givenName = data.given_name || '';
    this.familyName = data.family_name || '';
    this.companyName = data.name || '';
    this.email = data.email || '';
    this.address = data.street_address || data.address || '';
    this.postalCode = data.postal_code || '';
    this.city = data.locality || data.city || '';
    this.countryAlpha2 = data.country || data.country_alpha2 || '';
    this.billingIban = data.iban || data.billing_iban || '';
    this.feeInPercent = data.fee_in_percent ?? null;
    this.fixFee = data.fix_fee ?? null;

    this.setTypeFromNames();
  }

  private setTypeFromNames() {
    const hasNames = (this.givenName?.trim() || '') !== '' && (this.familyName?.trim() || '') !== '';
    this.photographerType = hasNames ? 'individual' : 'company';
    this.typeLocked = true;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.isSubmitting) {
      return;
    }

    const id = this.photographerIdInput;
    if (!id || Number.isNaN(id)) {
      this.popup.showNotification('Veuillez renseigner un identifiant de photographe valide.');
      return;
    }

    const payload: any = { type: this.photographerType };

    this.addIfDefined(payload, 'email', this.email);
    this.addIfDefined(payload, 'address', this.address);
    this.addIfDefined(payload, 'postal_code', this.postalCode);
    this.addIfDefined(payload, 'city', this.city);
    this.addIfDefined(payload, 'country_alpha2', this.countryAlpha2);
    this.addIfDefined(payload, 'billing_iban', this.billingIban);

    this.addIfNumber(payload, 'fee_in_percent', this.feeInPercent);
    this.addIfNumber(payload, 'fix_fee', this.fixFee);

    if (this.photographerType === 'individual') {
      this.addIfDefined(payload, 'given_name', this.givenName);
      this.addIfDefined(payload, 'family_name', this.familyName);
    } else {
      this.addIfDefined(payload, 'name', this.companyName);
    }

    if (!this.validatePayload(payload)) {
      this.popup.showNotification('Aucun champ à mettre à jour. Ajoutez au moins une information.');
      return;
    }

    this.isSubmitting = true;

    this.photographerService.updatePhotographer(id, payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.popup.showNotification('Photographe mis à jour avec succès !');
        } else {
          this.popup.showNotification(response.message || 'Erreur lors de la mise à jour du photographe.');
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating photographer:', error);
        let errorMessage = 'Erreur lors de la mise à jour du photographe.';

        if (error.error && error.error.errors) {
          const errors = error.error.errors;
          const fields = Object.keys(errors);
          errorMessage = 'Erreurs de validation :\n';
          fields.forEach(field => {
            errorMessage += `\n• ${field}: ${errors[field].join(', ')}`;
          });
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = 'Photographe introuvable.';
        } else if (error.status === 409) {
          errorMessage = 'Email déjà utilisé.';
        } else if (error.status === 422) {
          errorMessage = 'Données invalides. Merci de vérifier le formulaire.';
        }

        this.popup.showNotification(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  private addIfDefined(target: any, key: string, value: string | null | undefined) {
    if (value !== null && value !== undefined && value !== '') {
      target[key] = value;
    }
  }

  private addIfNumber(target: any, key: string, value: number | string | null) {
    if (value === null || value === undefined || value === '') return;
    const num = Number(value);
    if (!Number.isNaN(num)) {
      target[key] = num;
    }
  }

  private validatePayload(payload: any): boolean {
    if (!payload.type) return false;
    const keys = Object.keys(payload).filter(k => k !== 'type');
    return keys.length > 0;
  }

}
