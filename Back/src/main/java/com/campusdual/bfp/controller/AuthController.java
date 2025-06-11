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

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
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
            String token = jwtUtils.generateJWTToken(userDetails.getUsername());

            // Obtener el nombre de la empresa
            String nombreEmpresa = userService.getCompanyNameByUsername(userDetails.getUsername());

            response.put("token", token);
            response.put("empresa", nombreEmpresa);

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

        userService.registerNewUser(request.getLogin(), request.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body("User successfully registered.");
    }
}
