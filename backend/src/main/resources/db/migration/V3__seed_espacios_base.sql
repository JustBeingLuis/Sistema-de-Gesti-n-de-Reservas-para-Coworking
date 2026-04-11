INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Desk A1', 1, 5.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Escritorio'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Desk A1'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Desk A2', 1, 5.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Escritorio'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Desk A2'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Desk B1', 1, 5.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Escritorio'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Desk B1'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Oficina 101', 4, 20.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Oficina Privada'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Oficina 101'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Oficina 102', 6, 25.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Oficina Privada'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Oficina 102'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Meeting Room Alpha', 8, 30.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Sala de Reuniones'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Meeting Room Alpha'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Meeting Room Beta', 10, 35.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Sala de Reuniones'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Meeting Room Beta'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Sala Creativa', 12, 40.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Sala de Reuniones'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Sala Creativa'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Auditorio', 50, 80.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Sala de Eventos'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Auditorio'
);

INSERT INTO espacios (nombre, capacidad, precio_por_hora, activo, tipo_id)
SELECT 'Sala Workshop', 20, 50.00, TRUE, te.id
FROM tipos_espacio te
WHERE te.nombre = 'Sala de Eventos'
  AND NOT EXISTS (
    SELECT 1
    FROM espacios e
    WHERE e.nombre = 'Sala Workshop'
);
