package com.campusdual.bfp.model;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "OFFERS")

public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "DESCRIPTION")
    private String offerDescription;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_COMPANY", nullable = false, foreignKey = @ForeignKey(name = "FK_OFFER_COMPANY"))
    private Company company;

    public Offer() {
    }

    public Offer(Long id, String title, String offerDescription, Company company) {
        this.id = id;
        this.title = title;
        this.offerDescription = offerDescription;
        this.company = company;
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
}
