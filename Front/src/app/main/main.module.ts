import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { LoginComponent } from './login/login.component';
import { IndexComponent } from './index/index.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PublishOfferComponent } from './publish-offer/publish-offer.component';
import { DisplayOffersComponent } from './display-offers/display-offers.component';
import { MatTableModule } from '@angular/material/table';
import { CandidateSignUpComponent } from './candidate-sign-up/candidate-sign-up.component';
import { CandidatePanelComponent } from './candidate-panel/candidate-panel.component';
import { CompanyPanelComponent } from './company-panel/company-panel.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { EditOfferComponent } from './edit-offer/edit-offer.component';

@NgModule({
  declarations: [
    LoginComponent,
    IndexComponent,
    PublishOfferComponent,
    DisplayOffersComponent,
    CandidateSignUpComponent,
    CandidatePanelComponent,
    CompanyPanelComponent,
    EditOfferComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ]
})
export class MainModule { }