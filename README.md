# Bolsa de Empleo Clúster TIC - Proyecto Campus Dual

Proyecto realizado por 2025-BFP-1-G3.

---

## Descripción del Proyecto

La aplicación consta de dos partes principales:

- **Backend:** Implementado con Spring Boot, proporciona una API REST para gestionar usuarios, empresas, candidatos, ofertas de trabajo y aplicaciones a ofertas. Incluye autenticación mediante JWT y roles diferenciados para empresas y candidatos.

- **Frontend:** Aplicación web desarrollada con Angular que consume la API del backend. Permite a los usuarios registrarse, iniciar sesión, visualizar ofertas, publicar ofertas (empresas) y postularse a ellas (candidatos).

---

## Requisitos Previos

- Java 11+ y Maven para el backend.
- Node.js y npm para el frontend.
- Angular CLI 15.

---

## Instrucciones para Ejecutar el Backend

1. Navegar al directorio `Back/`.
2. Construir el proyecto con Maven:

   ```bash
   mvn clean install
   ```

3. Ejecutar la aplicación Spring Boot:

   ```bash
   mvn spring-boot:run
   ```

   La API estará disponible en `http://localhost:30030`.

---

## Instrucciones para Ejecutar el Frontend

1. Navegar al directorio `Front/`.
2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Ejecutar la aplicación Angular:

   ```bash
   npm start
   ```

   La aplicación web estará disponible en `http://localhost:4200`.

---

## Autenticación y Roles de Usuario

- La autenticación se realiza mediante un formulario que recoge el nombre de usuario con su contraseña correspondiente
- Los roles de usuario son:
  - **Empresa:** Puede publicar ofertas y gestionar sus publicaciones y a los candidatos que se incriben.
  - **Candidato:** Puede ver ofertas y postularse a ellas.
  - **Admin:** Puede gestionar etiquetas y tener una vista de las empresas que están registradas.

---

## Ejemplos de Usuarios

### Usuario de una empresa

- **Nombre de usuario:** innovatech
- **Contraseña:** 1234
- **Rol:** Empresa

### Usuario Candidato

- **Nombre de usuario:** jorge
- **Contraseña:** 1234
- **Rol:** Candidato

### Usuario Admin

- **Nombre de usuario:** admin
- **Contraseña:** demo
- **Rol:** Admin

---

## Notas

- El backend corre en el puerto `30030`.
- El frontend corre en el puerto `4200`.
- Asegúrese de que ambos servicios estén corriendo para que la aplicación funcione correctamente.
- Para cerrar sesión, utilice la opción de logout en la interfaz de usuario.

---

Este README proporciona una guía básica para comenzar a usar la aplicación Bolsa de Empleo TIC.
