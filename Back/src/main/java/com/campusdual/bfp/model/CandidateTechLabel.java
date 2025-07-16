package com.campusdual.bfp.model;

import javax.persistence.*;

@Entity
@Table(name = "candidate_tech_labels")
public class CandidateTechLabel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_candidate", nullable = false, foreignKey = @ForeignKey(name = "FK_CANDIDATE_TECH_LABEL_CANDIDATE"))
    private Candidate candidate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tech_label", nullable = false, foreignKey = @ForeignKey(name = "FK_CANDIDATE_TECH_LABEL_TECHLABEL"))
    private TechLabels techLabel;
    
    public CandidateTechLabel() {
    }
    
    public CandidateTechLabel(Candidate candidate, TechLabels techLabel) {
        this.candidate = candidate;
        this.techLabel = techLabel;
    }
    
    public Long getId() {
        return id;
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
    
    public TechLabels getTechLabel() {
        return techLabel;
    }
    
    public void setTechLabel(TechLabels techLabel) {
        this.techLabel = techLabel;
    }
}
