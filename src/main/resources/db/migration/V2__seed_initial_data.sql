INSERT INTO roles (nombre)
VALUES
    ('ADMIN'),
    ('USER')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO estados_reserva (nombre)
VALUES
    ('PENDIENTE'),
    ('CONFIRMADA'),
    ('CANCELADA'),
    ('FINALIZADA')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipos_espacio (nombre, descripcion)
VALUES
    ('Escritorio', 'Espacio individual de trabajo'),
    ('Oficina Privada', 'Espacio cerrado para equipos pequenos'),
    ('Sala de Reuniones', 'Sala equipada para reuniones'),
    ('Sala de Eventos', 'Espacio para eventos y conferencias')
ON CONFLICT (nombre) DO NOTHING;
