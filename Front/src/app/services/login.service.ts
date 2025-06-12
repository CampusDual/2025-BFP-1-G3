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

  private urlEnpoint: string = 'http://localhost:30030/offers'
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' })
  //private httpHeaders = new HttpHeaders({'Content-Type': 'application/json','Authorization':"Basic " + btoa("demo:demouser")})
  constructor(private http: HttpClient) { }

  getOffers(): Observable<Offer[]> {
    return this.http.get(this.urlEnpoint.concat("/getAll"), { headers: this.httpHeaders }).pipe(
      map(response => {
        let offers = response as Offer[];
        return offers.map(offer => {
          return offer;
        });
      })
    );
  }

  login(user: string, password: string): Observable<{ token: string; empresa: string }> {
    const url = "http://localhost:30030/auth/signin";
    const headers = new HttpHeaders({
      'Authorization': "Basic " + btoa(user + ":" + password)
    });

    return this.http.post<{ token: string; empresa: string }>(url, {}, { headers }).pipe(
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
}
