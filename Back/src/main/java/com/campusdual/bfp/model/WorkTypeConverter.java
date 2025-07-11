package com.campusdual.bfp.model;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class WorkTypeConverter implements AttributeConverter<WorkType, String> {

    @Override
    public String convertToDatabaseColumn(WorkType workType) {
        if (workType == null) {
            return null;
        }
        return workType.getValue();
    }

    @Override
    public WorkType convertToEntityAttribute(String value) {
        if (value == null || value.trim().isEmpty()) {
            return WorkType.ONSITE; // valor por defecto
        }
        return WorkType.fromString(value);
    }
}
