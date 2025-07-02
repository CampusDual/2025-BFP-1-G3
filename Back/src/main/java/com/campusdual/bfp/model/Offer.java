package com.campusdual.bfp.model;

import javax.persistence.*;
import java.util.Set;
import java.util.HashSet;

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

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinTable(
        name = "offers_labels",
        joinColumns = @JoinColumn(name = "id_offer"),
        inverseJoinColumns = @JoinColumn(name = "id_label")
    )
    private Set<TechLabels> techLabels = new HashSet<>();

    public Offer() {
        this.techLabels = new HashSet<>();
    }

    public Offer(Long id, String title, String offerDescription, Company company, int active) {
        this.id = id;
        this.title = title;
        this.offerDescription = offerDescription;
        this.company = company;
        this.active = active;
        this.techLabels = new HashSet<>();
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

    public Set<TechLabels> getTechLabels() {
        return techLabels;
    }

    public void setTechLabels(Set<TechLabels> techLabels) {
        this.techLabels = techLabels;
    }

    // Métodos auxiliares para manejar la relación many-to-many
    public void addTechLabel(TechLabels techLabel) {
        this.techLabels.add(techLabel);
    }

    public void removeTechLabel(TechLabels techLabel) {
        this.techLabels.remove(techLabel);
    }
}
