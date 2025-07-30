ript de inicialización para base de datos PostgreSQL
-- Crea tablas y datos iniciales para la aplicación

-- CREACION DE TABLAS 

-- Crear tabla ROLES
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    role_description VARCHAR(100) NOT NULL
);

-- Crear tabla COMPANY
CREATE TABLE compnay (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- Crear tabla CANDIDATE
CREATE TABLE candidate (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname1 VARCHAR(100) NOT NULL,
    surname2 VARCHAR(100),
    phone VARCHAR(9) NOT NULL,
    email VARCHAR(100) NOT NULL,
    linkedin VARCHAR(200),
    professional_title VARCHAR(100),
    years_experience VARCHAR(100),
    employment_status VARCHAR(100),
    availability VARCHAR(100),
    preferred_modality VARCHAR(100),
    presentation TEXT,
    github_profile VARCHAR(200),
    profile_photo_url VARCHAR(500),
    profile_photo_filename VARCHAR(200),
    profile_photo_content_type VARCHAR(100)
);

-- Crear tabla USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    id_company INTEGER NULL,
    id_candidate INTEGER NULL,
    CONSTRAINT fk_company FOREIGN KEY(id_company) REFERENCES company(id),
    CONSTRAINT fk_candidate FOREIGN KEY(id_candidate) REFERENCES candidate(id)
);

-- Crear tabla USER_ROLES (MAESTRO)
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES roles(id)
);

-- Crear tabla OFFERS
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    id_company INTEGER NOT NULL,
    active INTEGER NOT NULL,
    location VARCHAR(100) NOT NULL,
    publishing_date TIMESTAMP NOT NULL,
    requirements TEXT NOT NULL,
    desirable TEXT,
    benefits TEXT,
    type VARCHAR(10) NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Crear tabla APPLICATIONS
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    id_candidate INTEGER NOT NULL,
    id_offer INTEGER NOT NULL,
    state INTEGER NOT NULL,
    CONSTRAINT fk_candidate FOREIGN KEY(id_candidate) REFERENCES candidate(id),
    CONSTRAINT fk_offer FOREIGN KEY(id_offer) REFERENCES offers(id)
);

-- Crear tabla TECH_LABELS
CREATE TABLE tech_labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
);

-- Crear tabla OFFERS_LABELS 
CREATE TABLE offers_labels (
    id SERIAL PRIMARY KEY,
    id_offer INTEGER NOT NULL,
    id_label INTEGER NOT NULL,
    CONSTRAINT fk_offer FOREIGN KEY(id_offer) REFERENCES offers(id),
    CONSTRAINT fk_label FOREIGN KEY(id_label) REFERENCES tech_labels(id)
);


-- INSECCIÓN DE DATOS

-- Insertar datos en la tabla roles 
INSERT INTO roles (id, role_name, role_description) VALUES (1, 'role_admin', 'Admin role, manage areas such as company or labels');
INSERT INTO roles (role_name, role_description) VALUES ('role_user', 'User role, allows access as company or applicant');
INSERT INTO roles (role_name, role_description) VALUES ('role_company', 'Company role, allows access to the companys dashboard and all management within it');
INSERT INTO roles (role_name, role_description) VALUES ('role_candidate', 'Candidate role, allows you to log in to the user panel and register for company offers');

-- Insertar datos en la tabla company
INSERT INTO company (id, name, email) VALUES (1, 'InnovaTech', 'innovatech@info.com');
INSERT INTO company (name, email) VALUES ('Cinfo, S.L.', 'contact@cinfo.es');
INSERT INTO company (name, email) VALUES ('Luckia Tech, S.L.', 'info.proveedores@luckia.com');
INSERT INTO company (name, email) VALUES ('Aldaba Servicios Profesionales, S.L.U.', 'info@aldaba.es');
INSERT INTO company (name, email) VALUES ('Texas Controls, S.L.', 'texas@texascontrols.com');
INSERT INTO company (name, email) VALUES ('Tecnologías Plexus, S.L.', 'info@plexus.es');

-- Insertar datos en la tabla candidate
INSERT INTO candidate (id, name, surname1, surname2, phone, email) 
VALUES (1, 'Leo', 'Ces', 'Fragoso', '685098765', 'leo@gmail.com');

INSERT INTO candidate (name, surname1, surname2, phone, email) 
VALUES ('Ana', 'Belén García', 'Añon', '684478871', 'anabar@gmail.com');

INSERT INTO candidate (name, surname1, surname2, phone, email) 
VALUES ('Martín', 'Sánchez', 'Novo', '688837320', 'martin@gmail.com');

INSERT INTO candidate (name, surname1, phone, email) 
VALUES ('Filippo', 'GiusFerrantellieppe', '665327155', 'filipp@gmail.com');

