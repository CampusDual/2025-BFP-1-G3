package com.campusdual.bfp.model.dto;

import java.util.List;
import java.util.ArrayList;

public class OfferDTO {

    private Long id;
    private String title;
    private String offerDescription;
    private Integer companyId;
    private String companyName;
    private int active;
    private List<TechLabelsDTO> techLabels = new ArrayList<>();

    public OfferDTO() {
        this.techLabels = new ArrayList<>();
    }

    public OfferDTO(Long id, String title, String offerDescription, Integer companyId, String companyName) {
        this.id = id;
        this.title = title;
        this.offerDescription = offerDescription;
        this.companyId = companyId;
        this.companyName = companyName;
        //Oferta por defecto desactivada
        this.active = 0;
        this.techLabels = new ArrayList<>();
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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public int getActive() {
        return active;
    }

    public void setActive(int active) {
        this.active = active;
    }

    public List<TechLabelsDTO> getTechLabels() {
        return techLabels;
    }

    public void setTechLabels(List<TechLabelsDTO> techLabels) {
        this.techLabels = techLabels;
    }
}
