package com.campusdual.bfp.model;

public enum EmploymentStatus {
    EMPLEADO("Empleado"),
    DESEMPLEADO("Desempleado"),
    FREELANCE("Freelance"),
    ESTUDIANTE("Estudiante"),
    BUSCA_ACTIVAMENTE("Buscando activamente");

    private final String displayName;

    EmploymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
