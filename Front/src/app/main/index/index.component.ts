import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  nombreEmpresa: string = '';

  constructor(private router: Router) {  }

  ngOnInit(): void {
    this.nombreEmpresa = sessionStorage.getItem('empresa') ?? '';
  }

  //Metodo que al pulsar te lleva a publicar oferta
  publicarOferta() {
    this.router.navigate(['/main/publicar']);
  }
}
