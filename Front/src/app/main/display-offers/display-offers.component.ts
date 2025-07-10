// @ts-nocheck
/* eslint-disable */
import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Offer } from '../../model/offer';

@Component({
  selector: 'app-display-offers',
  templateUrl: './display-offers.component.html',
  styleUrls: ['./display-offers.component.css']
})
export class DisplayOffersComponent implements OnInit {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  loading = false;
  isLoading = false; // alias for template compatibility
  error = false;
  searchTerm = '';
  companyName = ''; // for template compatibility
  isSearchActive = false;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 20;
  totalOffers = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  constructor(private loginService: LoginService) { }

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    this.isLoading = true;
    this.error = false;
    
    this.loginService.getOffersPaginated(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.offers = response.offers || [];
        this.filteredOffers = [...this.offers];
        this.totalOffers = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.hasNextPage = this.currentPage < (this.totalPages - 1);
        this.hasPreviousPage = this.currentPage > 0;
        this.loading = false;
        this.isLoading = false;
        this.updateDisplayOffers();
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.error = true;
        this.loading = false;
        this.isLoading = false;
      }
    });
  }

  updateDisplayOffers(): void {
    if (this.searchTerm) {
      this.isSearchActive = true;
      this.filteredOffers = this.offers.filter(offer => 
        offer.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offer.offerDescription?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.isSearchActive = false;
      this.filteredOffers = [...this.offers];
    }
  }

  applyOffer(offerId: number): void {
    // Implementation for applying to offer
    console.log('Applying to offer:', offerId);
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadOffers();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.loadOffers();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOffers();
    }
  }

  get currentPageDisplay(): number {
    return this.currentPage + 1;
  }

  get startIndex(): number {
    return this.currentPage * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalOffers);
  }
}
