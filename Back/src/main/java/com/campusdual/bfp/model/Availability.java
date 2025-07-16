package com.campusdual.bfp.model;

public enum Availability {
    INMEDIATA("Inmediata"),
    UNA_SEMANA("En una semana"),
    DOS_SEMANAS("En dos semanas"),
    UN_MES("En un mes"),
    MAS_DE_UN_MES("Más de un mes");

    private final String displayName;

    Availability(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
