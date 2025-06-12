import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map, catchError, tap } from 'rxjs/operators'
import { OResponse } from "../model/response";
import { Offer } from "../model/offer";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private urlEndPoint: string = 'http://localhost:30030'
  
  constructor(private http: HttpClient) { }

  login(user: string, password: string) {
    const url = this.urlEndPoint + "/auth/signin";
    const headers = new HttpHeaders({
      'Authorization': "Basic " + btoa(user + ":" + password)
    });

    return this.http.post<any>(url, {}, { headers })
      .pipe(
        tap(response => {
          sessionStorage.setItem('user', user);
          sessionStorage.setItem('password', password);
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

  // Nuevo método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return sessionStorage.getItem('token') !== null;
  }

  // Nuevo método para cerrar sesión
  logout(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('password');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('empresa');
    
    console.log('Sesión cerrada correctamente');
  }
}