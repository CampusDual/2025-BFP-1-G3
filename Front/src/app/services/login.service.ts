import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { map, catchError, tap } from 'rxjs/operators'
import { OResponse } from "../model/response";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  login(user: string, password: string): Observable<{ token: string; empresa: string; empresaId:string }> {
  const url = "http://localhost:30030/auth/signin";
  const headers = new HttpHeaders({
    'Authorization': "Basic " + btoa(user + ":" + password)
  });

  return this.http.post<{ token: string; empresa: string; empresaId:string }>(url, {}, { headers }).pipe(
    tap(response => {
      sessionStorage.setItem('user', user);
      sessionStorage.setItem('password', password);
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('empresa', response.empresa);
      sessionStorage.setItem('empresa', response.empresa);
      sessionStorage.setItem('empresaId', response.empresaId);
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
