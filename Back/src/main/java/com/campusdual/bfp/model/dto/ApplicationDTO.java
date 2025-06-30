package com.campusdual.bfp.model.dto;

public class ApplicationDTO {
    private Long id;
    private Integer id_candidate;
    private Integer id_offer;
    private CandidateDTO candidate;

    public ApplicationDTO() {
    }

    public ApplicationDTO(Long id, Integer candidate, Integer offer) {
        this.id = id;
        this.id_candidate = candidate;
        this.id_offer = offer;
    }

    public ApplicationDTO(Long id, Integer candidateId, Integer offerId, CandidateDTO candidate) {
        this.id = id;
        this.id_candidate = candidateId;
        this.id_offer = offerId;
        this.candidate = candidate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public CandidateDTO getCandidate() {
        return candidate;
    }

    public void setCandidate(CandidateDTO candidate) {
        this.candidate = candidate;
    }
}
