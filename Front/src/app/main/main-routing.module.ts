import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { IndexComponent } from './index/index.component';
import { PublishOfferComponent } from './publish-offer/publish-offer.component';
import { DisplayOffersComponent } from './display-offers/display-offers.component';

const routes: Routes = [
  { path: '', redirectTo: 'ofertas', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'index', component: IndexComponent },
  { path: 'publicar', component: PublishOfferComponent },
  { path: 'ofertas', component: DisplayOffersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
