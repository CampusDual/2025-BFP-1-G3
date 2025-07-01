package com.campusdual.bfp.model;

import javax.persistence.*;

@Entity
@Table(name = "offers")

public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String offerDescription;

    @Column(name = "active")
    private int active;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_company", nullable = false, foreignKey = @ForeignKey(name = "FK_OFFER_COMPANY"))
    private Company company;

    public Offer() {
    }

    public Offer(Long id, String title, String offerDescription, Company company, int active) {
        this.id = id;
        this.title = title;
        this.offerDescription = offerDescription;
        this.company = company;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOfferDescription() {
        return offerDescription;
    }

    public void setOfferDescription(String offerDescription) {
        this.offerDescription = offerDescription;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public int getActive() {
        return active;
    }

    public void setActive(int active) {
        this.active = active;
    }
}
