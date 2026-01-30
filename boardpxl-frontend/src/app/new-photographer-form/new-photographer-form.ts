import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Popup } from '../popup/popup';
import { PhotographerService } from '../services/photographer-service';

@Component({
  selector: 'app-new-photographer-form',
  standalone: false,
  templateUrl: './new-photographer-form.html',
  styleUrl: './new-photographer-form.scss',
})
export class NewPhotographerForm {
  @ViewChild('popup') popup!: Popup;

  photographerType: string = 'individual';
  isSubmitting: boolean = false;

  constructor(
    private photographerService: PhotographerService,
    private router: Router
  ) {}

  onTypeChange(type: string) {
    this.photographerType = type;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    
    if (this.isSubmitting) {
      return;
    }

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Build the payload
    const payload: any = {
      type: this.photographerType,
      aws_sub: formData.get('aws_sub'),
      customer_stripe_id: formData.get('customer_stripe_id'),
      fee_in_percent: parseFloat(formData.get('fee_in_percent') as string),
      fix_fee: parseFloat(formData.get('fix_fee') as string),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      address: formData.get('address'),
      postal_code: formData.get('postal_code'),
      city: formData.get('city'),
      country_alpha2: formData.get('country_alpha2'),
      billing_iban: formData.get('billing_iban') || null,
      password: formData.get('password'),
    };

    // Add type-specific fields
    if (this.photographerType === 'individual') {
      payload.given_name = formData.get('given_name');
      payload.family_name = formData.get('family_name');
    } else {
      payload.name = formData.get('name');
      payload.vat_number = formData.get('vat_number');
    }

    // Basic validation
    if (!this.validateForm(payload)) {
      this.popup.showNotification('Merci de remplir tous les champs obligatoires.');
      return;
    }

    this.isSubmitting = true;

    this.photographerService.createPhotographer(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.popup.showNotification('Photographe créé avec succès !');
          const photographerId = response.photographer?.id;
          const photographerName = response.photographer?.name || (response.photographer?.given_name ? `${response.photographer.given_name} ${response.photographer.family_name}` : 'Photographe');
          setTimeout(() => {
            this.router.navigate(['/photographer', photographerId], { queryParams: { name: photographerName } });
          }, 1000);
        } else {
          this.popup.showNotification(response.message || 'Erreur lors de la création du photographe.');
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error creating photographer:', error);
        let errorMessage = 'Erreur lors de la création du photographe.';
        
        if (error.error && error.error.errors) {
          // Handle validation errors - display all fields with errors
          const errors = error.error.errors;
          const errorFields = Object.keys(errors);
          errorMessage = 'Erreurs de validation :\n';
          errorFields.forEach(field => {
            const fieldErrors = errors[field];
            errorMessage += `\n- ${field}: ${fieldErrors.join(', ')}`;
          });
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 409) {
          errorMessage = 'L\'email est déjà utilisé.';
        } else if (error.status === 422) {
          errorMessage = 'Données invalides. Veuillez vérifier le formulaire.';
        }
        
        this.popup.showNotification(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  private validateForm(payload: any): boolean {
    // Check required common fields
    if (!payload.aws_sub || !payload.customer_stripe_id || 
        payload.fee_in_percent === undefined || payload.fix_fee === undefined ||
        !payload.email || !payload.address || !payload.postal_code || 
        !payload.city || !payload.country_alpha2 || !payload.password) {
      return false;
    }

    // Check type-specific required fields
    if (payload.type === 'individual') {
      if (!payload.given_name || !payload.family_name) {
        return false;
      }
    } else {
      if (!payload.name || !payload.vat_number) {
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return false;
    }

    // Validate password length
    if (payload.password.length < 8) {
      return false;
    }

    return true;
  }
}
