package com.campusdual.bfp.model;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class EmploymentStatusConverter implements AttributeConverter<EmploymentStatus, String> {
    
    @Override
    public String convertToDatabaseColumn(EmploymentStatus employmentStatus) {
        return employmentStatus != null ? employmentStatus.name() : null;
    }

    @Override
    public EmploymentStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? EmploymentStatus.valueOf(dbData) : null;
    }
}
