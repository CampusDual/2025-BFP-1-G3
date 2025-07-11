package com.campusdual.bfp.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum WorkType {
    REMOTE("remote"),
    HYBRID("hybrid"), 
    ONSITE("onsite");
    
    private final String value;
    
    WorkType(String value) {
        this.value = value;
    }
    
    @JsonValue
    public String getValue() {
        return this.value;
    }
    
    // Necesario para @Enumerated(EnumType.STRING)
    @Override
    public String toString() {
        return this.value;
    }
    
    @JsonCreator
    public static WorkType fromString(String value) {
        if (value == null) {
            return REMOTE; // valor por defecto
        }
        
        // Buscar por valor específico
        for (WorkType type : WorkType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        
        // Buscar por nombre del enum (case insensitive)
        for (WorkType type : WorkType.values()) {
            if (type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        
        return REMOTE; // valor por defecto si no se encuentra
    }
}
