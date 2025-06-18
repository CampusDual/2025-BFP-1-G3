package com.campusdual.bfp.model;

import javax.persistence.*;

@Entity
@Table(name = "applications")

public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_candidate", nullable = false, foreignKey = @ForeignKey(name = "applications_id_candidate_fkey"))
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_offer", nullable = false, foreignKey = @ForeignKey(name = "applications_id_offer_fkey"))
    private Offer offer;

    public Application() {
    }

    public Application(Long id, Candidate candidate, Offer offer) {
        this.id = id;
        this.candidate = candidate;
        this.offer = offer;
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public Offer getOffer() {
        return offer;
    }

    public void setOffer(Offer offer) {
        this.offer = offer;
    }
}
