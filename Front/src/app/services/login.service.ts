import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map, catchError, tap } from 'rxjs/operators'
import { OResponse } from "../model/response";
import { Offer } from "../model/offer";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  clickedApplyOffer: boolean = false;
  idOffer!: number;
  companyId!:number;
  candidateId!:number;

  private urlEndPoint: string = 'http://localhost:30030'

  constructor(private http: HttpClient, private router: Router) { }

  login(user: string, password: string) {
    const url = this.urlEndPoint + "/auth/signin";
    const headers = new HttpHeaders({
      'Authorization': "Basic " + btoa(user + ":" + password)
    });

    return this.http.post<any>(url, {}, { headers })
      .pipe(
        tap(response => {
          sessionStorage.setItem('user', user);
          // sessionStorage.setItem('password', password);
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('empresa', response.empresa);
        }),
        catchError(e => {
          if (e.status === 401) {
            console.error("Error de autenticación: " + e.message);
            return throwError(() => new Error("401 - Unauthorized"));
          } else {
            console.error(e.status + ": " + e.message);
            return throwError(() => e);
          }
        })
      );
  }

  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.urlEndPoint + "/offers/getAll").pipe(
      map(response => {
        console.log('Respuesta del servidor:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo ofertas:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para obtener ofertas por empresa
  getOffersByCompanyId(companyId: number): Observable<Offer[]> {
    const token = sessionStorage.getItem('token'); 
    console.log(token);
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get<Offer[]>(`${this.urlEndPoint}/offers/getOffersByCompany/${companyId}`, {headers}).pipe(
    map(response => {
      console.log('Respuesta del servidor:', response);
      return response;
    }),
    catchError(error => {
      console.error('Error obteniendo ofertas:', error);
      return throwError(() => error);
    })
  );
}

  isAuthenticated(): boolean {
    return sessionStorage.getItem('token') !== null;
  }

  isLoggedAsCompany(): boolean {
    if(sessionStorage.getItem('empresa') !== '' && sessionStorage.getItem('token')){
      return true
    }
    return false;
  }

  isLoggedAsCandidate(): boolean {
    if((sessionStorage.getItem('empresa') === '') && sessionStorage.getItem('token')){
      return true;
    }
    return false;
  }


  logout(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('password');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('empresa');

    console.log('Sesión cerrada correctamente');
    
    //Fuerzo que se recargue la página
    window.location.reload();
  }

  loadUserProfile(): Observable<{ companyId: number, candidateId: number }> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      // this.errorMessage = 'No está logueado.';
      return new Observable(observer => {
        observer.error('No token found');
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get<{ companyId: number, candidateId: number }>('http://localhost:30030/auth/profile', { headers }).pipe(
      tap(response => {
        this.companyId = response.companyId;
        this.candidateId = response.candidateId;
      })
    );
  }

  isLoggedAsAdmin(): boolean {
    // Esta implementación es de ejemplo, ajústala según tu lógica de autenticación
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role'); // Asegúrate de guardar el rol en el sessionStorage
    return token !== null && role === 'admin';
  }

}