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
        return value;
    }
    
    @JsonCreator
    public static WorkType fromString(String value) {
        if (value == null) {
            return REMOTE; // valor por defecto
        }
        for (WorkType type : WorkType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        return REMOTE; // valor por defecto si no se encuentra
    }
}
