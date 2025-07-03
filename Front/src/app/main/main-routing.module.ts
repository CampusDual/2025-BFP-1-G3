import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { IndexComponent } from './index/index.component';
import { PublishOfferComponent } from './publish-offer/publish-offer.component';
import { DisplayOffersComponent } from './display-offers/display-offers.component';
import { CandidateSignUpComponent } from './candidate-sign-up/candidate-sign-up.component';
import { CompanyPanelComponent } from './company-panel/company-panel.component';
import { CandidatePanelComponent } from './candidate-panel/candidate-panel.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { AuthGuard } from '../guards/auth.guard';
import { noAuthGuard } from '../guards/no-auth.guard';

import { AdminTechLabelsManagerComponent } from './admin-tech-labels-manager/admin-tech-labels-manager.component';

const routes: Routes = [
  { path: '', redirectTo: 'ofertas', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  // { path: 'index', component: IndexComponent },
  { path: 'publicar', component: PublishOfferComponent, canActivate: [AuthGuard] },
  { path: 'ofertas', component: DisplayOffersComponent },
  { path: 'registrarse', component: CandidateSignUpComponent, canActivate: [noAuthGuard] },
  { path: 'empresa', component: CompanyPanelComponent, canActivate: [AuthGuard] },
  { path: 'candidato', component: CandidatePanelComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: 'admin/etiquetas', component: AdminTechLabelsManagerComponent, canActivate: [AuthGuard] },
  { path: 'offer-details/:id', component: OfferDetailsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
