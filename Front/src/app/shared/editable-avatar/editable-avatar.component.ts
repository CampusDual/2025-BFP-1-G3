import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileUploadService } from 'src/app/services/file-upload.service';

@Component({
  selector: 'app-editable-avatar',
  templateUrl: './editable-avatar.component.html',
  styleUrls: ['./editable-avatar.component.css']
})
export class EditableAvatarComponent implements OnInit {
  @Input() candidateId: number | null = null;
  @Input() profilePhotoUrl: string | undefined;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() editable: boolean = true;  // Nuevo input para controlar edición
  @Output() photoChanged = new EventEmitter<{photoUrl?: string, filename?: string}>();

  showModal = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadingPhoto = false;

  constructor(
    private fileUploadService: FileUploadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('EditableAvatarComponent initialized with:');
    console.log('- candidateId:', this.candidateId);
    console.log('- profilePhotoUrl:', this.profilePhotoUrl);
    console.log('- hasProfilePhoto():', this.hasProfilePhoto());
    console.log('- getProfilePhotoUrl():', this.getProfilePhotoUrl());
  }

  openModal(): void {
    if (!this.editable) return;  // Solo abrir modal si es editable
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.cancelPhotoSelection();
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Por favor seleccione un archivo de imagen válido.', 'Cerrar', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('El archivo es demasiado grande. Máximo 5MB.', 'Cerrar', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      this.selectedFile = file;

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.candidateId) {
      return;
    }

    this.uploadingPhoto = true;
    
    this.fileUploadService.uploadProfilePhoto(this.candidateId, this.selectedFile)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Foto de perfil actualizada con éxito.', 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-success']
          });
          
          // Emitir el cambio para actualizar el componente padre
          this.photoChanged.emit({
            photoUrl: response.profilePhotoUrl,
            filename: response.profilePhotoFilename
          });
          
          this.uploadingPhoto = false;
          this.closeModal();
        },
        error: (error) => {
          console.error('Error subiendo foto:', error);
          this.snackBar.open('Error al subir la foto de perfil.', 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-error']
          });
          this.uploadingPhoto = false;
        }
      });
  }

  deletePhoto(): void {
    if (!this.candidateId) {
      return;
    }

    this.fileUploadService.deleteProfilePhoto(this.candidateId)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Foto de perfil eliminada con éxito.', 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-success']
          });
          
          // Emitir el cambio para actualizar el componente padre
          this.photoChanged.emit({
            photoUrl: undefined,
            filename: undefined
          });
          
          this.closeModal();
        },
        error: (error) => {
          console.error('Error eliminando foto:', error);
          this.snackBar.open('Error al eliminar la foto de perfil.', 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
  }

  cancelPhotoSelection(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    
    // Limpiar el input de archivo
    const fileInput = document.getElementById('photo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('photo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  getProfilePhotoUrl(): string {
    if (this.profilePhotoUrl) {
      const fullUrl = this.fileUploadService.getPhotoUrl(this.profilePhotoUrl);
      console.log('Building photo URL:', this.profilePhotoUrl, '->', fullUrl);
      return fullUrl;
    }
    return '';
  }

  hasProfilePhoto(): boolean {
    return !!this.profilePhotoUrl;
  }

  getAvatarSizeClass(): string {
    return `avatar-${this.size}`;
  }
}
