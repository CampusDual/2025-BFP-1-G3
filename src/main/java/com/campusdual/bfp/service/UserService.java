package com.campusdual.bfp.service;

import com.campusdual.bfp.model.Role;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.UserRole;
import com.campusdual.bfp.model.dao.RoleDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dao.UserRoleDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Lazy
public class UserService implements UserDetailsService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private UserRoleDao userRoleDao;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userDao.findByLogin(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        return user;
    }

    public boolean existsByUsername(String username) {
        return userDao.findByLogin(username) != null;
    }

    public void registerNewUser(String username, String password) {
        // Crear usuario
        User user = new User();
        user.setLogin(username);
        user.setPassword(passwordEncoder.encode(password));
        user = userDao.save(user);

        // Asignar rol por defecto
        Role defaultRole = roleDao.findByRoleName("role_user");
        if (defaultRole != null) {
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(defaultRole);
            userRoleDao.save(userRole);
        }
    }
}