package com.campusdual.bfp.model.dto;

import java.time.LocalDateTime;

public class CompanyDTO {
    private Long id;
    private String name;
    private String email;
    private String cif;
    private String description;
    private String website;
    private String location;
    
    // CAMPOS AGREGADOS para arreglar errores
    private String sector;
    private String phone;
    private String address;
    private LocalDateTime createdAt;

    public CompanyDTO() {}

    // Getters y Setters originales
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getName() { 
        return name; 
    }
    
    public void setName(String name) { 
        this.name = name; 
    }

    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getCif() { 
        return cif; 
    }
    
    public void setCif(String cif) { 
        this.cif = cif; 
    }

    public String getDescription() { 
        return description; 
    }
    
    public void setDescription(String description) { 
        this.description = description; 
    }

    public String getWebsite() { 
        return website; 
    }
    
    public void setWebsite(String website) { 
        this.website = website; 
    }

    public String getLocation() { 
        return location; 
    }
    
    public void setLocation(String location) { 
        this.location = location; 
    }
    
    // GETTERS Y SETTERS AGREGADOS
    public String getSector() {
        return sector;
    }
    
    public void setSector(String sector) {
        this.sector = sector;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}