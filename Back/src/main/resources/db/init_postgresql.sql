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
INSERT INTO company (id, name, email) VALUES (1, 'InnovateX S.L', 'innovateX@wanadoo.es');
INSERT INTO company (name, email) VALUES ('InfoGuro S.L', 'guru.info@gmail.com');
INSERT INTO company (name, email) VALUES ('TechCorp', 'techoCorp@corp.com');
INSERT INTO company (name, email) VALUES ('TitanControl&Testing S.A', 'titanCon@email.com');

-- Insertar datos en la tabla candidate
INSERT INTO candidate (id, name, surname1, surname2, phone, email, linkedin, professional_title, years_experience, employment_status, availability, preferred_modality, presentation, github_profile) 
VALUES (1, 'Leo', 'Poldo Ces', 'Fragoso', '685098765', 'leo@gmail.com', 'https://www.linkedin.com/login/es', 'Desarollador de Videojuegos', '0', 'Activo', 'Mañanas', 'Presencial', 'Me llamo Leo y soy un desarollador de Videojuegos Junior', 'https://github.com/LeoCesF');

INSERT INTO candidate (name, surname1, surname2, phone, email, linkedin) 
VALUES ('Ana', 'Belén García', 'Añon', '123456789', 'anabar@gmail.com', 'https://www.linkedin.com/login/es');

INSERT INTO candidate (name, surname1, surname2, phone, email, linkedin) 
VALUES ('Martín', 'Sánchez', 'Novo', '965450986', 'martin@gmail.com', 'https://www.linkedin.com/login/es');

INSERT INTO candidate (name, surname1, surname2, phone, email, linkedin) 
VALUES ('Filippo', 'Giuseppe', 'Ferrantelli', '786353231', 'filipp@gmail.com', 'https://www.linkedin.com/login/es');

-- Insertar datos en la tabla users
INSERT INTO users (id, login, password, id_company, id_candidate) VALUES (1, 'demo', 'demo', NULL, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('ana', '1234', 1, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('martin', 'qwerty', 2, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('leo', '7890', 3, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('filippo', 'awsd', 4, NULL);
INSERT INTO users (login, password, id_company, id_candidate) VALUES ('kiwi', '1234', NULL, 1);

-- Insertar datos en la tabla user_roles
INSERT INTO user_roles (id, id_user, id_role) VALUES (1, 1, 1);
INSERT INTO user_roles (id_user, id_role) VALUES (2, 3);
INSERT INTO user_roles (id_user, id_role) VALUES (3, 3);
INSERT INTO user_roles (id_user, id_role) VALUES (4, 3);
INSERT INTO user_roles (id_user, id_role) VALUES (5, 4);

-- Insertar datos en la tabla offers
INSERT INTO offers (id, title, description, id_company, active, location, requirements, desirable, benefits, type) 
VALUES (1, 
'Desarrollador/a Junior JAVA', 
'Buscamos un/a Desarrollador/a Junior Java para unirse a nuestro equipo técnico en Madrid o en Ciudad Real, y formar parte del crecimiento y evolución de nuestros productos, así como de las iniciativas internas de mejora tecnológica.',
1, 
0, 
'Madrid', 
'Experiencia sólida en desarrollo backend con Java 8 y OpenJDK.Conocimientos avanzados en Hibernate, QueryDSL y Spring Framework.Experiencia trabajando con servicios SOAP y REST.Habilidad para documentar código y procesos técnicos con claridad.Nivel de inglés intermedio-alto (mínimo B2), especialmente a nivel escrito.',
'Conocimientos o interés en herramientas como Jira, Jenkins, Git, SVN y Docker.', 
'Desconocido', 
'Presencial');

INSERT INTO offers (title, description, id_company, active, location, requirements, desirable, benefits, type) 
VALUES ('Desarrollador/a Junior JAVA', 
'Formarás parte de un equipo muy completo de desarrollo trabajando como fullstack aunque la parte de front tendrá un gran peso. Con feedback inmediato sobre el trabajo, que tendrá impacto sobre miles de personas distribuidas por todo el mundo. El equipo aborda tareas que van desde nuevas funcionalidades, correcciones, optimizaciones sobre las aplicaciones existentes a la creación de aplicaciones nuevas desde cero, definiendo su arquitectura, compilación, modelo de datos, etc. Tendrás que tener experiencia en desarrollo de aplicaciones web y además de desarrollar, vas a diseñar y solucionar problemas tanto técnicos como funcionales. Que no te de miedo cacharrear y aprender nuevos frameworks, lenguajes, arquitecturas, ¡porque aquí tendrás la oportunidad de crecer!',
1, 
0, 
'Madrid', 
'Graduado(a) en ingeniería informática o telecomunicaciones,Experiencia de 2 años o más trabajando con las siguientes tecnologías: Programación Java 8 o superior,Spring Framework,React,Javascript,microservicios,Servicios rest (API Rest),SQL,Proactivo(a), con iniciativa y orientado(a) a la calidad.,Capacidad de diseño y solución de problemas tanto a nivle técnico como funcional.,Riguroso a la hora de desarrollar. Especial cuidado por la experiencia de usuario y la limpieza en el diseño de la interfaz,Con ambición en el plano tecnológico y con ganas de aprender.,Habilidad para el trabajo en equipo y sociable.',
'Además valoramos muy positivamente si tienes conocimientos o experiencia con alguna de las siguientes tecnologías: Programación funcional,Colas MQ,Kafka,gRPC', 
'Retribución competitiva acorde a tu nivel y experiencia, porque queremos remunerarte como te mereces y por eso realizamos revisiones salariales anuales según tu desempeño.Flexibilidad horaria. Si lo necesitas podrás modificar tu horario de entrada y de salida. Nuestro horario estándar es de 9 a 18:30h. (1h. comida) de lunes a jueves y de 8 a 15h. los viernes. ¡Autogestiona tu tiempo!Jornada intensiva los viernes durante TODO el año y ¡Dos meses en verano!Teletrabajo para que te organices y encuentres el equilibrio en tu vida.Conciliación familiar. Tenemos un conjunto de medidas encaminadas a desarrollar tu carrera para que no descuides tu vida personal y familiar. ¡Nos preocupamos por ti!Trabajarás en un entorno colaborativo y disfrutarás de un gran ambiente de trabajo en donde la comunicación interna y el respeto son clave.Formación interna con tu equipo de la mano de nuestros mejores profesionales. Acceso ilimitado a una plataforma de formación en donde podrás escoger libremente los programas, en diferentes idiomas, que más te gusten y mejor se adapten a tus necesidades.Programa corporativo de inglés. Para que puedas estar en contacto y conectar con nuestros proyectos más internacionalesPlan de carrera para garantizar tu desarrollo profesional, porque nuestra idea es que sigas creciendo con nosotros y para ello te ofrecemos oportunidades para tu desarrollo e impulsaremos tu potencial adaptándonos a tus necesidades. Tus metas profesionales, son las nuestras.Posibilidad de seguro privado de salud. Te ayudamos a gestionarlo ofreciéndote precios competitivos.Y por supuesto, no todo va a ser trabajar, somos una empresa joven y nos gusta disfrutar y celebrar los éxitos todos juntos. Cada 6 meses nos reunimos y…¡Let the party begin!', 
'Remoto');

-- Insertar datos en la tabla applications
INSERT INTO applications (id, id_candidate, id_offer, state) VALUES (1, 1, 1, 0);
INSERT INTO applications (id_candidate, id_offer, state) VALUES (1, 2, 2);

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