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
import org.springframework.security.core.authority.SimpleGrantedAuthority;

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

    /**
     * MÉTODO CRÍTICO MODIFICADO: loadUserByUsername()
     * 
     * Este método es llamado por Spring Security cuando se autentica un usuario.
     * PROBLEMA ORIGINAL: Devolvía Collections.emptyList() como autoridades
     * SOLUCIÓN: Ahora obtiene y devuelve las autoridades reales del usuario
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Buscar el usuario en la base de datos por su login/username
        User user = this.userDao.findByLogin(username);
        if (user == null) {
            // Si no existe, lanzar excepción que Spring Security maneja
            throw new UsernameNotFoundException("User not found: " + username);
        }

        // 2. CORRECCIÓN CRÍTICA: Obtener los roles del usuario desde la BD
        // user.getUserRoles() obtiene la lista de UserRole asociados al usuario
        // Cada UserRole tiene un Role que contiene el nombre del rol
        List<SimpleGrantedAuthority> authorities = user.getUserRoles().stream()
                .map(userRole -> new SimpleGrantedAuthority(userRole.getRole().getRoleName()))
                .collect(Collectors.toList());

        // 3. Crear y devolver UserDetails con las autoridades correctas
        // ANTES: Collections.emptyList() - causaba que todos los usuarios tuvieran rol vacío
        // AHORA: authorities - contiene los roles reales (role_admin, role_company, role_candidate)
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), authorities);
    }

    /**
     * MÉTODOS DE UTILIDAD AGREGADOS para obtener información segura del usuario
     * Estos métodos son usados por los controladores para obtener IDs sin depender del frontend
     */

    public boolean existsByUsername(String username) {
        User user = this.userDao.findByLogin(username);
        return user != null;
    }

    /**
     * Obtiene el nombre de la empresa asociada a un usuario
     * Usado en el login para devolver el nombre de la empresa
     */
    public String getCompanyNameByUsername(String username) {
        // 1. Buscar el usuario en la BD
        User user = userDao.findByLogin(username);
        // 2. Verificar que existe y tiene empresa asociada
        if (user != null && user.getCompany() != null) {
            // 3. Devolver el nombre de la empresa
            return user.getCompany().getName();
        } else {
            // 4. Si no tiene empresa, devolver string vacío
            return "";
        }
    }

    /**
     * MÉTODO CRÍTICO: Obtiene el ID de la empresa del usuario autenticado
     * Usado para que las empresas solo puedan gestionar SUS PROPIAS ofertas
     */
    public Integer getCompanyIdByUsername(String username) {
        // 1. Buscar el usuario en la BD por username
        User user = userDao.findByLogin(username);
        // 2. Verificar que existe y tiene empresa asociada
        if (user != null && user.getCompany() != null) {
            // 3. Devolver el ID de la empresa - ESTE ES EL ID SEGURO
            return user.getCompany().getId();
        } else {
            // 4. Si no tiene empresa asociada, devolver null
            return null;
        }
    }
    
    /**
     * MÉTODO CRÍTICO: Obtiene el ID del candidato del usuario autenticado
     * Usado para que los candidatos solo puedan gestionar SU PROPIO perfil
     */
    public Integer getCandidateIdByUsername(String username) {
        // 1. Buscar el usuario en la BD por username
        User user = userDao.findByLogin(username);
        // 2. Verificar que existe y tiene candidato asociado
        if (user != null && user.getCandidate() != null) {
            // 3. Devolver el ID del candidato - ESTE ES EL ID SEGURO
            return user.getCandidate().getId();
        } else {
            // 4. Si no tiene candidato asociado, devolver null
            return null;
        }
    }

    /**
     * Obtiene la lista de roles de un usuario
     * Usado para verificaciones de autorización
     */
    public List<String> getRolesByUsername(String username) {
        // 1. Buscar el usuario en la BD
        User user = userDao.findByLogin(username);
        if (user == null) return Collections.emptyList();
        
        // 2. Extraer los nombres de los roles del usuario
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
