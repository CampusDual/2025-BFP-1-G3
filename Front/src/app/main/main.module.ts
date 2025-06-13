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
import {MatSnackBarModule} from '@angular/material/snack-bar';




@NgModule({
  declarations: [
    LoginComponent,
    IndexComponent,
    PublishOfferComponent,
    DisplayOffersComponent
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
    MatSnackBarModule
  ]
})
export class MainModule { }
