-- 1. TABLA ROLES
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

-- 2. TABLA USUARIOS
CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol_id BIGINT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- 3. TABLA TIPOS DE ESPACIO
CREATE TABLE tipos_espacio (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 4. TABLA ESPACIOS
CREATE TABLE espacios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo_id BIGINT,
    capacidad INT NOT NULL,
    precio_por_hora DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (tipo_id) REFERENCES tipos_espacio(id)
);

-- 5. TABLA ESTADOS DE RESERVA
CREATE TABLE estados_reserva (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(30) UNIQUE
);

-- 6. TABLA RESERVAS
CREATE TABLE reservas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    espacio_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado_id BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (espacio_id) REFERENCES espacios(id),
    FOREIGN KEY (estado_id) REFERENCES estados_reserva(id),

    CHECK (hora_inicio < hora_fin)
);