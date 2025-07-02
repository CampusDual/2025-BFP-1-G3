package com.campusdual.bfp.model;

import javax.persistence.*;

@Entity
@Table(name = "offers_labels")
public class OfferLabel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_offer", nullable = false, foreignKey = @ForeignKey(name = "FK_OFFER_LABEL_OFFER"))
    private Offer offer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_label", nullable = false, foreignKey = @ForeignKey(name = "FK_OFFER_LABEL_TECHLABEL"))
    private TechLabels techLabel;
    
    public OfferLabel() {
    }
    
    public OfferLabel(Offer offer, TechLabels techLabel) {
        this.offer = offer;
        this.techLabel = techLabel;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Offer getOffer() {
        return offer;
    }
    
    public void setOffer(Offer offer) {
        this.offer = offer;
    }
    
    public TechLabels getTechLabel() {
        return techLabel;
    }
    
    public void setTechLabel(TechLabels techLabel) {
        this.techLabel = techLabel;
    }
}
