import { TechLabel } from './tech-label';

export class Offer{
    id!: number;
    title!: string;
    offerDescription!: string;
    companyId!: number;
    companyName!: string; 
    active!: boolean;
    techLabels?: TechLabel[];
}
