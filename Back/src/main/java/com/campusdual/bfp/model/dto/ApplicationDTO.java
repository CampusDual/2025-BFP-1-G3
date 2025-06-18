package com.campusdual.bfp.model.dto;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.Offer;

public class ApplicationDTO {
    private long id;
    private Integer id_candidate;
    private Integer id_offer;

    public ApplicationDTO() {
    }

    public ApplicationDTO(Long id, Integer candidate, Integer offer) {
        this.id = id;
        this.id_candidate = candidate;
        this.id_offer = offer;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Integer getId_candidate() {
        return id_candidate;
    }

    public void setId_candidate(Integer id_candidate) {
        this.id_candidate = id_candidate;
    }

    public Integer getId_offer() {
        return id_offer;
    }

    public void setId_offer(Integer id_offer) {
        this.id_offer = id_offer;
    }
}
