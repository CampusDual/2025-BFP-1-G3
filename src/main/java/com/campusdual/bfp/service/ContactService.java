package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IContactService;
import com.campusdual.bfp.model.Contact;
import com.campusdual.bfp.model.dto.ContactDTO;
import com.campusdual.bfp.model.dto.dtomapper.ContactMapper;
import com.campusdual.bfp.model.dao.ContactDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContactService implements IContactService {

    @Autowired
    private ContactDao contactDao;

    @Override
    public ContactDTO queryContact(ContactDTO contactDTO) {
        // ✅ Ahora usa Integer directamente
        Optional<Contact> contactOpt = contactDao.findById(contactDTO.getId());
        
        if (contactOpt.isPresent()) {
            return ContactMapper.INSTANCE.toDto(contactOpt.get());
        }
        return null;
    }

    @Override
    public List<ContactDTO> queryAllContact() {
        List<Contact> contacts = contactDao.findAll();
        return ContactMapper.INSTANCE.toDtoList(contacts);
    }

    @Override
    public int insertContact(ContactDTO contactDTO) {
        Contact contact = ContactMapper.INSTANCE.toEntity(contactDTO);
        Contact saved = contactDao.save(contact);
        return saved != null ? 1 : 0;
    }

    @Override
    public int updateContact(ContactDTO contactDTO) {
        if (contactDao.existsById(contactDTO.getId())) {
            Contact contact = ContactMapper.INSTANCE.toEntity(contactDTO);
            contactDao.save(contact);
            return 1;
        }
        return 0;
    }

    @Override
    public int deleteContact(ContactDTO contactDTO) {
        if (contactDao.existsById(contactDTO.getId())) {
            contactDao.deleteById(contactDTO.getId());
            return 1;
        }
        return 0;
    }
}