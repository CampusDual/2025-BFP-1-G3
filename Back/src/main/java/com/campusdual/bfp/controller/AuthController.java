package com.campusdual.bfp.controller;

import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.dto.SignupDTO;
import com.campusdual.bfp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<Map<String, String>> authenticateUser(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        Map<String, String> response = new HashMap<>();

        if (authHeader == null || !authHeader.toLowerCase().startsWith("basic ")) {
            response.put("error", "Header auth is missing.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String base64Credentials = authHeader.substring("Basic ".length());
        byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
        String credentials = new String(credDecoded, StandardCharsets.UTF_8);
        final String[] values = credentials.split(":", 2);

        if (values.length != 2) {
            response.put("error", "Malformed auth header");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(values[0], values[1])
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Obtener el rol
            String username = authentication.getName();
            String roles = userService.getRolesByUsername(username).get(0);
            
            // Generar token incluyendo el rol
            String token = jwtUtils.generateJWTToken(userDetails.getUsername(), roles);

            // Obtener el nombre de la empresa
            String nombreEmpresa = userService.getCompanyNameByUsername(userDetails.getUsername());


            response.put("token", token);
            response.put("empresa", nombreEmpresa);
            response.put("roles",roles);


            return ResponseEntity.ok(response);

        } catch (AuthenticationException ex) {
            response.put("error", "Bad credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@RequestBody SignupDTO request) {
        if (userService.existsByUsername(request.getLogin())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists.");
        }

        //Pasamos el SignupDTO completo
        userService.registerNewUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("User successfully registered.");
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        
        // Obtener el rol del usuario
        String role = authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .findFirst()
                .orElse("");

        Map<String, Object> profile = new HashMap<>();
        profile.put("username", username);
        profile.put("role", role);

        // Solo devolver información específica según el rol del usuario
        if ("role_company".equals(role)) {
            String companyName = userService.getCompanyNameByUsername(username);
            Integer companyId = userService.getCompanyIdByUsername(username);
            profile.put("companyName", companyName);
            profile.put("companyId", companyId);
        } else if ("role_candidate".equals(role)) {
            Integer candidateId = userService.getCandidateIdByUsername(username);
            profile.put("candidateId", candidateId);
        }
        // Para ROLE_ADMIN u otros roles, solo devolver username y role

        return ResponseEntity.ok(profile);
    }
}
