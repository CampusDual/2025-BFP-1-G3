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
  offersActive: Offer[] = [];
  offersInactive: Offer[] = [];
  submitting: boolean = false;
  companyId: number | null = null;
  companyName: string = '';
  token: string = sessionStorage.getItem('token') ?? '';
  headers: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + this.token
  });
  isLoading: boolean = false; // Added loading state

  constructor(private loginService: LoginService, private router: Router, private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadOffersByCompany();
    this.loadCompanyName();
    this.loginService.loadUserProfile();
  }

  loadCompanyName(): void {
    this.companyName = sessionStorage.getItem('empresa') || '';
  }

  //Comprobamos si el token es valido
  isLoggedIn(): boolean {
    if (this.loginService.isTokenValid()) {
      console.log('Token válido');
      return true;
    } else {
      console.log('Token expirado o inválido');
      return false;
    }
  }


  loadOffersByCompany(): void {
    this.isLoading = true; // Start loading
    const loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false; // Stop loading after timeout
      }
    }, 5000); // 5 seconds timeout

    this.loginService.loadUserProfile().subscribe(response => {
      const companyId = response.companyId;
      console.log('ID de la empresa:', companyId);
      this.loginService.getOffersByCompanyId(companyId).subscribe(offers => {
        clearTimeout(loadingTimeout);
        this.isLoading = false;
        this.offers = offers;
        // Filtrar ofertas activas e inactivas
        this.offersActive = offers.filter(offer => (offer.active as any) == 1);
        this.offersInactive = offers.filter(offer => (offer.active as any) == 0);
        // Guardar ofertas en sessionStorage para acceso desde offer-details
        sessionStorage.setItem('company_offers', JSON.stringify(offers));
        console.log('Ofertas cargadas:', this.offers);
        console.log('Cantidad de ofertas:', this.offers.length);
        if (this.offers.length > 0) {
          console.log('Primera oferta:', this.offers[0]);
        }
      },
        error => {
          clearTimeout(loadingTimeout);
          this.isLoading = false;
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

  viewOfferDetails(offer: Offer): void {
    // Pasar la oferta completa como estado de navegación
    this.router.navigate(['/main/detalles-de-la-oferta', offer.id], {
      state: { offer: offer }
    });
  }
}
