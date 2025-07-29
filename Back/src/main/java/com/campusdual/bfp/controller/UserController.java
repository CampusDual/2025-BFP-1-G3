package com.campusdual.bfp.controller;

import com.campusdual.bfp.model.User;
import com.campusdual.bfp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Endpoint para añadir solo login y password a la tabla users
    @PostMapping("/add")
    public ResponseEntity<String> addUser(@RequestBody User user) {
        if (userService.existsByUsername(user.getLogin())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists.");
        }
        userService.addUserWithLoginAndPassword(user.getLogin(), user.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body("User added successfully.");
    }
}
