import { Offer } from "./offer";

// En Front/src/app/model/application-summary.ts
export interface ApplicationSummaryDTO {
  id: number;
  state: number;
  offer: Offer;
}