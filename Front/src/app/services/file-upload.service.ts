import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:30030/api/files';

  constructor(private http: HttpClient) { }

  uploadProfilePhoto(candidateId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    return this.http.post(`${this.baseUrl}/upload-profile-photo/${candidateId}`, formData, { headers });
  }

  deleteProfilePhoto(candidateId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    });

    return this.http.delete(`${this.baseUrl}/delete-profile-photo/${candidateId}`, { headers });
  }

  getPhotoUrl(photoUrl: string): string {
    if (!photoUrl) return '';
    if (photoUrl.startsWith('http')) return photoUrl;
    return 'http://localhost:30030' + photoUrl;
  }
}
