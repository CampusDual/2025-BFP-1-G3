package com.campusdual.bfp.model.dto;

public class ApplicationSummaryDTO {
    private Long id;
    private int state;
    private OfferDTO offer;

    // Constructor vacío
    public ApplicationSummaryDTO() {}

    // Getters y setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

    public OfferDTO getOffer() {
        return offer;
    }

    public void setOffer(OfferDTO offer) {
        this.offer = offer;
    }
}
