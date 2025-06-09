
package com.campusdual.bfp.model.dto;

import com.campusdual.bfp.model.JobApplication;
import java.time.LocalDateTime;

public class JobApplicationDTO {
    private Long id;
    private Long jobOfferId;
    private String jobOfferTitle;
    private String companyName;
    private Integer candidateId;
    private String candidateName;
    private String candidateEmail;
    private JobApplication.ApplicationStatus status;
    private String coverLetter;
    private LocalDateTime appliedAt;

    public JobApplicationDTO() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobOfferId() { return jobOfferId; }
    public void setJobOfferId(Long jobOfferId) { this.jobOfferId = jobOfferId; }

    public String getJobOfferTitle() { return jobOfferTitle; }
    public void setJobOfferTitle(String jobOfferTitle) { this.jobOfferTitle = jobOfferTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Integer getCandidateId() { return candidateId; }
    public void setCandidateId(Integer candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public JobApplication.ApplicationStatus getStatus() { return status; }
    public void setStatus(JobApplication.ApplicationStatus status) { this.status = status; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}