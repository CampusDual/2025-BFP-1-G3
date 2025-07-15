package com.campusdual.bfp.model.dto;

import com.campusdual.bfp.model.Availability;
import com.campusdual.bfp.model.EmploymentStatus;
import com.campusdual.bfp.model.PreferredModality;

import java.util.List;

public class CandidateDTO {
    private int id;
    private String name;
    private String surname1;
    private String surname2;
    private String phone;
    private String email;
    private String linkedin;

    // Nuevos campos para el perfil profesional
    private String professionalTitle;
    private Integer yearsExperience;
    private EmploymentStatus employmentStatus;
    private Availability availability;
    private PreferredModality preferredModality;
    private String presentation;
    private String githubProfile;
    private List<Long> techLabelIds; // IDs de las etiquetas técnicas seleccionadas


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname1() {
        return surname1;
    }

    public void setSurname1(String surname1) {
        this.surname1 = surname1;
    }

    public String getSurname2() {
        return surname2;
    }

    public void setSurname2(String surname2) {
        this.surname2 = surname2;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    // Getters y setters para los nuevos campos

    public String getProfessionalTitle() {
        return professionalTitle;
    }

    public void setProfessionalTitle(String professionalTitle) {
        this.professionalTitle = professionalTitle;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }

    public EmploymentStatus getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(EmploymentStatus employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public Availability getAvailability() {
        return availability;
    }

    public void setAvailability(Availability availability) {
        this.availability = availability;
    }

    public PreferredModality getPreferredModality() {
        return preferredModality;
    }

    public void setPreferredModality(PreferredModality preferredModality) {
        this.preferredModality = preferredModality;
    }

    public String getPresentation() {
        return presentation;
    }

    public void setPresentation(String presentation) {
        this.presentation = presentation;
    }

    public String getGithubProfile() {
        return githubProfile;
    }

    public void setGithubProfile(String githubProfile) {
        this.githubProfile = githubProfile;
    }

    public List<Long> getTechLabelIds() {
        return techLabelIds;
    }

    public void setTechLabelIds(List<Long> techLabelIds) {
        this.techLabelIds = techLabelIds;
    }
}

