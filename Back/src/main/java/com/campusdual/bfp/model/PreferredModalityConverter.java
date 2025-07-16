package com.campusdual.bfp.model;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class PreferredModalityConverter implements AttributeConverter<PreferredModality, String> {
    
    @Override
    public String convertToDatabaseColumn(PreferredModality preferredModality) {
        return preferredModality != null ? preferredModality.name() : null;
    }

    @Override
    public PreferredModality convertToEntityAttribute(String dbData) {
        return dbData != null ? PreferredModality.valueOf(dbData) : null;
    }
}
