package com.campusdual.bfp.model;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = false)
public class WorkTypeConverter implements AttributeConverter<WorkType, String> {

    @Override
    public String convertToDatabaseColumn(WorkType workType) {
        if (workType == null) {
            return null;
        }
        // Usar el valor específico del enum (remote, hybrid, onsite)
        return workType.getValue();
    }

    @Override
    public WorkType convertToEntityAttribute(String value) {
        if (value == null) {
            return WorkType.REMOTE; // valor por defecto
        }
        
        // Intentar convertir desde string
        return WorkType.fromString(value);
    }
}