-- Insertar datos en la tabla users
INSERT INTO users (id, login, password, id_company, id_candidate) VALUES (1, 'demo', 'demo', NULL, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('cinfo', 'cinfo', 2, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('luckia', 'luckia', 3, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('aldaba', 'aldaba', 4, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('texas', 'texas', 5, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('plexus', 'plexus', 6, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('innovatech', '1234', 1, NULL);

-- Insertar datos en la tabla user_roles
INSERT INTO user_roles (id, id_user, id_role) VALUES (1, 1, 1);
INSERT INTO user_roles (id_user, id_role) VALUES (3, 2);
INSERT INTO user_roles (id_user, id_role) VALUES (3, 3);
INSERT INTO user_roles (id_user, id_role) VALUES (3, 4);
INSERT INTO user_roles (id_user, id_role) VALUES (3, 5);
INSERT INTO user_roles (id_user, id_role) VALUES (3, 6);
INSERT INTO user_roles (id_user, id_role) VALUES (3, 7);

-- Insertar datos en la tabla offers
INSERT INTO offers (id, title, description, id_company, active, location, requirements, desirable, benefits) VALUES (1, 'Responsable de Operaciones', 
'En Innovatech, estamos a la vanguardia de la ciberseguridad, protegiendo a empresas y organizaciones de las amenazas digitales en constante evolución. Nuestro compromiso es ofrecer soluciones innovadoras y robustas que garanticen la tranquilidad de nuestros clientes. Buscamos un Responsable de Operaciones con una sólida visión estratégica y experiencia en el sector tecnológico para unirse a nuestro equipo en España y liderar la eficiencia operativa de nuestra empresa.
Como Responsable de Operaciones en Innovatech, serás el pilar fundamental para asegurar la fluidez y optimización de todos los procesos operativos de la empresa. Tu rol será crucial para garantizar que nuestros servicios y soluciones de ciberseguridad se entreguen con la máxima eficiencia y calidad. Reportarás directamente a la dirección y trabajarás en estrecha colaboración con los equipos de desarrollo, ventas y atención al cliente.',
1,
0,
'A Coruña',
'Licenciatura o Grado en Ingeniería Informática, Telecomunicaciones, Empresariales, o campo relacionado.

Al menos 5 años de experiencia demostrable en roles de gestión de operaciones, proyectos o servicios, preferiblemente en el sector de la tecnología o ciberseguridad.

Experiencia sólida en la implementación y mejora de procesos operativos complejos.

Dominio del español e inglés (hablado y escrito).

Habilidades de liderazgo excepcionales, con capacidad para gestionar equipos multidisciplinares y resolver problemas de forma proactiva.

Mentalidad analítica, orientación a resultados y capacidad para tomar decisiones basadas en datos.

Conocimiento avanzado de herramientas de gestión de proyectos y Microsoft Office (Excel, Word, PowerPoint).',

'Máster en Operaciones, Ciberseguridad, Gestión de Proyectos o MBA.

Experiencia con metodologías ágiles (Scrum, Kanban) y herramientas de gestión de proyectos (Jira, Asana).

Certificaciones relevantes en gestión de proyectos (PMP, Prince2) o ciberseguridad (CISSP, CISM).

Conocimiento de estándares y marcos de ciberseguridad (ISO 27001, NIST).

Experiencia con sistemas ERP y CRM.

Familiaridad con entornos de nube (AWS, Azure, GCP).',

'Contrato indefinido en una empresa líder y en constante crecimiento en un sector de alta demanda.

Salario competitivo acorde a la experiencia y valía del candidato.

Oportunidades de desarrollo profesional y formación continua en las últimas tendencias de ciberseguridad.

Ambiente de trabajo innovador, desafiante y colaborativo.

Flexibilidad horaria y opción de teletrabajo parcial.

Beneficios sociales adicionales (seguro médico, tickets de comida, plan de pensiones, etc. - a negociar según el perfil).'
)

-- Insertar datos en la tabla tech_labels
INSERT INTO tech_labels (id, name) VALUES (1, 'Java');
INSERT INTO tech_labels (name) VALUES ('Phyton');
INSERT INTO tech_labels (name) VALUES ('C++');
INSERT INTO tech_labels (name) VALUES ('C#');
INSERT INTO tech_labels (name) VALUES ('Javascript');
INSERT INTO tech_labels (name) VALUES ('React');
INSERT INTO tech_labels (name) VALUES ('Angular');
INSERT INTO tech_labels (name) VALUES ('HTML');
INSERT INTO tech_labels (name) VALUES ('CSS');
INSERT INTO tech_labels (name) VALUES ('Typescript');
INSERT INTO tech_labels (name) VALUES ('Docker');
INSERT INTO tech_labels (name) VALUES ('Vue.js');
INSERT INTO tech_labels (name) VALUES ('QA');
INSERT INTO tech_labels (name) VALUES ('Jira');
INSERT INTO tech_labels (name) VALUES ('Testing');