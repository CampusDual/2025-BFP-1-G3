import { Candidate } from './candidate';

export interface Application {
  id: number;
  id_candidate: number;
  id_offer: number;
  candidate?: Candidate;
}
