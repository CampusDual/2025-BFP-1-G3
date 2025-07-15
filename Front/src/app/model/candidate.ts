export interface Candidate {
  id: number;
  name: string;
  surname1: string;
  surname2?: string;
  phone?: string;
  email: string;
  linkedin?: string;
  
  // Nuevos campos para el perfil profesional
  professionalTitle?: string;
  yearsExperience?: number;
  employmentStatus?: 'EMPLEADO' | 'DESEMPLEADO' | 'FREELANCE' | 'ESTUDIANTE' | 'BUSCA_ACTIVAMENTE';
  availability?: 'INMEDIATA' | 'UNA_SEMANA' | 'DOS_SEMANAS' | 'UN_MES' | 'MAS_DE_UN_MES';
  preferredModality?: 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO';
  presentation?: string;
  githubProfile?: string;
  techLabelIds?: number[]; // IDs de las etiquetas tecnológicas seleccionadas
  
  // Campos adicionales que podrían ser útiles
  cvUrl?: string;
  applicationDate?: Date;
  status?: string;
}

export interface CandidateApplication {
  candidate: Candidate;
  applicationDate: Date;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  id: number;
  offerId: number;
}
