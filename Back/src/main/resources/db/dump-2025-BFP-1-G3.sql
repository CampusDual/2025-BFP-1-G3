--
-- PostgreSQL database dump
--

-- Dumped from database version 11.22 (Debian 11.22-0+deb10u2)
-- Dumped by pg_dump version 17.0

-- Started on 2025-07-30 14:16:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 648 (class 1247 OID 332880)
-- Name: work_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_type_enum AS ENUM (
    'remote',
    'hybrid',
    'onsite'
);


SET default_tablespace = '';

--
-- TOC entry 209 (class 1259 OID 332170)
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    id_candidate integer NOT NULL,
    id_offer integer NOT NULL,
    state smallint DEFAULT 0,
    CONSTRAINT applications_state_check CHECK ((state = ANY (ARRAY[0, 1, 2])))
);


--
-- TOC entry 208 (class 1259 OID 332168)
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3046 (class 0 OID 0)
-- Dependencies: 208
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- TOC entry 207 (class 1259 OID 332147)
-- Name: candidate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidate (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    surname1 character varying(100) NOT NULL,
    surname2 character varying(100),
    phone character varying(9) NOT NULL,
    email character varying(100) NOT NULL,
    linkedin character varying(255) DEFAULT ''::character varying,
    professional_title character varying(255),
    years_experience integer,
    employment_status character varying(50),
    availability character varying(50),
    preferred_modality character varying(50),
    presentation text,
    github_profile character varying(255),
    profile_photo_url character varying(500),
    profile_photo_filename character varying(255),
    profile_photo_content_type character varying(100)
);


--
-- TOC entry 3047 (class 0 OID 0)
-- Dependencies: 207
-- Name: COLUMN candidate.professional_title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.candidate.professional_title IS 'Título profesional del candidato';


--
-- TOC entry 3048 (class 0 OID 0)
-- Dependencies: 207
-- Name: COLUMN candidate.profile_photo_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.candidate.profile_photo_url IS 'URL o ruta donde se almacena la foto de perfil del candidato';


--
-- TOC entry 3049 (class 0 OID 0)
-- Dependencies: 207
-- Name: COLUMN candidate.profile_photo_filename; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.candidate.profile_photo_filename IS 'Nombre original del archivo de la foto de perfil';


--
-- TOC entry 3050 (class 0 OID 0)
-- Dependencies: 207
-- Name: COLUMN candidate.profile_photo_content_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.candidate.profile_photo_content_type IS 'Tipo MIME de la imagen (image/jpeg, image/png, etc.)';


--
-- TOC entry 206 (class 1259 OID 332145)
-- Name: candidate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.candidate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3051 (class 0 OID 0)
-- Dependencies: 206
-- Name: candidate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.candidate_id_seq OWNED BY public.candidate.id;


--
-- TOC entry 215 (class 1259 OID 333011)
-- Name: candidate_tech_labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidate_tech_labels (
    id bigint NOT NULL,
    id_candidate integer NOT NULL,
    id_tech_label bigint NOT NULL
);


--
-- TOC entry 214 (class 1259 OID 333009)
-- Name: candidate_tech_labels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.candidate_tech_labels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3052 (class 0 OID 0)
-- Dependencies: 214
-- Name: candidate_tech_labels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.candidate_tech_labels_id_seq OWNED BY public.candidate_tech_labels.id;


--
-- TOC entry 196 (class 1259 OID 331299)
-- Name: company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    cif character varying(255),
    description text,
    website character varying(255),
    location character varying(255),
    sector character varying(255),
    phone character varying(255),
    address character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 204 (class 1259 OID 331955)
-- Name: company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3053 (class 0 OID 0)
-- Dependencies: 204
-- Name: company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_id_seq OWNED BY public.company.id;


--
-- TOC entry 205 (class 1259 OID 332094)
-- Name: offers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 203 (class 1259 OID 331917)
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id integer DEFAULT nextval('public.offers_id_seq'::regclass) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    id_company integer,
    active smallint NOT NULL,
    location character varying(100),
    publishing_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    requirements text,
    desirable text,
    benefits text,
    type character varying(50) DEFAULT 'remote'::character varying,
    CONSTRAINT chk_tu_columna_valores_validos CHECK ((active = ANY (ARRAY[0, 1, 2]))),
    CONSTRAINT offers_type_check CHECK (((type)::text = ANY (ARRAY[('remote'::character varying)::text, ('hybrid'::character varying)::text, ('onsite'::character varying)::text])))
);


--
-- TOC entry 213 (class 1259 OID 332534)
-- Name: offers_labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers_labels (
    id integer NOT NULL,
    id_offer integer NOT NULL,
    id_label integer NOT NULL
);


--
-- TOC entry 212 (class 1259 OID 332532)
-- Name: offers_labels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offers_labels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3054 (class 0 OID 0)
-- Dependencies: 212
-- Name: offers_labels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offers_labels_id_seq OWNED BY public.offers_labels.id;


--
-- TOC entry 198 (class 1259 OID 331639)
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    role_description character varying(255) NOT NULL,
    role_name character varying(255) NOT NULL
);


--
-- TOC entry 197 (class 1259 OID 331637)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3055 (class 0 OID 0)
-- Dependencies: 197
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 211 (class 1259 OID 332526)
-- Name: tech_labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tech_labels (
    id integer NOT NULL,
    name character varying(32) NOT NULL
);


--
-- TOC entry 210 (class 1259 OID 332524)
-- Name: tech_labels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tech_labels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3056 (class 0 OID 0)
-- Dependencies: 210
-- Name: tech_labels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tech_labels_id_seq OWNED BY public.tech_labels.id;


--
-- TOC entry 200 (class 1259 OID 331650)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id bigint NOT NULL,
    role_id bigint,
    user_id integer
);


--
-- TOC entry 199 (class 1259 OID 331648)
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3057 (class 0 OID 0)
-- Dependencies: 199
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- TOC entry 202 (class 1259 OID 331658)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    login character varying(255) NOT NULL,
    password character varying(255),
    id_company integer,
    id_candidate integer
);


--
-- TOC entry 201 (class 1259 OID 331656)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3058 (class 0 OID 0)
-- Dependencies: 201
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 2847 (class 2604 OID 332173)
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- TOC entry 2845 (class 2604 OID 332150)
-- Name: candidate id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate ALTER COLUMN id SET DEFAULT nextval('public.candidate_id_seq'::regclass);


--
-- TOC entry 2851 (class 2604 OID 333014)
-- Name: candidate_tech_labels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate_tech_labels ALTER COLUMN id SET DEFAULT nextval('public.candidate_tech_labels_id_seq'::regclass);


--
-- TOC entry 2837 (class 2604 OID 331978)
-- Name: company id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company ALTER COLUMN id SET DEFAULT nextval('public.company_id_seq'::regclass);


--
-- TOC entry 2850 (class 2604 OID 332537)
-- Name: offers_labels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers_labels ALTER COLUMN id SET DEFAULT nextval('public.offers_labels_id_seq'::regclass);


--
-- TOC entry 2839 (class 2604 OID 331642)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 2849 (class 2604 OID 332529)
-- Name: tech_labels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tech_labels ALTER COLUMN id SET DEFAULT nextval('public.tech_labels_id_seq'::regclass);


--
-- TOC entry 2840 (class 2604 OID 331653)
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- TOC entry 2841 (class 2604 OID 331661)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3034 (class 0 OID 332170)
-- Dependencies: 209
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.applications VALUES (237, 106, 69, 0);
INSERT INTO public.applications VALUES (238, 106, 72, 0);
INSERT INTO public.applications VALUES (239, 106, 73, 0);
INSERT INTO public.applications VALUES (240, 106, 74, 0);
INSERT INTO public.applications VALUES (243, 105, 74, 0);
INSERT INTO public.applications VALUES (244, 105, 73, 0);
INSERT INTO public.applications VALUES (245, 105, 72, 0);
INSERT INTO public.applications VALUES (246, 105, 69, 0);
INSERT INTO public.applications VALUES (247, 96, 74, 0);
INSERT INTO public.applications VALUES (248, 96, 73, 0);
INSERT INTO public.applications VALUES (249, 96, 72, 0);
INSERT INTO public.applications VALUES (250, 96, 69, 0);
INSERT INTO public.applications VALUES (251, 87, 72, 0);
INSERT INTO public.applications VALUES (252, 87, 73, 0);
INSERT INTO public.applications VALUES (253, 87, 69, 0);
INSERT INTO public.applications VALUES (254, 87, 74, 0);
INSERT INTO public.applications VALUES (255, 88, 69, 0);
INSERT INTO public.applications VALUES (256, 88, 74, 0);
INSERT INTO public.applications VALUES (257, 88, 73, 0);
INSERT INTO public.applications VALUES (258, 88, 72, 0);
INSERT INTO public.applications VALUES (259, 89, 69, 0);
INSERT INTO public.applications VALUES (260, 89, 74, 0);
INSERT INTO public.applications VALUES (261, 89, 73, 0);
INSERT INTO public.applications VALUES (262, 89, 72, 0);
INSERT INTO public.applications VALUES (263, 90, 74, 0);
INSERT INTO public.applications VALUES (264, 90, 73, 0);
INSERT INTO public.applications VALUES (265, 90, 72, 0);
INSERT INTO public.applications VALUES (266, 90, 69, 0);
INSERT INTO public.applications VALUES (275, 118, 90, 1);


