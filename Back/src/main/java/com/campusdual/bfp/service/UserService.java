package com.campusdual.bfp.service;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.Role;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.UserRole;
import com.campusdual.bfp.model.dao.RoleDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dao.UserRoleDao;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.SignupDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Lazy
public class UserService implements UserDetailsService {

    @Autowired
    private CandidateService candidateService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private UserRoleDao userRoleDao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.userDao.findByLogin(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        return new org.springframework.security.core.userdetails.User(user.getUsername(),user.getPassword(), Collections.emptyList());
    }

    //CAMBIO: Implementar el métod. para obtener el nombre de la empresa

    public boolean existsByUsername(String username) {
        User user = this.userDao.findByLogin(username);
        return user != null;
    }

    public String getCompanyNameByUsername(String username) {
        User user = userDao.findByLogin(username);
        if (user != null && user.getCompany() != null) {
            return user.getCompany().getName();
        } else {
            return "";
        }
    }

    public Integer getCompanyIdByUsername(String username) {
        User user = userDao.findByLogin(username);
        if (user != null && user.getCompany() != null) {
            return user.getCompany().getId();
        } else {
            return null;
        }
    }
    public Integer getCandidateIdByUsername(String username) {
        User user = userDao.findByLogin(username);
        if (user != null && user.getCandidate() != null) {
            return user.getCandidate().getId();
        } else {
            return null;
        }
    }

    public List<String> getRolesByUsername(String username) {
        User user = userDao.findByLogin(username);
        if (user == null) return Collections.emptyList();
        return user.getUserRoles().stream()
                .map(userRole -> userRole.getRole().getRoleName())
                .collect(Collectors.toList());
    }


    // Para registrar un usuario necesitamos sus datos como Candidate
    // Ahora registerNewUser recibe como parámetro un objeto signupDTO
    public void registerNewUser(SignupDTO signupDTO) {
        // Creamos y guardamos el nuevo Candidate
        CandidateDTO candidateDTO = new CandidateDTO();
        candidateDTO.setName(signupDTO.getName());
        candidateDTO.setSurname1(signupDTO.getSurname1());
        candidateDTO.setSurname2(signupDTO.getSurname2());
        candidateDTO.setPhone(signupDTO.getPhone());
        candidateDTO.setEmail(signupDTO.getEmail());
        candidateDTO.setLinkedin(signupDTO.getLinkedin());

        int candidateId = candidateService.insertCandidate(candidateDTO);

        //Creamos un objeto Candidate y seteamos su id
        Candidate candidate = new Candidate();
        candidate.setId(candidateId);

        // Creamos y guardamos el nuevo User
        User user = new User();
        user.setLogin(signupDTO.getLogin());
        user.setPassword(this.passwordEncoder().encode(signupDTO.getPassword()));
        user.setCandidate(candidate); // Aquí se asigna la relación

        User savedUser = this.userDao.saveAndFlush(user);

        // Asignamos un rol ¿Necesario?
        Role role = roleDao.findByRoleName("role_candidate");

        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(role);

        userRoleDao.saveAndFlush(userRole);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
