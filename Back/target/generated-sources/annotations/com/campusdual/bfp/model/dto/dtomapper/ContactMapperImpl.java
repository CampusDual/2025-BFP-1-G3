package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Contact;
import com.campusdual.bfp.model.dto.ContactDTO;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-13T08:33:45+0200",
    comments = "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.42.0.v20250514-1000, environment: Java 22.0.2 (Oracle Corporation)"
)
public class ContactMapperImpl implements ContactMapper {

    @Override
    public ContactDTO toDTO(Contact contact) {
        if ( contact == null ) {
            return null;
        }

        ContactDTO contactDTO = new ContactDTO();

        contactDTO.setId( contact.getId() );
        contactDTO.setName( contact.getName() );
        contactDTO.setSurname1( contact.getSurname1() );
        contactDTO.setSurname2( contact.getSurname2() );
        contactDTO.setPhone( contact.getPhone() );
        contactDTO.setEmail( contact.getEmail() );

        return contactDTO;
    }

    @Override
    public List<ContactDTO> toDTOList(List<Contact> contacts) {
        if ( contacts == null ) {
            return null;
        }

        List<ContactDTO> list = new ArrayList<ContactDTO>( contacts.size() );
        for ( Contact contact : contacts ) {
            list.add( toDTO( contact ) );
        }

        return list;
    }

    @Override
    public Contact toEntity(ContactDTO contactdto) {
        if ( contactdto == null ) {
            return null;
        }

        Contact contact = new Contact();

        contact.setId( contactdto.getId() );
        contact.setName( contactdto.getName() );
        contact.setSurname1( contactdto.getSurname1() );
        contact.setSurname2( contactdto.getSurname2() );
        contact.setPhone( contactdto.getPhone() );
        contact.setEmail( contactdto.getEmail() );

        return contact;
    }
}