--
-- TOC entry 3032 (class 0 OID 332147)
-- Dependencies: 207
-- Data for Name: candidate; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.candidate VALUES (96, 'Nuria', 'Calo', 'Mosquera', '654120056', 'nuriacalo@email.com', 'https://www.linkedin.com/in/nuria-calo-mosq/', 'Profesora de Infantil', NULL, 'ESTUDIANTE', 'INMEDIATA', 'PRESENCIAL', NULL, 'https://github.com/nuriacalo', NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (93, 'Alex', 'Barbeito', 'Domínguez', '678012652', 'alexbd@email.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (90, 'Filippo', 'Giuseppe', 'Ferrantelli', '678912351', 'filippogf@email.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (89, 'Leo', 'Ces', 'Fragoso', '678145672', 'leocf@email.com', 'https://www.linkedin.com/in/leo-cesfra', 'Desarollador de Videojuegos', NULL, 'ESTUDIANTE', 'UN_MES', 'HIBRIDO', 'Soy un estudiante de videojuegos y desarrollo multiplataforma que espera incorporarse pronto al mundo laboral', 'https://github.com/LeoCesF', NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (97, 'Enmanuel', 'Lledo', 'Pozo', '123456789', 'enmanuel@email.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (98, 'Ian', 'Agrafojo', '', '123456789', 'ian@email.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (105, 'Fernando', 'Parga', 'Fernández', '669551176', '50nando05@gmail.com', 'https://www.linkedin.com/in/fernando-parga-fernandez/', 'Desarrollador Aplicaciones Multiplataforma', 1, 'ESTUDIANTE', 'INMEDIATA', 'HIBRIDO', 'Estudiante de FP de Desarrollo de Aplicaciones Multiplataforma que busca empresa en la que realizar sus prácticas', 'https://github.com/Nando5P', NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (106, 'Alejandro', 'Azpeitia', 'Blanco', '692198561', 'alejandro555azpeitia@gmail.com', 'https://www.linkedin.com/in/alejandroazpeitiablanco/', 'Desarrollador de Aplicaciones Multiplataforma', 1, 'ESTUDIANTE', 'INMEDIATA', 'HIBRIDO', 'Estudiante de FP de Desarrollo de Desarrollo de Aplicaciones Multiplataforma, con experiencia en desarrollo de videojuegos, que busca empresa para realizar las prácticas.', 'https://github.com/Aldair-GL', NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (118, 'Jorge', 'Gónzalez', 'Canoura', '686044759', 'jorge.cg@gmail.com', 'https://www.linkedin.com/in/jgonzalezfernandez/', 'Ingeniero Informático', 5, 'DESEMPLEADO', 'INMEDIATA', 'HIBRIDO', 'Mi nombre es Jorge, y soy un ingeniero informático con 5 años de experiencia en el sector. He desarrollado mi carrera profesional en Data Science y me apasiona encontrar soluciones tecnológicas innovadoras. Llevo 3 años trabajando en IA y Machine Learninng y actualmente busco una oportunidad en la modalidad híbrida donde pueda aplicar mis habilidades y seguir creciendo profesionalmente. Tengo disponibilidad inmediata para unirme a un nuevo equipo.', NULL, NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (95, 'Ángel', 'Puga', 'Gómez', '123456789', 'angelpg@email.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (87, 'Ana Belén', 'García', 'Añón', '631467812', 'ana@email.com', 'https://www.linkedin.com/in/ana-bel%C3%A9n-garc%C3%ADa-a%C3%B1%C3%B3n/', 'Sociológa', 1, 'ESTUDIANTE', 'UNA_SEMANA', 'HIBRIDO', 'Graduada en Sociología con una sólida base en análisis de datos, investigación social y resolución de problemas complejos. Apasionada por aprender nuevas tecnologías y desarrollar habilidades en desarrollo software para contribuir de manera efectiva en proyectos multidisciplinarios.', 'https://github.com/Anabgar3105', NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (88, 'Martin', 'Sánchez', 'Novo', '687654321', 'matin@email.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (92, 'Javier', 'González', 'Prados', '612309825', 'javigp@email.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.candidate VALUES (91, 'Silvia', 'García', 'Bouza', '615420963', 'silviagb@email.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- TOC entry 3040 (class 0 OID 333011)
-- Dependencies: 215
-- Data for Name: candidate_tech_labels; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.candidate_tech_labels VALUES (474, 89, 92);
INSERT INTO public.candidate_tech_labels VALUES (475, 89, 1);
INSERT INTO public.candidate_tech_labels VALUES (476, 89, 101);
INSERT INTO public.candidate_tech_labels VALUES (477, 89, 104);
INSERT INTO public.candidate_tech_labels VALUES (478, 89, 102);
INSERT INTO public.candidate_tech_labels VALUES (479, 89, 140);
INSERT INTO public.candidate_tech_labels VALUES (490, 87, 131);
INSERT INTO public.candidate_tech_labels VALUES (491, 87, 99);
INSERT INTO public.candidate_tech_labels VALUES (492, 87, 101);
INSERT INTO public.candidate_tech_labels VALUES (493, 87, 91);
INSERT INTO public.candidate_tech_labels VALUES (494, 87, 102);
INSERT INTO public.candidate_tech_labels VALUES (495, 87, 104);
INSERT INTO public.candidate_tech_labels VALUES (496, 87, 109);
INSERT INTO public.candidate_tech_labels VALUES (497, 87, 98);
INSERT INTO public.candidate_tech_labels VALUES (280, 93, 121);
INSERT INTO public.candidate_tech_labels VALUES (281, 93, 125);
INSERT INTO public.candidate_tech_labels VALUES (498, 87, 164);
INSERT INTO public.candidate_tech_labels VALUES (499, 87, 1);
INSERT INTO public.candidate_tech_labels VALUES (643, 118, 162);
INSERT INTO public.candidate_tech_labels VALUES (644, 118, 167);
INSERT INTO public.candidate_tech_labels VALUES (645, 118, 160);
INSERT INTO public.candidate_tech_labels VALUES (646, 118, 159);
INSERT INTO public.candidate_tech_labels VALUES (647, 118, 166);
INSERT INTO public.candidate_tech_labels VALUES (648, 118, 164);
INSERT INTO public.candidate_tech_labels VALUES (649, 118, 157);
INSERT INTO public.candidate_tech_labels VALUES (650, 118, 163);
INSERT INTO public.candidate_tech_labels VALUES (651, 118, 165);
INSERT INTO public.candidate_tech_labels VALUES (652, 118, 99);
INSERT INTO public.candidate_tech_labels VALUES (510, 105, 102);
INSERT INTO public.candidate_tech_labels VALUES (511, 105, 131);
INSERT INTO public.candidate_tech_labels VALUES (512, 105, 104);
INSERT INTO public.candidate_tech_labels VALUES (513, 105, 98);
INSERT INTO public.candidate_tech_labels VALUES (514, 105, 101);
INSERT INTO public.candidate_tech_labels VALUES (515, 105, 109);
INSERT INTO public.candidate_tech_labels VALUES (516, 105, 1);
INSERT INTO public.candidate_tech_labels VALUES (306, 90, 93);
INSERT INTO public.candidate_tech_labels VALUES (517, 105, 164);
INSERT INTO public.candidate_tech_labels VALUES (518, 105, 99);
INSERT INTO public.candidate_tech_labels VALUES (519, 105, 91);
INSERT INTO public.candidate_tech_labels VALUES (520, 106, 131);
INSERT INTO public.candidate_tech_labels VALUES (521, 106, 102);
INSERT INTO public.candidate_tech_labels VALUES (522, 106, 98);
INSERT INTO public.candidate_tech_labels VALUES (523, 106, 91);
INSERT INTO public.candidate_tech_labels VALUES (524, 106, 99);
INSERT INTO public.candidate_tech_labels VALUES (525, 106, 92);
INSERT INTO public.candidate_tech_labels VALUES (526, 106, 101);
INSERT INTO public.candidate_tech_labels VALUES (527, 106, 109);
INSERT INTO public.candidate_tech_labels VALUES (528, 106, 104);
INSERT INTO public.candidate_tech_labels VALUES (529, 106, 1);
INSERT INTO public.candidate_tech_labels VALUES (464, 96, 102);
INSERT INTO public.candidate_tech_labels VALUES (465, 96, 132);
INSERT INTO public.candidate_tech_labels VALUES (466, 96, 101);
INSERT INTO public.candidate_tech_labels VALUES (467, 96, 164);
INSERT INTO public.candidate_tech_labels VALUES (468, 96, 109);
INSERT INTO public.candidate_tech_labels VALUES (469, 96, 131);
INSERT INTO public.candidate_tech_labels VALUES (470, 96, 1);
INSERT INTO public.candidate_tech_labels VALUES (471, 96, 99);
INSERT INTO public.candidate_tech_labels VALUES (472, 96, 129);
INSERT INTO public.candidate_tech_labels VALUES (473, 96, 104);


--
-- TOC entry 3021 (class 0 OID 331299)
-- Dependencies: 196
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.company VALUES (3, 'Luckia Tech, S.L.', 'info.proveedores@luckia.com', 'B72940554', 'Diseño, desarrollo, producción, integración, operación, mantenimiento, reparación y comercialización de sistemas, soluciones y productos de carácter técnico de tipo informático, y especialmente de aplicaciones técnicas necesarias para la organización y explotación de juegos y apuestas.', 'https://www.luckiagaminggroup.com/servicios/luckia-tech/', 'A Coruña, España', 'Tecnologías de la información y la informática', NULL, 'Calle Severo Ochoa 3, 15008 A Coruña, España', '2025-07-22 13:38:23.456591');
INSERT INTO public.company VALUES (4, 'Aldaba Servicios Profesionales, S.L.U.', 'info@aldaba.es', 'B15862295', 'Servicios profesionales de diseño y desarrollo de soluciones para la optimización tecnológica de la gestión empresarial o de la administración pública. Gestión global de proyectos en el ámbito de las TI y las telecomunicaciones.', 'https://www.aldaba.es', 'A Coruña, España', 'Programación, consultoría y otras actividades relacionadas con la informática', NULL, 'Calle Copérnico 5, Parque Empresarial Agrela, 15008 A Coruña, España', '2025-07-22 13:38:23.456591');
INSERT INTO public.company VALUES (5, 'Texas Controls, S.L.', 'texas@texascontrols.com', 'B15531916', 'Empresa de ingeniería especializada en apriete y sellado industrial, fabricación, alquiler y asistencia técnica de maquinaria industrial.', 'https://www.texascontrols.com', 'Bergondo, A Coruña, España', 'Ingeniería industrial', NULL, 'Polígono Industrial Bergondo, Parcela R-17, 15165 Bergondo, A Coruña, España', '2025-07-22 13:38:23.456591');
INSERT INTO public.company VALUES (6, 'Tecnologías Plexus, S.L.', 'info@plexus.es', 'B15726177', 'Prestación de servicios técnicos de ingeniería informática y otras actividades relacionadas con el asesoramiento técnico para sectores como banca, seguros, turismo y salud.', 'https://www.plexus.es', 'Santiago de Compostela, A Coruña, España', 'Servicios técnicos de ingeniería y asesoría técnica', NULL, 'Calle José Villar Granjel 22, Polígono Industrial, 15890 Santiago de Compostela, A Coruña, España', '2025-07-22 13:38:23.456591');
INSERT INTO public.company VALUES (2, 'Cinfo, S.L.', 'contact@cinfo.es', 'B15757941', 'Soluciones de inteligencia artificial y tecnología de vídeo para plataformas OTT, metadatos y experiencias multimedia en sectores como media, telecomunicaciones e industrias.', 'https://www.cinfo.es', 'A Coruña, España', 'Otras actividades relacionadas con las tecnologías de la información y la informática', NULL, 'Avenida Pedralonga 32, 1ª planta, Ciudad de las TIC, 15009 A Coruña, España', '2025-07-22 13:38:23.456591');
INSERT INTO public.company VALUES (1, 'InnovaTech', 'innovatech@info.com', 'B34560123', 'Empresa tecnológica dedicada a la seguridad de sus datos', 'https://www.edu.xunta.gal/fp/innovatech-fp', 'A Coruña, España', 'Tecnologías de la información y la informática', '', 'Evergreen Terrace, 742 20090 Springfield, USA', '2025-07-23 14:49:19.567165');


--
-- TOC entry 3028 (class 0 OID 331917)
-- Dependencies: 203
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.offers VALUES (62, 'Analista/a de Seguridad Informática', 'Auditorías de vulnerabilidades y definición de políticas de seguridad.', 6, 1, 'Santiago de Compostela, España', '2025-07-22 00:00:00', '• Pentesting • ISO 27001 • Firewalls', '• CISSP/CEH • Python/Bash', '• Teletrabajo parcial • Seguro médico', 'hybrid');
INSERT INTO public.offers VALUES (54, 'Business Analyst', 'Recogida y documentación de requisitos para soluciones ERP y CRM.', 2, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• UML • SQL • Herramientas de modelado', '• ERP (SAP, Dynamics) • Data Warehousing', '• Formación técnica • Flexibilidad horaria', 'remote');
INSERT INTO public.offers VALUES (45, 'QA Engineer', 'Definición de planes de prueba y automatización de tests para aplicaciones multimedia.', 4, 1, 'A Coruña, España', '2025-07-22 14:48:17.020208', '• Selenium/WebDriver 
• Postman 
• Metodologías Agile', '• CI/CD pipelines
 • Cucumber', '• Formación continua 
• Seguro de vida', 'remote');
INSERT INTO public.offers VALUES (46, 'Product Manager', 'Gestión de roadmap de producto y coordinación de equipos de desarrollo y operaciones.', 3, 1, 'A Coruña, España', '2025-07-22 14:48:42.801709', '• 3+ años en gestión de producto 
• Scrum 
• Análisis de datos', '• UX/UI basics 
• Inglés fluido', '• Teletrabajo parcial 
• Seguro médico', 'hybrid');
INSERT INTO public.offers VALUES (44, 'Ingeniero/a DevOps', 'Automatización de despliegues y monitorización de infraestructura de streaming.', 2, 1, 'A Coruña, España', '2025-07-22 14:47:46.667364', '• Experiencia con Kubernetes 
• Terraform 
• Linux', '• Prometheus/Grafana 
• Ansible', '• Bonus anual 
• Plan de carrera', 'onsite');
INSERT INTO public.offers VALUES (48, 'Ingeniero/a DevOps Senior', 'Diseño y operación de plataformas CI/CD y alta disponibilidad.', 2, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• Jenkins/GitLab CI • AWS • Linux', '• Terraform • Prometheus', '• Seguro médico • Tickets restaurante', 'onsite');
INSERT INTO public.offers VALUES (49, 'Analista de Datos', 'Extracción y análisis de datos de uso de la plataforma de juego.', 5, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• SQL • Python • Power BI/Tableau', '• BigQuery • Machine Learning basics', '• Formación continua • Teletrabajo parcial', 'hybrid');
INSERT INTO public.offers VALUES (50, 'Ingeniero/a de Seguridad', 'Implementación de controles de seguridad y auditorías en sistemas de apuestas.', 6, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• Experiencia en CISSP/CISM • Firewall • SIEM', '• Pentesting • Scripts en Python', '• Bonus anual • Seguro de vida', 'onsite');
INSERT INTO public.offers VALUES (51, 'Administración de Sistemas Linux', 'Gestión y monitorización de servidores de producción.', 2, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• Linux (RedHat/CentOS) • Bash scripting • Nginx/Apache', '• Ansible • Docker', '• Tickets restaurante • Flexibilidad horaria', 'hybrid');
INSERT INTO public.offers VALUES (52, 'Consultor/a de Transformación Digital', 'Liderazgo de proyectos de digitalización para clientes públicos y privados.', 3, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• Gestión de proyectos • ITIL • Análisis de procesos', '• PMP o Prince2 • Inglés C1', '• Formación continua • Comedor corporativo', 'onsite');
INSERT INTO public.offers VALUES (53, 'Project Manager TI', 'Planificación y seguimiento de proyectos de software y telecomunicaciones.', 2, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• PMP/Scrum Master • MS Project/Jira', '• Lean IT • Agile Coach', '• Bonus por proyecto • Teletrabajo parcial', 'hybrid');
INSERT INTO public.offers VALUES (55, 'Network Engineer', 'Diseño y configuración de redes corporativas y de voz/datos.', 6, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• Cisco/Juniper • VPN • VLAN', '• IPv6 • Wireless', '• Seguro médico • Plan de carrera', 'onsite');
INSERT INTO public.offers VALUES (56, 'Cloud Architect', 'Definición de la arquitectura cloud y migraciones a AWS/Azure.', 5, 1, 'A Coruña, España', '2025-07-22 00:00:00', '• AWS/Azure • Terraform • Cloud Security', '• Kubernetes • DevSecOps', '• Bonus anual • Teletrabajo parcial', 'hybrid');
INSERT INTO public.offers VALUES (57, 'Técnico/a de Mantenimiento Industrial', 'Mantenimiento preventivo y correctivo de maquinaria de apriete.', 2, 1, 'Bergondo, A Coruña, España', '2025-07-22 00:00:00', '• Formación en mecánica industrial • Neumática e hidráulica', '• PLC (Siemens, Allen-Bradley)', '• Vehículo de empresa • Dietas', 'onsite');
INSERT INTO public.offers VALUES (58, 'Ingeniero/a de Campo', 'Instalación y puesta a punto de equipos en plantas cliente.', 6, 1, 'Bergondo, A Coruña, España', '2025-07-22 00:00:00', '• Ingeniería industrial • Lectura de planos', '• Experiencia internacional', '• Dietas • Seguro de vida', 'onsite');
INSERT INTO public.offers VALUES (60, 'Ingeniero/a de Calidad', 'Control de calidad y certificaciones ISO en procesos de apriete.', 4, 1, 'Bergondo, A Coruña, España', '2025-07-22 00:00:00', '• ISO 9001/ISO 14001 • Six Sigma', '• Auditor interno', '• Flexibilidad horaria • Seguro médico', 'onsite');
INSERT INTO public.offers VALUES (61, 'Coordinador/a de Seguridad Industrial', 'Implantación de planes de seguridad y formación de operarios.', 3, 1, 'Bergondo, A Coruña, España', '2025-07-22 00:00:00', '• Prevención de riesgos laborales • PRL Nivel 2', '• Gestión de emergencias', '• Formación continua • Seguro de vida', 'onsite');
INSERT INTO public.offers VALUES (63, 'Consultor/a IT', 'Asesoramiento técnico en proyectos de banca y seguros.', 5, 1, 'Santiago de Compostela, España', '2025-07-22 00:00:00', '• Experiencia consultoría • SQL • UML', '• Power BI • Inglés fluido', '• Formación continua • Flexibilidad horaria', 'remote');
INSERT INTO public.offers VALUES (64, 'Ingeniero/a de Infraestructura', 'Diseño y despliegue de entornos on-premise y cloud híbrida.', 4, 1, 'Santiago de Compostela, España', '2025-07-22 00:00:00', '• VMware/Hyper-V • AWS • Networking', '• Ansible • Docker', '• Bonus anual • Seguro de vida', 'onsite');
INSERT INTO public.offers VALUES (65, 'Técnico/a de Soporte TI', 'Resolución de incidencias de hardware y software para clientes corporativos.', 3, 1, 'Santiago de Compostela, España', '2025-07-22 00:00:00', '• Windows/Linux • Active Directory • Helpdesk', '• Inglés B2 • Certificación ITIL', '• Formación interna • Tickets restaurante', 'onsite');
INSERT INTO public.offers VALUES (66, 'Ingeniero/a de Pruebas de Seguridad', 'Ejecución de tests de penetración y validación de parches de seguridad.', 2, 1, 'Santiago de Compostela, España', '2025-07-22 00:00:00', '• Metodologías de pentesting • Kali Linux', '• Scripting Python • Burp Suite', '• Teletrabajo parcial • Plan de carrera', 'hybrid');
INSERT INTO public.offers VALUES (43, 'Desarrollador/a Frontend React', 'Implementación de interfaces de usuario dinámicas para plataforma OTT.', 6, 1, 'A Coruña, España', '2025-07-22 14:47:27.120846', '• 2+ años en React 
• JavaScript/TypeScript 
• CSS3/HTML5', '• Next.js 
• Testing (Jest, React Testing Library)', '• Tickets restaurante 
• Flexibilidad horaria', 'onsite');
INSERT INTO public.offers VALUES (59, 'Responsable de Operaciones', 'Coordinación de equipos y planificación de producción.', 5, 1, 'Bergondo, A Coruña, España', '2025-07-30 08:27:17.29131', '• Liderazgo de equipos 
• ERP/MRP', '• Lean Manufacturing', '• Bonus por objetivos 
• Tickets restaurante', 'onsite');
INSERT INTO public.offers VALUES (42, 'Desarrollador/a Backend Python', 'Desarrollo y mantenimiento de microservicios para procesamiento de vídeo y metadatos.', 2, 1, 'A Coruña, España', '2025-07-22 14:41:45.688406', '• 3+ años de experiencia en Python 
• Django/Flask 
• PostgreSQL', '• Docker 
• AWS (EC2, S3) 
• CI/CD', '• Teletrabajo parcial 
• Seguro médico 
• Formación continua', 'hybrid');
INSERT INTO public.offers VALUES (68, 'Inteligencia artificial', 'demo', 6, 0, 'demo', '2025-07-23 13:22:53.606893', 'demo', 'demo', 'demo', 'remote');
INSERT INTO public.offers VALUES (69, 'Técnico/a Junior de Ciberseguridad industrial (OT)', 'En InnovaTech queremos ampliar nuestro equipo e incorporar a un/a Técnico/a Junior de Ciberseguridad industrial (OT) para formar parte de varios proyectos dentro de la compañía. La modalidad de trabajo será hibrida en Coruña. 
El horario será habitual de oficina con jornada intensiva los viernes y meses de verano.

Este perfil nos ayudará a colaborar en la protección de entornos industriales, apoyando la identificación de vulnerabilidades y la evaluación de riesgos cibernéticos. También contribuirá en la configuración segura de redes y sistemas operativos, así como en el análisis de datos para detectar comportamientos anómalos. 
Nos permitirá reforzar el cumplimiento de normativas de seguridad, y participar en la revisión de código y buenas prácticas de programación para prevenir incidentes. Además, podrá dar soporte en la elaboración de informes y documentación técnica que respalde las acciones de seguridad implementadas.', 1, 1, 'Coruña, España', '2025-07-24 08:53:53.356047', 'Imprescindible atesorar al menos 1 año de experiencia previa en un rol igual o similar.
Imprescindible experiencia previa de al menos 3 años trabajando con SCADA y PLC
Conocimiento de redes Industriales OT (Modbus, OPC UA, BACNET...)', 'Configuración de fireware, sondas, routers, modelos OSI y TCP/IP.
Direcciones IP, subredes y enrutamiento
Políticas de seguridad y cómo implementarla
Conocimientos de las normativas y estándares de la industria para la IEC 62443, ISO 27001', 'Estabilidad y gran equipo con el que crecer día a día, formarás parte de una empresa multicultural con más de 130 años de historia y 4.000 empleados en 22 países, de los cuales, 1.800 están en España.
Crecimiento profesional. Oportunidades reales de desarrollar tu carrera profesional apostando por la movilidad interna y tu crecimiento a través de nuestros programas de talento junior, evaluación del desempeño, liderazgo, reconocimiento interno, etc.
Formación continua: Disponemos de planes de formación donde tendrás acceso a varias plataformas e-learning e itinerarios formativos con un amplio catálogo multidisciplinar para actualizar tus conocimientos y potenciar tu crecimiento.
Colaborarás con grandes referentes tecnológicos del sector que serán tu inspiración, te ayudarán en tu día a día y en los que te reflejarás para seguir creciendo profesionalmente en tecnologías punteras.
Apostamos por la conciliación y la flexibilidad horaria para que compatibilices tu vida personal y profesional.
Podrás acogerte a retribución flexible para que puedas beneficiarte de aquello que más se ajuste a tus necesidades: ticket restaurante, guardería, transporte, seguro médico privado, renting de coche y/o formación.
Cultura de transparencia: Tendrás acceso a todas nuestras ofertas de empleo y la oportunidad de contribuir a la captación del mejor talento a través de nuestro programa de referidos.
Igualdad de Oportunidades, diversidad e inclusión en todas nuestras operaciones y acciones internas, donde se valora la capacidad, la experiencia y el desempeño de cada persona.
Compromiso con la sostenibilidad: Impulsamos soluciones tecnológicas con bajas emisiones de carbono y contamos con certificaciones ISO que respaldan nuestra responsabilidad medioambiental.', 'hybrid');
INSERT INTO public.offers VALUES (72, 'Soporte Ciberseguridad 24/5', 'En InnovaTech queremos ampliar nuestro equipo e incorporar a un/a Soporte de Ciberseguridad 24/5 para formar parte de varios proyectos dentro de la compañía.
El horario será habitual de oficina con jornada intensiva los viernes y meses de verano.

Funciones:
Resolución de incidencias básicas y garantizar tiempos de respuesta inmediatos en entornos de ciberseguridad.
Supervisión y monitoreo de herramientas de seguridad (Defender for Cloud, WIZ, Palo Alto, Zscaler, Akamai, Cyberark, etc).
Gestión de tickets en Remedy, Jira, RTIR u otra herramienta corporativa dentro del servicio.
Resolución de problemas recurrentes en configuraciones de acceso, alertas de bajo impacto y tráfico de datos bajo guion.
Escalado eficiente de incidencias.', 1, 1, 'A Coruña, España', '2025-07-24 08:54:08.350756', 'Experiencia previa en Soporte Ciberseguridad N1
 Debe tener un conocimiento general de Azure y Ciberseguridad.
 Valorable conocimiento/experiencia con Defender for Cloud, WIZ, Palo Alto, Zscaler, Akamai, Cyberark, etc.
 Modelo Hibrido de teletrabajo - 3 días presenciales', '', 'Estabilidad y gran equipo con el que crecer día a día, formarás parte de una empresa multicultural con más de 130 años de historia y 4.000 empleados en 22 países, de los cuales, 1.800 están en España.
Crecimiento profesional. Oportunidades reales de desarrollar tu carrera profesional apostando por la movilidad interna y tu crecimiento a través de nuestros programas de talento junior, evaluación del desempeño, liderazgo, reconocimiento interno, etc.
Formación continua: Disponemos de planes de formación donde tendrás acceso a varias plataformas e-learning e itinerarios formativos con un amplio catálogo multidisciplinar para actualizar tus conocimientos y potenciar tu crecimiento.
Colaborarás con grandes referentes tecnológicos del sector que serán tu inspiración, te ayudarán en tu día a día y en los que te reflejarás para seguir creciendo profesionalmente en tecnologías punteras.
Apostamos por la conciliación y la flexibilidad horaria para que compatibilices tu vida personal y profesional.
Podrás acogerte a retribución flexible para que puedas beneficiarte de aquello que más se ajuste a tus necesidades: ticket restaurante, guardería, transporte, seguro médico privado, renting de coche y/o formación.
Cultura de transparencia: Tendrás acceso a todas nuestras ofertas de empleo y la oportunidad de contribuir a la captación del mejor talento a través de nuestro programa de referidos.
Igualdad de Oportunidades, diversidad e inclusión en todas nuestras operaciones y acciones internas, donde se valora la capacidad, la experiencia y el desempeño de cada persona.
Compromiso con la sostenibilidad: Impulsamos soluciones tecnológicas con bajas emisiones de carbono y contamos con certificaciones ISO que respaldan nuestra responsabilidad medioambiental.', 'hybrid');
INSERT INTO public.offers VALUES (73, 'Ingeniero IA Ciberseguridad', 'En InnovaTech queremos ampliar nuestro equipo e incorporar a un/a Ingeniero/a IA Ciberseguridad para formar parte de varios proyectos dentro de la compañía.
El horario será habitual de oficina con jornada intensiva los viernes y meses de verano.
Participación en proyectos que requieren la aplicación de inteligencia artificial a problemas de ciberseguridad. El desarrollador tiene experiencia en:
Trabajo con plataformas y frameworks de IA, así como uso de lenguajes de programación comunes.
Desarrollar soluciones de IA que aborden desafíos de seguridad.
Detección de anomalías.
Caracterización del comportamiento de los usuarios.
Automatización de respuestas a incidentes.
Clasificación automatizada de vulnerabilidades.
Asistencia en la toma de decisiones basada en parámetros de riesgo.
Perfil de desarrollador con posibilidades de crecimiento en la empresa.', 1, 1, 'A Coruña, España', '2025-07-24 08:59:56.627396', 'Lenguajes de programación: Python, Java, C++, entre otros.
Plataformas y frameworks de IA: TensorFlow, PyTorch, Keras, scikit-learn.
Algoritmos de aprendizaje automático: redes neuronales, algoritmos de clasificación, algoritmos de detección de anomalías, algoritmos de agrupamiento, etc.
Experiencia en proyectos de ciberseguridad: conocimiento de los principales problemas de la ciberseguridad y cómo aplicar técnicas de IA para abordarlos.
Experiencia en desarrollo de software: capacidad para diseñar, implementar y probar soluciones de software utilizando buenas prácticas de programación y metodologías ágiles.
Conocimientos de análisis de datos: habilidad para trabajar con grandes conjuntos de datos, realizar limpieza y preprocesamiento de datos, y realizar análisis exploratorio.
Conocimientos de seguridad informática: comprensión de conceptos básicos de seguridad informática, amenazas comunes y técnicas de ataque.
Dominio de PYTHON.
De 3 a 5 años de experiencia en el desarrollo de aplicaciones de IA y al menos 2 años de experiencia en proyectos relacionados con la ciberseguridad.', '', 'Estabilidad y gran equipo con el que crecer día a día, formarás parte de una empresa multicultural con más de 130 años de historia y 4.000 empleados en 22 países, de los cuales, 1.800 están en España.
Crecimiento profesional. Oportunidades reales de desarrollar tu carrera profesional apostando por la movilidad interna y tu crecimiento a través de nuestros programas de talento junior, evaluación del desempeño, liderazgo, reconocimiento interno, etc.
Formación continua: Disponemos de planes de formación donde tendrás acceso a varias plataformas e-learning e itinerarios formativos con un amplio catálogo multidisciplinar para actualizar tus conocimientos y potenciar tu crecimiento.
Colaborarás con grandes referentes tecnológicos del sector que serán tu inspiración, te ayudarán en tu día a día y en los que te reflejarás para seguir creciendo profesionalmente en tecnologías punteras.
Apostamos por la conciliación y la flexibilidad horaria para que compatibilices tu vida personal y profesional.
Podrás acogerte a retribución flexible para que puedas beneficiarte de aquello que más se ajuste a tus necesidades: ticket restaurante, guardería, transporte, seguro médico privado, renting de coche y/o formación.
Cultura de transparencia: Tendrás acceso a todas nuestras ofertas de empleo y la oportunidad de contribuir a la captación del mejor talento a través de nuestro programa de referidos.
Igualdad de Oportunidades, diversidad e inclusión en todas nuestras operaciones y acciones internas, donde se valora la capacidad, la experiencia y el desempeño de cada persona.
Compromiso con la sostenibilidad: Impulsamos soluciones tecnológicas con bajas emisiones de carbono y contamos con certificaciones ISO que respaldan nuestra responsabilidad medioambiental.', 'hybrid');
INSERT INTO public.offers VALUES (74, 'Administrador/a de Ciberseguridad', 'En InnovaTech queremos ampliar nuestro equipo e incorporar a un/a Administrador/a de Ciberseguridad para formar parte de varios proyectos dentro de la compañía. La modalidad de trabajo será hibrida en Coruña. 
El horario será habitual de oficina con jornada intensiva los viernes y meses de verano.
Participarás activamente en la ejecución de proyectos clave de Ciberseguridad, desde su diseño hasta su despliegue final.
Serás una pieza clave en la definición y evolución de la estrategia de ciberseguridad de la compañía.
Trabajarás codo a codo con el Director del departamento para establecer las prioridades, herramientas y líneas de defensa que marcarán el futuro del área.
Tendrás autonomía y responsabilidad en la toma de decisiones técnicas dentro de un entorno dinámico y con visión a largo plazo.
Impulsarás iniciativas innovadoras que mejoren la postura de ciberseguridad de nuestros clientes y de la propia organización.
Colaborarás con otros equipos para garantizar una ciberseguridad transversal y eficiente.', 1, 1, 'A Coruña, España', '2025-07-24 09:08:23.181557', 'Un/a graduado/a en Ingeniería Informática o Telemática. Valorable muy positivamente poseer alguna de las certificaciones de los siguientes fabricantes de seguridad:
Watchguard:
Network Security
Endpoint Security
Identity Security
Fortinet:
FCP – Fortigate Administrator
Microsoft:
SC-900 Security, Compliance, and Identity Fundamentals.
SC-200 Security Operations Analyst Associate
SC-300 Identity and Access Administrator Associate
AZ-500 Azure Security Engineer Associate
Conocimientos en firewalls, antivirus, IDS/IPS.
Conocimiento en la ejecución de auditorías de Ciberseguridad, pentesting, análisis de vulnerabilidades.
Conocimientos sobre gestión de SOC (alertas, informes, planes de acción).
Monitoreo y análisis de alertas con herramientas SIEM.
Familiaridad con estándares de seguridad (ISO 27001, ENS).
Conocimiento de redes y protocolos (TCP/IP, DNS, HTTP/S).
Gestión de cuentas y permisos (Active Directory, IAM).
Gestión de parches de seguridad.
Buen nivel de comunicación para redactar informes y trabajar con equipos multidisciplinares.', 'Conocimientos sobre el catálogo de servicios de Ciberseguridad de Watchguard (XDR, MDR, Authpoint, ThreatSync Suite: NDR, SaaS, Compliance Reporting).
Conocimiento en soluciones de Ciberseguridad del fabricante Fortinet (Fortigate, XDR, ZTNA, NAC, FortiMail Workspace).
Conocimiento en soluciones de seguridad del fabricante Microsoft (Entra, Defender, Sentinel, MFA).
Conocimientos de gestión de procesos y flujos de negocio.
Capacidad analítica, pensamiento crítico y enfoque resolutivo.
Experiencia en toma de requisitos y trato directo con el cliente.
Inglés nivel avanzado (sobre todo a nivel de lectura y comprensión).
Se valorará disponer de certificaciones como CISSP, CompTIA Security+, CEH.', 'Estabilidad y gran equipo con el que crecer día a día, formarás parte de una empresa multicultural con más de 130 años de historia y 4.000 empleados en 22 países, de los cuales, 1.800 están en España.
Crecimiento profesional. Oportunidades reales de desarrollar tu carrera profesional apostando por la movilidad interna y tu crecimiento a través de nuestros programas de talento junior, evaluación del desempeño, liderazgo, reconocimiento interno, etc.
Formación continua: Disponemos de planes de formación donde tendrás acceso a varias plataformas e-learning e itinerarios formativos con un amplio catálogo multidisciplinar para actualizar tus conocimientos y potenciar tu crecimiento.
Colaborarás con grandes referentes tecnológicos del sector que serán tu inspiración, te ayudarán en tu día a día y en los que te reflejarás para seguir creciendo profesionalmente en tecnologías punteras.
Apostamos por la conciliación y la flexibilidad horaria para que compatibilices tu vida personal y profesional.
Podrás acogerte a retribución flexible para que puedas beneficiarte de aquello que más se ajuste a tus necesidades: ticket restaurante, guardería, transporte, seguro médico privado, renting de coche y/o formación.
Cultura de transparencia: Tendrás acceso a todas nuestras ofertas de empleo y la oportunidad de contribuir a la captación del mejor talento a través de nuestro programa de referidos.
Igualdad de Oportunidades, diversidad e inclusión en todas nuestras operaciones y acciones internas, donde se valora la capacidad, la experiencia y el desempeño de cada persona.
Compromiso con la sostenibilidad: Impulsamos soluciones tecnológicas con bajas emisiones de carbono y contamos con certificaciones ISO que respaldan nuestra responsabilidad medioambiental.', 'hybrid');
INSERT INTO public.offers VALUES (90, 'Experto en Inteligencia Artificial', '¿En busca de un cambio laboral? Estás de suerte porque en Innovatech estamos buscando un experto en IA. ¿Tu trabajo? Crearás, entrenarás y validarás modelos de machine learning y deep learning para resolver problemas reales de negocio.', 1, 1, 'A Coruña', '2025-07-30 10:31:15.947111', '·	Experiencia: mínimo 3 años en roles como Ingeniero de Aprendizaje Automático, Cientista de Datos o similares.
·	Competencia comunicativa: habilidades en comunicación escrita y oral para documentar modelos, resultados y colaborar con equipos multidisciplinares.
·	Sólida base técnica: experiencia avanzada en Python, librerías de datos (numpy, pandas, sklearn) y frameworks de IA (TensorFlow, Keras o PyTorch).
·	Conocimiento de MLOps/LLMOps: experiencia práctica en desarrollo, integración y despliegue de modelos, incluyendo flujos de trabajo con LLMs y pipelines de inferencia en producción.
·	IA Generativa: experiencia o interés en el uso de modelos generativos (LLMs) para crear soluciones de valor en producto.
·	LangChain y frameworks de LLMs: conocimiento o experiencia con LangChain para el desarrollo de aplicaciones basadas en LLMs.
·	Testing: hábitos sólidos de testing para asegurar la calidad del código y los modelos.
·	Uso de herramientas de IA para desarrollo: familiaridad con Cursor, Copilot u otras herramientas para mejorar la productividad.
·	Sistemas y herramientas: experiencia con entornos cloud (AWS preferido), MLflow, Docker, Airflow y prácticas de ingeniería de datos/ML en producción.', '·	Metodologías ágiles: experiencia trabajando con Scrum.
·	CI/CD: integración de pipelines de despliegue para modelos ML y LLMs.
·	Monitorización de modelos: métricas, validación y mantenimiento post-despliegue.
·	Seguridad y compliance: comprensión de normativas de seguridad y privacidad de datos en proyectos de IA.
·	Optimización de costes: aplicación de FinOps en proyectos de machine learning.
·	LLMOps frameworks: familiaridad con herramientas y prácticas para despliegue y gobernanza de LLMs en producción.', '•	Vacaciones flexibles: 23 días al año, ampliables hasta 28 por antigüedad. También podrás elegir 24 o 31 de diciembre como festivo.
•	El día de tu cumpleaños no trabajas
•	Horario flexible
•	Jornada reducida en verano: julio y agosto para disfrutar más.
•	Retribución flexible: cheque restaurante, guardería, seguro de salud y ayuda al transporte.
•	Formación continua: presupuesto individual para desarrollo profesional.
•	Aprendizaje colaborativo: seminarios quincenales donde compartimos tecnologías y procedimientos.
•	Salario: acorde a experiencia y perfil (indícanos tu rango deseado en la postulación).', 'hybrid');


--
-- TOC entry 3038 (class 0 OID 332534)
-- Dependencies: 213
-- Data for Name: offers_labels; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.offers_labels VALUES (302, 44, 126);
INSERT INTO public.offers_labels VALUES (304, 46, 135);
INSERT INTO public.offers_labels VALUES (311, 53, 134);
INSERT INTO public.offers_labels VALUES (572, 90, 159);
INSERT INTO public.offers_labels VALUES (314, 56, 131);
INSERT INTO public.offers_labels VALUES (573, 90, 157);
INSERT INTO public.offers_labels VALUES (316, 58, 129);
INSERT INTO public.offers_labels VALUES (574, 90, 162);
INSERT INTO public.offers_labels VALUES (575, 90, 160);
INSERT INTO public.offers_labels VALUES (319, 61, 124);
INSERT INTO public.offers_labels VALUES (320, 62, 123);
INSERT INTO public.offers_labels VALUES (576, 90, 163);
INSERT INTO public.offers_labels VALUES (322, 64, 121);
INSERT INTO public.offers_labels VALUES (323, 65, 120);
INSERT INTO public.offers_labels VALUES (324, 66, 119);
INSERT INTO public.offers_labels VALUES (330, 43, 103);
INSERT INTO public.offers_labels VALUES (331, 43, 98);
INSERT INTO public.offers_labels VALUES (332, 43, 101);
INSERT INTO public.offers_labels VALUES (333, 43, 102);
INSERT INTO public.offers_labels VALUES (334, 43, 104);
INSERT INTO public.offers_labels VALUES (335, 44, 111);
INSERT INTO public.offers_labels VALUES (336, 44, 135);
INSERT INTO public.offers_labels VALUES (337, 44, 129);
INSERT INTO public.offers_labels VALUES (339, 44, 134);
INSERT INTO public.offers_labels VALUES (340, 45, 141);
INSERT INTO public.offers_labels VALUES (341, 45, 132);
INSERT INTO public.offers_labels VALUES (343, 45, 134);
INSERT INTO public.offers_labels VALUES (344, 45, 122);
INSERT INTO public.offers_labels VALUES (345, 46, 143);
INSERT INTO public.offers_labels VALUES (348, 46, 132);
INSERT INTO public.offers_labels VALUES (355, 48, 134);
INSERT INTO public.offers_labels VALUES (357, 48, 129);
INSERT INTO public.offers_labels VALUES (358, 48, 135);
INSERT INTO public.offers_labels VALUES (359, 48, 111);
INSERT INTO public.offers_labels VALUES (360, 49, 99);
INSERT INTO public.offers_labels VALUES (363, 49, 118);
INSERT INTO public.offers_labels VALUES (365, 50, 124);
INSERT INTO public.offers_labels VALUES (368, 50, 111);
INSERT INTO public.offers_labels VALUES (370, 51, 129);
INSERT INTO public.offers_labels VALUES (372, 51, 137);
INSERT INTO public.offers_labels VALUES (373, 51, 138);
INSERT INTO public.offers_labels VALUES (374, 51, 99);
INSERT INTO public.offers_labels VALUES (375, 52, 132);
INSERT INTO public.offers_labels VALUES (378, 52, 99);
INSERT INTO public.offers_labels VALUES (380, 53, 143);
INSERT INTO public.offers_labels VALUES (382, 53, 132);
INSERT INTO public.offers_labels VALUES (385, 54, 99);
INSERT INTO public.offers_labels VALUES (387, 54, 120);
INSERT INTO public.offers_labels VALUES (388, 54, 121);
INSERT INTO public.offers_labels VALUES (389, 54, 122);
INSERT INTO public.offers_labels VALUES (390, 55, 99);
INSERT INTO public.offers_labels VALUES (391, 55, 130);
INSERT INTO public.offers_labels VALUES (392, 55, 129);
INSERT INTO public.offers_labels VALUES (394, 55, 111);
INSERT INTO public.offers_labels VALUES (396, 56, 113);
INSERT INTO public.offers_labels VALUES (398, 56, 111);
INSERT INTO public.offers_labels VALUES (399, 56, 124);
INSERT INTO public.offers_labels VALUES (400, 57, 129);
INSERT INTO public.offers_labels VALUES (402, 57, 99);
INSERT INTO public.offers_labels VALUES (404, 57, 111);
INSERT INTO public.offers_labels VALUES (405, 58, 129);
INSERT INTO public.offers_labels VALUES (407, 58, 99);
INSERT INTO public.offers_labels VALUES (409, 58, 111);
INSERT INTO public.offers_labels VALUES (410, 59, 99);
INSERT INTO public.offers_labels VALUES (412, 59, 120);
INSERT INTO public.offers_labels VALUES (413, 59, 121);
INSERT INTO public.offers_labels VALUES (414, 59, 122);
INSERT INTO public.offers_labels VALUES (415, 60, 99);
INSERT INTO public.offers_labels VALUES (417, 60, 120);
INSERT INTO public.offers_labels VALUES (418, 60, 121);
INSERT INTO public.offers_labels VALUES (419, 60, 122);
INSERT INTO public.offers_labels VALUES (420, 61, 124);
INSERT INTO public.offers_labels VALUES (421, 61, 129);
INSERT INTO public.offers_labels VALUES (423, 61, 99);
INSERT INTO public.offers_labels VALUES (425, 62, 124);
INSERT INTO public.offers_labels VALUES (426, 62, 129);
INSERT INTO public.offers_labels VALUES (428, 62, 99);
INSERT INTO public.offers_labels VALUES (430, 63, 99);
INSERT INTO public.offers_labels VALUES (432, 63, 120);
INSERT INTO public.offers_labels VALUES (433, 63, 121);
INSERT INTO public.offers_labels VALUES (436, 64, 113);
INSERT INTO public.offers_labels VALUES (438, 64, 111);
INSERT INTO public.offers_labels VALUES (439, 64, 124);
INSERT INTO public.offers_labels VALUES (440, 65, 129);
INSERT INTO public.offers_labels VALUES (442, 65, 99);
INSERT INTO public.offers_labels VALUES (444, 65, 111);
INSERT INTO public.offers_labels VALUES (445, 66, 124);
INSERT INTO public.offers_labels VALUES (446, 66, 129);
INSERT INTO public.offers_labels VALUES (448, 66, 99);
INSERT INTO public.offers_labels VALUES (450, 42, 127);
INSERT INTO public.offers_labels VALUES (451, 42, 107);
INSERT INTO public.offers_labels VALUES (452, 42, 108);
INSERT INTO public.offers_labels VALUES (453, 42, 99);
INSERT INTO public.offers_labels VALUES (460, 68, 114);
INSERT INTO public.offers_labels VALUES (461, 68, 113);
INSERT INTO public.offers_labels VALUES (476, 72, 143);
INSERT INTO public.offers_labels VALUES (477, 72, 124);
INSERT INTO public.offers_labels VALUES (478, 72, 114);
INSERT INTO public.offers_labels VALUES (479, 72, 113);
INSERT INTO public.offers_labels VALUES (481, 73, 1);
INSERT INTO public.offers_labels VALUES (484, 73, 93);
INSERT INTO public.offers_labels VALUES (485, 73, 124);
INSERT INTO public.offers_labels VALUES (488, 74, 155);
INSERT INTO public.offers_labels VALUES (489, 74, 154);
INSERT INTO public.offers_labels VALUES (490, 74, 124);
INSERT INTO public.offers_labels VALUES (491, 74, 153);
INSERT INTO public.offers_labels VALUES (492, 74, 113);
INSERT INTO public.offers_labels VALUES (498, 69, 149);
INSERT INTO public.offers_labels VALUES (499, 69, 150);
INSERT INTO public.offers_labels VALUES (500, 69, 124);


--
-- TOC entry 3023 (class 0 OID 331639)
-- Dependencies: 198
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles VALUES (1, 'Role Admin', 'role_admin');
INSERT INTO public.roles VALUES (2, 'Role User', 'role_user');
INSERT INTO public.roles VALUES (3, 'Role Company - Empresas que publican ofertas', 'role_company');
INSERT INTO public.roles VALUES (4, 'Role Candidate - Candidatos que aplican a ofertas', 'role_candidate');


--
-- TOC entry 3036 (class 0 OID 332526)
-- Dependencies: 211
-- Data for Name: tech_labels; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tech_labels VALUES (91, 'JavaScript');
INSERT INTO public.tech_labels VALUES (92, 'C#');
INSERT INTO public.tech_labels VALUES (93, 'C++');
INSERT INTO public.tech_labels VALUES (94, 'Ruby');
INSERT INTO public.tech_labels VALUES (95, 'PHP');
INSERT INTO public.tech_labels VALUES (96, 'Swift');
INSERT INTO public.tech_labels VALUES (97, 'Kotlin');
INSERT INTO public.tech_labels VALUES (98, 'TypeScript');
INSERT INTO public.tech_labels VALUES (99, 'SQL');
INSERT INTO public.tech_labels VALUES (100, 'NoSQL');
INSERT INTO public.tech_labels VALUES (101, 'HTML');
INSERT INTO public.tech_labels VALUES (102, 'CSS');
INSERT INTO public.tech_labels VALUES (103, 'React');
INSERT INTO public.tech_labels VALUES (104, 'Angular');
INSERT INTO public.tech_labels VALUES (105, 'Vue.js');
INSERT INTO public.tech_labels VALUES (106, 'Node.js');
INSERT INTO public.tech_labels VALUES (107, 'Django');
INSERT INTO public.tech_labels VALUES (108, 'Flask');
INSERT INTO public.tech_labels VALUES (109, 'Spring');
INSERT INTO public.tech_labels VALUES (111, 'Kubernetes');
INSERT INTO public.tech_labels VALUES (113, 'Azure');
INSERT INTO public.tech_labels VALUES (114, 'Google Cloud');
INSERT INTO public.tech_labels VALUES (118, 'Big Data');
INSERT INTO public.tech_labels VALUES (119, 'DevOps');
INSERT INTO public.tech_labels VALUES (120, 'Microservices');
INSERT INTO public.tech_labels VALUES (121, 'GraphQL');
INSERT INTO public.tech_labels VALUES (122, 'REST API');
INSERT INTO public.tech_labels VALUES (123, 'Blockchain');
INSERT INTO public.tech_labels VALUES (124, 'Cybersecurity');
INSERT INTO public.tech_labels VALUES (125, 'Internet of Things');
INSERT INTO public.tech_labels VALUES (126, 'Virtual Reality');
INSERT INTO public.tech_labels VALUES (129, 'Linux');
INSERT INTO public.tech_labels VALUES (130, 'Windows Server');
INSERT INTO public.tech_labels VALUES (131, 'Git');
INSERT INTO public.tech_labels VALUES (132, 'Agile');
INSERT INTO public.tech_labels VALUES (197, 'Quantum Computing');
INSERT INTO public.tech_labels VALUES (134, 'Jenkins');
INSERT INTO public.tech_labels VALUES (135, 'Terraform');
INSERT INTO public.tech_labels VALUES (136, 'Ansible');
INSERT INTO public.tech_labels VALUES (137, 'RabbitMQ');
INSERT INTO public.tech_labels VALUES (138, 'Redis');
INSERT INTO public.tech_labels VALUES (139, 'Elasticsearch');
INSERT INTO public.tech_labels VALUES (140, 'Unity');
INSERT INTO public.tech_labels VALUES (141, 'Selenium');
INSERT INTO public.tech_labels VALUES (142, 'FullStack');
INSERT INTO public.tech_labels VALUES (127, 'Augmented Reality');
INSERT INTO public.tech_labels VALUES (1, 'Java');
INSERT INTO public.tech_labels VALUES (143, 'Jira');
INSERT INTO public.tech_labels VALUES (144, 'Front');
INSERT INTO public.tech_labels VALUES (149, 'SCADA');
INSERT INTO public.tech_labels VALUES (150, 'PLC');
INSERT INTO public.tech_labels VALUES (152, 'XDR');
INSERT INTO public.tech_labels VALUES (153, 'SIEM');
INSERT INTO public.tech_labels VALUES (154, 'DNS');
INSERT INTO public.tech_labels VALUES (155, 'TCP/IP');
INSERT INTO public.tech_labels VALUES (157, 'Machine Learning');
INSERT INTO public.tech_labels VALUES (159, 'AI');
INSERT INTO public.tech_labels VALUES (160, 'Data Science');
INSERT INTO public.tech_labels VALUES (162, 'Phyton');
INSERT INTO public.tech_labels VALUES (163, 'Cloud Service');
INSERT INTO public.tech_labels VALUES (164, 'Scrum');
INSERT INTO public.tech_labels VALUES (165, 'Cloud Computing');
INSERT INTO public.tech_labels VALUES (166, 'AWS');
INSERT INTO public.tech_labels VALUES (167, 'Testing');
INSERT INTO public.tech_labels VALUES (168, 'Docker');


--
-- TOC entry 3025 (class 0 OID 331650)
-- Dependencies: 200
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_roles VALUES (1, 1, 1);
INSERT INTO public.user_roles VALUES (2, 3, 2);
INSERT INTO public.user_roles VALUES (3, 3, 3);
INSERT INTO public.user_roles VALUES (4, 3, 4);
INSERT INTO public.user_roles VALUES (5, 3, 5);
INSERT INTO public.user_roles VALUES (6, 3, 6);
INSERT INTO public.user_roles VALUES (99, 4, 82);
INSERT INTO public.user_roles VALUES (100, 4, 83);
INSERT INTO public.user_roles VALUES (101, 4, 84);
INSERT INTO public.user_roles VALUES (102, 4, 85);
INSERT INTO public.user_roles VALUES (103, 4, 86);
INSERT INTO public.user_roles VALUES (104, 4, 87);
INSERT INTO public.user_roles VALUES (105, 4, 88);
INSERT INTO public.user_roles VALUES (107, 4, 90);
INSERT INTO public.user_roles VALUES (108, 4, 91);
INSERT INTO public.user_roles VALUES (109, 4, 92);
INSERT INTO public.user_roles VALUES (110, 4, 93);
INSERT INTO public.user_roles VALUES (111, 3, 94);
INSERT INTO public.user_roles VALUES (118, 4, 101);
INSERT INTO public.user_roles VALUES (119, 4, 102);
INSERT INTO public.user_roles VALUES (131, 4, 114);


--
-- TOC entry 3027 (class 0 OID 331658)
-- Dependencies: 202
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (2, 'cinfo', '$2a$10$itx7bblZtHNunbXtTccYR.VqYd4AJPeAk7tqXU3p4O7k8AfJ7TXRC', 2, NULL);
INSERT INTO public.users VALUES (3, 'luckia', '$2a$10$ybThYFyZkyQKVfJpJbN89eZeTm/cpOTPCzolodaTVoG9Fd0lpaqVG', 3, NULL);
INSERT INTO public.users VALUES (4, 'aldaba', '$2a$10$m.1Qst8/3THueCOyZ4E2aOGctZu/dg35NqYnhVrsRwgSeuf45zVQa', 4, NULL);
INSERT INTO public.users VALUES (5, 'texas', '$2a$10$tGxkKjpdQxBxi.BG..ke9OcQcRfPGNHcNhmHHhJ6VXwvjF0TLNCfq', 5, NULL);
INSERT INTO public.users VALUES (6, 'plexus', '$2a$10$Z4hiIKWVViPkm0Y3AZLGIOWOzsUVks0tEE1n2yjCc9b6lqoEPht1K', 6, NULL);
INSERT INTO public.users VALUES (82, 'ana', '$2a$10$TbF7evxxaEE0Oi9mvj3D.eoMxoSIMDpelk50muwo4/xzPYJaByF9i', NULL, 87);
INSERT INTO public.users VALUES (83, 'martin', '$2a$10$Ku7M084ErrmV8eIpSaQWk.Svj7cyy8xN4ozvSkJ4jtiyGGpc3qVxe', NULL, 88);
INSERT INTO public.users VALUES (84, 'leo', '$2a$10$CzrT0.qkBcICjiytk8YZpObhdUz2Bd26MmDBWpIofLUGNPSIG0C1W', NULL, 89);
INSERT INTO public.users VALUES (85, 'filippo', '$2a$10$ktjEhY9vgRf1FUUWku.5kOfO1LEEEDf9oJ9f445dj5dygHUF4YsGS', NULL, 90);
INSERT INTO public.users VALUES (86, 'silvia', '$2a$10$J0W0j/QL0H7xf1ujnSVVA.q3Fk6LdoSrbg840AjOPFzvrqFXPHpBu', NULL, 91);
INSERT INTO public.users VALUES (87, 'javi', '$2a$10$rTd83B0L.JmgB9aLl8vzIOQnPKJTX7S7zD3CugCiaVSji0BM0aQ/y', NULL, 92);
INSERT INTO public.users VALUES (88, 'alex', '$2a$10$Ej.LC9Yl.q9L1gr7u5FzweF7B4utITgCpq1WuD7su9qh9cv5/qhK6', NULL, 93);
INSERT INTO public.users VALUES (90, 'angel', '$2a$10$FnirhLMlIK.UGAvJ9CClnexfI466/Py2DjJFHUVXPiZSAULG.vLM2', NULL, 95);
INSERT INTO public.users VALUES (91, 'nuria', '$2a$10$bdpgx7s9LHpkj3QIx9Z81elEPnlSqe3a0EwiCVtWq.86khYSeQKZG', NULL, 96);
INSERT INTO public.users VALUES (92, 'enmanuel', '$2a$10$TMZfWXvlaT32mQXKFaC0QOlyynaAbWAcLzUFugBtgC1HE886ckmq.', NULL, 97);
INSERT INTO public.users VALUES (93, 'ian', '$2a$10$VcA5YY4.EIEtvOe5SzJ5busF/t/fFOUG5pYOPRer4w44lYzdAhIV6', NULL, 98);
INSERT INTO public.users VALUES (94, 'innovatech', '$2a$10$DOX84BCzl3wdTcDG5FoAFeOqHe0qW59f01MsaIsNNAgZ4la3oKDVu', 1, NULL);
INSERT INTO public.users VALUES (1, 'admin', '$2a$10$b2gsSpwAgBCweuf6xbxqkuZs6mCZQ9WmNLY3rWPVAa9pPeju7TT8S', NULL, NULL);
INSERT INTO public.users VALUES (101, 'nando', '$2a$10$beRFo.GchJCQp9VON3BYiOHVuJJG5s2t2jZZk6QRW/9y5jWjvxEJq', NULL, 105);
INSERT INTO public.users VALUES (102, 'alejandro', '$2a$10$mUf3ie6ruppzzOtoo0yyV..ZY2JKdF06ZrqnJo59uLW/.xetSgky.', NULL, 106);
INSERT INTO public.users VALUES (114, 'jorge', '$2a$10$.m3m/qjyPtPADSMPkoyxFusquIDbK6yCRbbfIdgDNoUyzi0paZxFG', NULL, 118);


--
-- TOC entry 3059 (class 0 OID 0)
-- Dependencies: 208
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.applications_id_seq', 275, true);


--
-- TOC entry 3060 (class 0 OID 0)
-- Dependencies: 206
-- Name: candidate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.candidate_id_seq', 118, true);


--
-- TOC entry 3061 (class 0 OID 0)
-- Dependencies: 214
-- Name: candidate_tech_labels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.candidate_tech_labels_id_seq', 652, true);


--
-- TOC entry 3062 (class 0 OID 0)
-- Dependencies: 204
-- Name: company_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_id_seq', 16, true);


--
-- TOC entry 3063 (class 0 OID 0)
-- Dependencies: 205
-- Name: offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offers_id_seq', 90, true);


--
-- TOC entry 3064 (class 0 OID 0)
-- Dependencies: 212
-- Name: offers_labels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offers_labels_id_seq', 576, true);


--
-- TOC entry 3065 (class 0 OID 0)
-- Dependencies: 197
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, false);


--
-- TOC entry 3066 (class 0 OID 0)
-- Dependencies: 210
-- Name: tech_labels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tech_labels_id_seq', 197, true);


--
-- TOC entry 3067 (class 0 OID 0)
-- Dependencies: 199
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 131, true);


--
-- TOC entry 3068 (class 0 OID 0)
-- Dependencies: 201
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 114, true);


--
-- TOC entry 2877 (class 2606 OID 332175)
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- TOC entry 2874 (class 2606 OID 332155)
-- Name: candidate candidate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT candidate_pkey PRIMARY KEY (id);


--
-- TOC entry 2885 (class 2606 OID 333018)
-- Name: candidate_tech_labels candidate_tech_labels_id_candidate_id_tech_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate_tech_labels
    ADD CONSTRAINT candidate_tech_labels_id_candidate_id_tech_label_key UNIQUE (id_candidate, id_tech_label);


--
-- TOC entry 2887 (class 2606 OID 333016)
-- Name: candidate_tech_labels candidate_tech_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate_tech_labels
    ADD CONSTRAINT candidate_tech_labels_pkey PRIMARY KEY (id);


--
-- TOC entry 2856 (class 2606 OID 331954)
-- Name: company company_cif_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_cif_key UNIQUE (cif);


--
-- TOC entry 2858 (class 2606 OID 331308)
-- Name: company company_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_email_key UNIQUE (email);


--
-- TOC entry 2860 (class 2606 OID 331958)
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- TOC entry 2883 (class 2606 OID 332539)
-- Name: offers_labels offers_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers_labels
    ADD CONSTRAINT offers_labels_pkey PRIMARY KEY (id);


--
-- TOC entry 2872 (class 2606 OID 331925)
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- TOC entry 2862 (class 2606 OID 331647)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 2879 (class 2606 OID 332531)
-- Name: tech_labels tech_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tech_labels
    ADD CONSTRAINT tech_labels_pkey PRIMARY KEY (id);


--
-- TOC entry 2864 (class 2606 OID 331668)
-- Name: roles uk_716hgxp60ym1lifrdgp67xt5k; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uk_716hgxp60ym1lifrdgp67xt5k UNIQUE (role_name);


--
-- TOC entry 2868 (class 2606 OID 332166)
-- Name: users unique_login; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_login UNIQUE (login);


--
-- TOC entry 2881 (class 2606 OID 332551)
-- Name: tech_labels unique_tech_label_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tech_labels
    ADD CONSTRAINT unique_tech_label_name UNIQUE (name);


--
-- TOC entry 2866 (class 2606 OID 331655)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 2870 (class 2606 OID 331666)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 2875 (class 1259 OID 333032)
-- Name: idx_candidate_profile_photo_filename; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_candidate_profile_photo_filename ON public.candidate USING btree (profile_photo_filename);


--
-- TOC entry 2888 (class 1259 OID 333029)
-- Name: idx_candidate_tech_labels_candidate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_candidate_tech_labels_candidate ON public.candidate_tech_labels USING btree (id_candidate);


--
-- TOC entry 2894 (class 2606 OID 332176)
-- Name: applications applications_id_candidate_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_id_candidate_fkey FOREIGN KEY (id_candidate) REFERENCES public.candidate(id);


--
-- TOC entry 2895 (class 2606 OID 332181)
-- Name: applications applications_id_offer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_id_offer_fkey FOREIGN KEY (id_offer) REFERENCES public.offers(id);


--
-- TOC entry 2898 (class 2606 OID 333019)
-- Name: candidate_tech_labels fk_candidate_tech_label_candidate; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate_tech_labels
    ADD CONSTRAINT fk_candidate_tech_label_candidate FOREIGN KEY (id_candidate) REFERENCES public.candidate(id) ON DELETE CASCADE;


--
-- TOC entry 2899 (class 2606 OID 333024)
-- Name: candidate_tech_labels fk_candidate_tech_label_techlabel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate_tech_labels
    ADD CONSTRAINT fk_candidate_tech_label_techlabel FOREIGN KEY (id_tech_label) REFERENCES public.tech_labels(id) ON DELETE CASCADE;


--
-- TOC entry 2891 (class 2606 OID 332513)
-- Name: users fk_candidates; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_candidates FOREIGN KEY (id_candidate) REFERENCES public.candidate(id) ON DELETE CASCADE;


--
-- TOC entry 2893 (class 2606 OID 331959)
-- Name: offers fk_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT fk_users FOREIGN KEY (id_company) REFERENCES public.company(id);


--
-- TOC entry 2892 (class 2606 OID 331964)
-- Name: users fk_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users FOREIGN KEY (id_company) REFERENCES public.company(id);


--
-- TOC entry 2889 (class 2606 OID 331669)
-- Name: user_roles fkh8ciramu9cc9q3qcqiv4ue8a6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fkh8ciramu9cc9q3qcqiv4ue8a6 FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 2896 (class 2606 OID 332545)
-- Name: offers_labels offers_labels_id_label_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers_labels
    ADD CONSTRAINT offers_labels_id_label_fkey FOREIGN KEY (id_label) REFERENCES public.tech_labels(id) ON DELETE CASCADE;


--
-- TOC entry 2897 (class 2606 OID 332540)
-- Name: offers_labels offers_labels_id_offer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers_labels
    ADD CONSTRAINT offers_labels_id_offer_fkey FOREIGN KEY (id_offer) REFERENCES public.offers(id) ON DELETE CASCADE;


--
-- TOC entry 2890 (class 2606 OID 333243)
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-07-30 14:16:46

--
-- PostgreSQL database dump complete
--

