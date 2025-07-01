import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map, catchError, tap } from 'rxjs/operators'
import { OResponse } from "../model/response";
import { Offer } from "../model/offer";
import { Candidate } from "../model/candidate";
import { Application } from "../model/application";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  // Nuevo método para alternar estado activo de oferta
  toggleOfferActive(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.urlEndPoint}/offers/toggleActive/${id}`, null, { headers, responseType: 'text' }).pipe(
      map(response => {
        console.log('Estado activo de oferta alternado:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error alternando estado activo de oferta:', error);
        return throwError(() => error);
      })
    );
  }

  clickedApplyOffer: boolean = false;
  idOffer!: number;
  companyId!: number;
  candidateId!: number;
  role!: string;

  private urlEndPoint: string = 'http://localhost:30030'

  constructor(private http: HttpClient, private router: Router) { 
    // Inicializar el rol desde el token si existe
    this.role = this.getRoleFromToken();
  }

  // Método para extraer el rol del token JWT
  private getRoleFromToken(): string {
    const token = sessionStorage.getItem('token');
    if (!token) return '';

    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Extraer el rol del campo 'role' del payload
      return payload.role || '';
    } catch (error) {
      console.error('Error decodificando token para obtener rol:', error);
      return '';
    }
  }

  // Método para obtener el rol (ahora solo del token)
  private getRole(): string {
    return this.getRoleFromToken();
  }

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
          // Ya no guardamos el rol en sessionStorage, se obtiene del token
          
          this.role = response.roles;
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
    return this.http.get<Offer[]>(`${this.urlEndPoint}/offers/getOffersByCompany/${companyId}`, { headers }).pipe(
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

  // Método para actualizar una oferta
  updateOffer(offer: Offer): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.put<any>(`${this.urlEndPoint}/offers/update`, offer, { headers }).pipe(
      map(response => {
        console.log('Oferta actualizada:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error actualizando oferta:', error);
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem('token') !== null;
  }

  isLoggedAsCompany(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;
    
    const role = this.getRole();
    return role === 'role_company';
  }

  isLoggedAsCandidate(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;
    
    const role = this.getRole();
    return role === 'role_candidate';
  }

  isLoggedAsAdmin(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;
    
    const role = this.getRole();
    return role === 'role_admin';
  }

  logout(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('password');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('empresa');
    // No necesitamos limpiar 'role' de sessionStorage porque ya no lo usamos
    this.role = '';

    console.log('Sesión cerrada correctamente');

    //Fuerzo que se recargue la página
    if (window.location.pathname === '/main/ofertas') {
      window.location.reload();
    }
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

  //Función que valida el token
  isTokenValid(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      // Decodificar el token JWT para obtener el payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      
      // Verificar expiración con un margen de 10 segundos
      return exp > (now + 10);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return false;
    }
  }

  // Método para obtener candidatos inscritos en una oferta específica
  getCandidatesByOfferId(offerId: number): Observable<Application[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<Application[]>(`${this.urlEndPoint}/offers/${offerId}/candidates`, { headers }).pipe(
      map(response => {
        console.log('Candidatos obtenidos para la oferta:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error obteniendo candidatos:', error);
        return throwError(() => error);
      })
    );
  }
}