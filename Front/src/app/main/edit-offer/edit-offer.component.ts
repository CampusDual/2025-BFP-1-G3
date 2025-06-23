import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Offer } from 'src/app/model/offer';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.component.html',
  styleUrls: ['./edit-offer.component.css']
})
export class EditOfferComponent {
  offerForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditOfferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { offer: Offer },
    private fb: FormBuilder
  ) {
    this.offerForm = this.fb.group({
      titulo: [data.offer.title, Validators.required],
      descripcion: [data.offer.offerDescription, Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.offerForm.invalid) {
      return;
    }

    const updatedOffer: Offer = {
      id: this.data.offer.id,
      title: this.offerForm.value.titulo,
      offerDescription: this.offerForm.value.descripcion,
      companyId: this.data.offer.companyId,
      companyName: this.data.offer.companyName
    };

    this.dialogRef.close(updatedOffer);
  }
}