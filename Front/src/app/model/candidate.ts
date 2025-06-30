export interface Candidate {
  id: number;
  name: string;
  surname1: string;
  surname2?: string;
  phone?: string;
  email: string;
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
