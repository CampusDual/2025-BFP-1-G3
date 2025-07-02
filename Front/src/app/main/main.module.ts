import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { LoginComponent } from './login/login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'
import { IndexComponent } from './index/index.component';
import { PublishOfferComponent } from './publish-offer/publish-offer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DisplayOffersComponent } from './display-offers/display-offers.component';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CandidateSignUpComponent } from './candidate-sign-up/candidate-sign-up.component';
import { CandidatePanelComponent } from './candidate-panel/candidate-panel.component';
import { CompanyPanelComponent } from './company-panel/company-panel.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TechLabelsManagerComponent } from './tech-labels-manager/tech-labels-manager.component';


@NgModule({
  declarations: [
    LoginComponent,
    IndexComponent,
    PublishOfferComponent,
    DisplayOffersComponent,
    CandidateSignUpComponent,
    CandidatePanelComponent,
    CompanyPanelComponent,
    AdminPanelComponent,
    OfferDetailsComponent,
    TechLabelsManagerComponent
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
    MatPaginatorModule,
    MatSortModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSlideToggleModule
  ]
})
export class MainModule { }