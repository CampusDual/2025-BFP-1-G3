import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-publicar-oferta',
  templateUrl: './publicar-oferta.component.html',
  styleUrls: ['./publicar-oferta.component.css']
})
export class PublicarOfertaComponent {
  ofertaForm: FormGroup;
  publicada = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.ofertaForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.ofertaForm.valid) {
      const datos = this.ofertaForm.value;
      const user = sessionStorage.getItem('user')!;
      const password = sessionStorage.getItem('password')!;
      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + btoa(`${user}:${password}`),
        'Content-Type': 'application/json'
      });

      this.http.post('http://localhost:30030/ofertas', datos, { headers }).subscribe({
        next: () => {
          this.publicada = true;
          this.ofertaForm.reset();
        },
        error: err => {
          console.error('Error al publicar oferta', err);
        }
      });
    }
  }
}
