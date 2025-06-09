package com.campusdual.bfp.controller;

import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.dto.SignupDTO;
import com.campusdual.bfp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    AuthenticationManager authenticationManager;
    
    @Autowired
    UserService userService;
    
    @Autowired
    PasswordEncoder encoder;
    
    @Autowired
    JWTUtil jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<String> authenticateUser(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            // Validar que el header tenga el formato correcto
            if (authHeader == null || !authHeader.startsWith("Basic ")) {
                return ResponseEntity.badRequest().body("Invalid authorization header format");
            }

            // Extraer credenciales del header Basic
            String base64Credentials = authHeader.substring("Basic ".length()).trim();
            String credentials = new String(Base64.getDecoder().decode(base64Credentials));
            String[] values = credentials.split(":", 2);
            
            if (values.length != 2) {
                return ResponseEntity.badRequest().body("Invalid credentials format");
            }

            String username = values[0];
            String password = values[1];

            // Autenticar
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            // Generar JWT
            String jwt = jwtUtils.generateJWTToken(username);
            return ResponseEntity.ok(jwt);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@RequestBody SignupDTO request) {
        try {
            // Validaciones
            if (request.getLogin() == null || request.getLogin().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");
            }

            // Verificar si el usuario ya existe
            if (userService.existsByUsername(request.getLogin())) {
                return ResponseEntity.badRequest().body("Username is already taken!");
            }

            // Registrar usuario
            userService.registerNewUser(request.getLogin(), request.getPassword());
            return ResponseEntity.ok("User registered successfully!");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
}