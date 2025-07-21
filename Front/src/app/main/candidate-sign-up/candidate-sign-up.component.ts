import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-sign-up',
  templateUrl: './candidate-sign-up.component.html',
  styleUrls: ['./candidate-sign-up.component.css']
})
export class CandidateSignUpComponent implements OnInit, AfterViewInit {
  @ViewChild('cardContent', { static: false }) cardContent!: ElementRef;

  hide = true;
  signUpForm!: FormGroup;
  signUpError: string = '';
  submitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isGridReady: boolean = false;

  constructor(private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef) {
    this.signUpForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
      surname1: ['', Validators.required],
      surname2: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      linkedin: [null, this.linkedinValidator],
    });
  }

  linkedinValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // No es obligatorio
    }
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;
    return linkedinRegex.test(control.value) ? null : { invalidLinkedin: true };
  }



  ngOnInit(): void {
    // Inicialización del componente
    setTimeout(() => {
      this.isGridReady = true;
      this.cdr.detectChanges();
    }, 1);
  }

  ngAfterViewInit(): void {
    // Forzar detección de cambios después de que la vista se inicialice
    // Esto ayuda a resolver problemas con los estilos de Angular Material
    setTimeout(() => {
      this.isGridReady = true;
      this.cdr.detectChanges();

      // Aplicar estilos grid manualmente si es necesario
      if (this.cardContent && this.cardContent.nativeElement) {
        const element = this.cardContent.nativeElement;
        element.style.display = 'grid';
        element.style.gridTemplateColumns = 'repeat(2, 1fr)';
        element.style.gap = '8px';
      }
    }, 100);
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      if (this.signUpForm.controls['linkedin']?.errors?.['invalidLinkedin']) {
        this.signUpError = 'El enlace de LinkedIn no es válido.';
      } else {
        this.signUpError = 'Por favor, complete todos los campos requeridos correctamente.';
      }
      return;
    }
    const registerData = {
      login: String(this.signUpForm.value.login).trim(),
      password: String(this.signUpForm.value.password).trim(),
      name: String(this.signUpForm.value.name).trim(),
      surname1: String(this.signUpForm.value.surname1).trim(),
      surname2: String(this.signUpForm.value.surname2).trim(),
      phone: String(this.signUpForm.value.phone).trim(),
      email: String(this.signUpForm.value.email).trim(),
      linkedin: (String(this.signUpForm.value.linkedin).trim() !== '')
        ? String(this.signUpForm.value.linkedin).trim() : null,
      github: (String(this.signUpForm.value.github).trim() !== '')
        ? String(this.signUpForm.value.github).trim() : null
    };

    this.submitting = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    this.http.post('http://localhost:30030/auth/signup', registerData, { headers })
      .subscribe({
        next: (response) => {
          this.snackBar.open('Oferta publicada con éxito.', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          });
          console.log('Registro exitoso, navegando a login...');
          this.successMessage = 'Te has registrado con éxito.';
          this.signUpForm.reset();
          this.submitting = false;
          this.router.navigateByUrl('/main/login')

        },
        error: (error) => {
          if (error.status === 201) {
            this.signUpForm.reset();
            this.submitting = false;
            this.router.navigateByUrl('/main/login')
          } else if (error.status === 409) {
            this.signUpError = 'Error al registrarse el nombre de usuario ya existe.';
            this.submitting = false;
          } else {
            this.signUpError = 'Error de conexión con el servidor';
            this.submitting = false;
          }
        }
      });
  }
}
