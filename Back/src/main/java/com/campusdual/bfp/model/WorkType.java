package com.campusdual.bfp.model;

public enum WorkType {
    REMOTE("remote"),
    HYBRID("hybrid"), 
    ONSITE("onsite");
    
    private final String value;
    
    WorkType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static WorkType fromString(String value) {
        if (value == null) {
            return ONSITE; // valor por defecto
        }
        for (WorkType type : WorkType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        return ONSITE; // valor por defecto si no se encuentra
    }
}
