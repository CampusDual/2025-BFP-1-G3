package com.campusdual.bfp.model.dto;

public class OfferDTO {
    private Long id;

    private String title;

    private String offerDescription;

    private Integer companyId;

    public OfferDTO() {
    }

    public OfferDTO(Long id, String title, String offerDescription, Integer companyId) {
        this.id = id;
        this.title = title;
        this.offerDescription = offerDescription;
        this.companyId = companyId;
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

    public Integer getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Integer companyId) {
        this.companyId = companyId;
    }
}
