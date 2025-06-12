import { Component, OnInit } from '@angular/core';
import { Offer } from 'src/app/model/offer';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-display-offers',
  templateUrl: './display-offers.component.html',
  styleUrls: ['./display-offers.component.css']
})
export class DisplayOffersComponent implements OnInit {

  offers!: Offer[];
  displayedColumns: string[] = ['id', 'title', 'description', 'compant_id'];

  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.load();
  }
  
  load(): void {
    this.loginService.getOffers().subscribe(
      getOffers => this.offers = getOffers
    );
  }

}
