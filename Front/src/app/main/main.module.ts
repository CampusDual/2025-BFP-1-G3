import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MainRoutingModule } from './main-routing.module';
import { SharedModule } from '../shared/shared.module';
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
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TechLabelsManagerComponent } from './tech-labels-manager/tech-labels-manager.component';
import { AdminTechLabelsManagerComponent } from './admin-tech-labels-manager/admin-tech-labels-manager.component';
import { ApproveCandidatePanelComponent } from './approve-candidate-panel/approve-candidate-panel.component';
import { RecommendedOffersComponent } from './recommended-offers/recommended-offers.component';




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
    TechLabelsManagerComponent,
    AdminTechLabelsManagerComponent,
    ApproveCandidatePanelComponent,
    RecommendedOffersComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
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
    MatSlideToggleModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule
  ],
  providers: [
    DatePipe,
    CurrencyPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class MainModule { }
