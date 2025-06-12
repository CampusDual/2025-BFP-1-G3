import { Component, OnInit } from '@angular/core';
import { Offer } from 'src/app/model/offer';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-display-offers',
  templateUrl: './display-offers.component.html',
  styleUrls: ['./display-offers.component.css']
})
export class DisplayOffersComponent implements OnInit {

  offers: Offer[] = [];
  displayedColumns: string[] = ['id', 'title', 'offerDescription', 'companyId'];
  
  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.load();
  }
  
  load(): void {
  console.log('Iniciando carga de ofertas...');
  this.loginService.getOffers().subscribe(
    getOffers => {
      this.offers = getOffers;
      console.log('Ofertas cargadas:', this.offers);
      console.log('Cantidad de ofertas:', this.offers.length);
      if (this.offers.length > 0) {
        console.log('Primera oferta:', this.offers[0]);
      }
    },
    error => {
      console.error('Error al cargar ofertas:', error);
      // Mostrar un mensaje al usuario
    }
  );
}
}
