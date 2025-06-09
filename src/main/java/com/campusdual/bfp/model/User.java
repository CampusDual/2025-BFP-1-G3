package com.campusdual.bfp.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "USERS")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column
    private String nif;

    @Column
    private String name;

    @Column
    private String surname1;

    @Column
    private String surname2;

    @Column
    private String login;

    @Column
    private String password;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    private Set<UserRole> userRoles = new HashSet<>();

    @OneToMany(mappedBy = "candidate", fetch = FetchType.LAZY)
    private Set<JobApplication> applications = new HashSet<>();

    public User() { }

    public User(int id, String nif, String name, String surname1, String surname2, String login, String password) {
        this.id = id;
        this.nif = nif;
        this.name = name;
        this.surname1 = surname1;
        this.surname2 = surname2;
        this.login = login;
        this.password = password;
    }

    // Getters y Setters
    public int getId() { 
        return id; 
    }
    
    public void setId(int id) { 
        this.id = id; 
    }

    public String getNif() { 
        return nif; 
    }
    
    public void setNif(String nif) { 
        this.nif = nif; 
    }

    public String getName() { 
        return name; 
    }
    
    public void setName(String name) { 
        this.name = name; 
    }

    public String getSurname1() { 
        return surname1; 
    }
    
    public void setSurname1(String surname1) { 
        this.surname1 = surname1; 
    }

    public String getSurname2() { 
        return surname2; 
    }
    
    public void setSurname2(String surname2) { 
        this.surname2 = surname2; 
    }

    public String getLogin() { 
        return login; 
    }
    
    public void setLogin(String login) { 
        this.login = login; 
    }

    public void setPassword(String password) { 
        this.password = password; 
    }

    public Company getCompany() { 
        return company; 
    }
    
    public void setCompany(Company company) { 
        this.company = company; 
    }

    public Set<UserRole> getUserRoles() { 
        return userRoles; 
    }
    
    public void setUserRoles(Set<UserRole> userRoles) { 
        this.userRoles = userRoles; 
    }

    public Set<JobApplication> getApplications() { 
        return applications; 
    }
    
    public void setApplications(Set<JobApplication> applications) { 
        this.applications = applications; 
    }

    // Implementación de UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (UserRole userRole : userRoles) {
            authorities.add(new SimpleGrantedAuthority(userRole.getRole().getRoleName()));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return login;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}