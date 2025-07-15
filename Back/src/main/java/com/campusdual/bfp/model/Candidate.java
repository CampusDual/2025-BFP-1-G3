package com.campusdual.bfp.model;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "candidate")
public class Candidate {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column
    private String name;
    @Column
    private String surname1;
    @Column
    private String surname2;
    @Column
    private String phone;
    @Column
    private String email;    
    @Column
    private String linkedin;

    // Nuevos campos para el perfil profesional
    @Column(name = "professional_title")
    private String professionalTitle;
    
    @Column(name = "years_experience")
    private Integer yearsExperience;
    
    @Column(name = "employment_status", length = 50)
    @Convert(converter = EmploymentStatusConverter.class)
    private EmploymentStatus employmentStatus;
    
    @Column(name = "availability", length = 50)
    @Convert(converter = AvailabilityConverter.class)
    private Availability availability;
    
    @Column(name = "preferred_modality", length = 50)
    @Convert(converter = PreferredModalityConverter.class)
    private PreferredModality preferredModality;
    
    @Column(name = "presentation", columnDefinition = "TEXT")
    private String presentation;
    
    @Column(name = "github_profile")
    private String githubProfile;

    // Campos para foto de perfil
    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;
    
    @Column(name = "profile_photo_filename")
    private String profilePhotoFilename;
    
    @Column(name = "profile_photo_content_type", length = 100)
    private String profilePhotoContentType;

    // Relación many-to-many con TechLabels para áreas de especialización
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinTable(
        name = "candidate_tech_labels",
        joinColumns = @JoinColumn(name = "id_candidate"),
        inverseJoinColumns = @JoinColumn(name = "id_tech_label")
    )
    private Set<TechLabels> techLabels = new HashSet<>();

    public Candidate() {
    }

    public Candidate(int id, String name, String surname1, String surname2, String phone, String email, String linkedin) {
        this.id = id;
        this.name = name;
        this.surname1 = surname1;
        this.surname2 = surname2;
        this.phone = phone;
        this.email = email;
        this.linkedin = linkedin;
        this.techLabels = new HashSet<>();
    }

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

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getProfilePhotoFilename() {
        return profilePhotoFilename;
    }

    public void setProfilePhotoFilename(String profilePhotoFilename) {
        this.profilePhotoFilename = profilePhotoFilename;
    }

    public String getProfilePhotoContentType() {
        return profilePhotoContentType;
    }

    public void setProfilePhotoContentType(String profilePhotoContentType) {
        this.profilePhotoContentType = profilePhotoContentType;
    }

    public Set<TechLabels> getTechLabels() {
        return techLabels;
    }

    public void setTechLabels(Set<TechLabels> techLabels) {
        this.techLabels = techLabels;
    }

    // Métodos auxiliares para manejar la relación many-to-many con TechLabels
    public void addTechLabel(TechLabels techLabel) {
        this.techLabels.add(techLabel);
    }

    public void removeTechLabel(TechLabels techLabel) {
        this.techLabels.remove(techLabel);
    }
}
