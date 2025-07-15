package com.campusdual.bfp.model;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class AvailabilityConverter implements AttributeConverter<Availability, String> {
    
    @Override
    public String convertToDatabaseColumn(Availability availability) {
        return availability != null ? availability.name() : null;
    }

    @Override
    public Availability convertToEntityAttribute(String dbData) {
        return dbData != null ? Availability.valueOf(dbData) : null;
    }
}
