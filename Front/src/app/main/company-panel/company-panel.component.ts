import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Offer } from 'src/app/model/offer';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-company-panel',
  templateUrl: './company-panel.component.html',
  styleUrls: ['./company-panel.component.css'],
})
export class CompanyPanelComponent implements OnInit {

  offers: Offer[] = [];
  submitting: boolean = false;
  companyId: number | null = null;
  companyName: string = ''; // Nuevo campo para el nombre de la empresa
  token: string = sessionStorage.getItem('token') ?? '';
  headers: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + this.token
  });

  constructor(private loginService: LoginService, private router: Router, private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadOffersByCompany();
    this.loadCompanyName();
    this.loginService.loadUserProfile();
  }

  loadCompanyName(): void {
    this.companyName = sessionStorage.getItem('empresa') || '';
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('token') !== null;
  }


  loadOffersByCompany(): void {
    this.loginService.loadUserProfile().subscribe(response => {
    const companyId = response.companyId;
    console.log('ID de la empresa:', companyId);
    this.loginService.getOffersByCompanyId(companyId).subscribe(offers => {
      this.offers = offers;
      console.log('Ofertas cargadas:', this.offers);
      console.log('Cantidad de ofertas:', this.offers.length);
      if (this.offers.length > 0) {
        console.log('Primera oferta:', this.offers[0]);
      }
    },
    error => {
      console.error('Error al cargar ofertas:', error);
    });
  });
}

  publicar(): void {
    if (this.loginService.loadUserProfile()) {
      this.router.navigate(['/main/publicar']);
    } else {
      this.router.navigate(['/main/login']);
    }
  }

 
}
