# Endpoint de Ofertas Recomendadas

## Descripción
El nuevo endpoint `/offers/recommended` permite obtener ofertas filtradas y ordenadas por afinidad basándose en las tech labels (áreas de especialización) del candidato autenticado.

## Endpoint
```
GET /offers/recommended?page=0&size=20
```

## Autenticación
- **Requerida**: Sí
- **Tipo**: Bearer Token (JWT)
- **Rol**: Candidato (`role_candidate`)

## Parámetros
- `page` (opcional): Número de página (por defecto: 0)
- `size` (opcional): Tamaño de página (por defecto: 20)

## Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Funcionamiento

### 1. Filtrado por Tech Labels
- El sistema obtiene las tech labels del candidato autenticado
- Solo devuelve ofertas que contengan al menos una tech label en común con el candidato
- Excluye automáticamente las ofertas a las que el candidato ya se ha aplicado

### 2. Ordenamiento por Afinidad
Las ofertas se ordenan por el número de tech labels que coinciden:
- **Mayor afinidad**: Ofertas con 5 tech labels coincidentes aparecen primero
- **Menor afinidad**: Ofertas con 1 tech label coincidente aparecen al final

### 3. Casos Especiales
- **Sin tech labels**: Si el candidato no tiene tech labels configuradas, se devuelven todas las ofertas activas
- **Sin ofertas coincidentes**: Si no hay ofertas que coincidan con las tech labels del candidato, se devuelve una lista vacía

## Respuesta Exitosa

```json
{
  "offers": [
    {
      "id": 1,
      "title": "Desarrollador Full Stack",
      "offerDescription": "Desarrollo de aplicaciones web",
      "companyId": 1,
      "companyName": "TechCorp",
      "techLabels": [
        {"id": 1, "name": "Angular"},
        {"id": 2, "name": "Spring Boot"},
        {"id": 3, "name": "PostgreSQL"}
      ],
      "active": 1,
      "workType": "HIBRIDO",
      "salaryMin": 30000,
      "salaryMax": 45000
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "currentPage": 0,
  "size": 20,
  "message": "Ofertas recomendadas basadas en tus áreas de especialización"
}
```

## Respuestas de Error

### Usuario no autenticado (401)
```json
{
  "error": "Token inválido o expirado"
}
```

### Permisos insuficientes (403)
```json
"Solo los candidatos pueden acceder a ofertas recomendadas. Rol actual: role_company"
```

### Usuario no encontrado (200 con error)
```json
{
  "error": "Usuario no encontrado"
}
```

### Usuario no es candidato (200 con error)
```json
{
  "error": "El usuario no es un candidato"
}
```

## Ejemplo de Uso con Postman

### 1. Obtener Token de Autenticación
```
POST /auth/login
{
  "login": "candidato@email.com",
  "password": "password123"
}
```

### 2. Usar el Endpoint de Recomendaciones
```
GET /offers/recommended?page=0&size=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Ventajas del Sistema

1. **Personalización**: Cada candidato ve ofertas relevantes a sus habilidades
2. **Ordenamiento inteligente**: Las ofertas más afines aparecen primero
3. **Filtrado automático**: No muestra ofertas a las que ya se aplicó
4. **Paginación**: Manejo eficiente de grandes volúmenes de datos
5. **Escalabilidad**: La consulta SQL está optimizada para rendimiento

## Casos de Prueba Recomendados

1. **Candidato con tech labels**: Verificar que se devuelven ofertas ordenadas por afinidad
2. **Candidato sin tech labels**: Verificar que se devuelven todas las ofertas activas
3. **Candidato con aplicaciones**: Verificar que no aparecen ofertas ya aplicadas
4. **Paginación**: Probar diferentes valores de page y size
5. **Permisos**: Intentar acceder con token de empresa
6. **Token inválido**: Probar sin autenticación o con token expirado
