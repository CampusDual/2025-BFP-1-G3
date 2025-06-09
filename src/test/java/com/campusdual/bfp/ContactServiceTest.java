package com.campusdual.bfp;

import com.campusdual.bfp.model.Contact;
import com.campusdual.bfp.model.dao.ContactDao;
import com.campusdual.bfp.model.dto.ContactDTO;
import com.campusdual.bfp.model.dto.dtomapper.ContactMapper;
import com.campusdual.bfp.service.ContactService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    ContactDao contactDao;

    @InjectMocks
    ContactService contactService;

    @Test
    void getAllContactsTest() {
        List<Contact> contactsList = new ArrayList<Contact>();


        Contact contactOne = new Contact("One");
        Contact contactTwo = new Contact("Two");
        Contact contactThree = new Contact("Three");

        contactsList.add(contactOne);
        contactsList.add(contactTwo);
        contactsList.add(contactThree);

        when(this.contactDao.findAll()).thenReturn(contactsList);

        List<ContactDTO> empList = this.contactService.queryAllContact();

        verify(this.contactDao, times(1)).findAll();
        assertEquals(3, empList.size());
    }

    @Test
    public void contactNotPresentInDb() {
        // Given
        when(contactDao.findById(1)).thenReturn(Optional.empty());
        
        ContactDTO inputDTO = new ContactDTO();
        inputDTO.setId(1);
        
        // When
        ContactDTO result = contactService.queryContact(inputDTO);
        
        // Then
        assertNull(result);
    }

    @Test
    public void getOneContactTest() {
        // Given
        Contact mockContact = new Contact();
        mockContact.setId(1);
        mockContact.setName("Test Name");
        mockContact.setEmail("test@email.com");
        
        ContactDTO inputDTO = new ContactDTO();
        inputDTO.setId(1);
        
        when(contactDao.findById(1)).thenReturn(Optional.of(mockContact));
        
        // When
        ContactDTO result = contactService.queryContact(inputDTO);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Test Name", result.getName());
        assertEquals("test@email.com", result.getEmail());
        
        verify(contactDao).findById(1);
    }

    @Test
    public void addContactTest() {
        // Given
        ContactDTO inputDTO = new ContactDTO();
        inputDTO.setName("Test Name");
        inputDTO.setEmail("test@email.com");
        
        Contact savedContact = new Contact();
        savedContact.setId(1);
        savedContact.setName("Test Name");
        savedContact.setEmail("test@email.com");
        
        // ✅ Cambiar: Mock save() en lugar de saveAndFlush()
        when(contactDao.save(any(Contact.class))).thenReturn(savedContact);
        
        // When
        int result = contactService.insertContact(inputDTO);
        
        // Then
        assertEquals(1, result);
        // ✅ Cambiar: Verificar save() en lugar de saveAndFlush()
        verify(contactDao).save(any(Contact.class));
    }

    @Test
    public void editContactTest() {
        // Given
        ContactDTO inputDTO = new ContactDTO();
        inputDTO.setId(1);
        inputDTO.setName("Updated Name");
        inputDTO.setEmail("updated@email.com");
        
        Contact existingContact = new Contact();
        existingContact.setId(1);
        existingContact.setName("Old Name");
        existingContact.setEmail("old@email.com");
        
        Contact updatedContact = new Contact();
        updatedContact.setId(1);
        updatedContact.setName("Updated Name");
        updatedContact.setEmail("updated@email.com");
        
        // ✅ Agregar: Mock existsById() para que retorne true
        when(contactDao.existsById(1)).thenReturn(true);
        when(contactDao.save(any(Contact.class))).thenReturn(updatedContact);
        
        // When
        int result = contactService.updateContact(inputDTO);
        
        // Then
        assertEquals(1, result);
        verify(contactDao).existsById(1);
        verify(contactDao).save(any(Contact.class));
    }

    @Test
    public void deleteContactTest() {
        // Given
        ContactDTO inputDTO = new ContactDTO();
        inputDTO.setId(1);
        
        // ✅ Agregar: Mock existsById() para que retorne true
        when(contactDao.existsById(1)).thenReturn(true);
        
        // When
        int result = contactService.deleteContact(inputDTO);
        
        // Then
        assertEquals(1, result);
        verify(contactDao).existsById(1);
        verify(contactDao).deleteById(1);
    }
}