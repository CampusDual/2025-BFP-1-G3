package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Contact;
import com.campusdual.bfp.model.dto.ContactDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface ContactMapper {
    ContactMapper INSTANCE = Mappers.getMapper(ContactMapper.class);
    
    ContactDTO toDto(Contact contact);
    Contact toEntity(ContactDTO dto);
    List<ContactDTO> toDtoList(List<Contact> contacts);
}