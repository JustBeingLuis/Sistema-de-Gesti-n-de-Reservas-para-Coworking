USE sys;

INSERT INTO roles (id, nombre) VALUES
(1, 'ADMIN'),
(2, 'USER');

INSERT INTO estados_reserva (id, nombre) VALUES
(1, 'PENDIENTE'),
(2, 'CONFIRMADA'),
(3, 'CANCELADA'),
(4, 'FINALIZADA');

INSERT INTO tipos_espacio (id, nombre, descripcion) VALUES
(1, 'Escritorio', 'Espacio individual de trabajo'),
(2, 'Oficina Privada', 'Oficina cerrada para equipos pequeños'),
(3, 'Sala de Reuniones', 'Sala equipada para reuniones'),
(4, 'Sala de Eventos', 'Espacio para eventos y conferencias');

INSERT INTO espacios (id, nombre, capacidad, precio_por_hora, activo, tipo_id) VALUES
(1,'Desk A1',1,5.00,true,1),
(2,'Desk A2',1,5.00,true,1),
(3,'Desk B1',1,5.00,true,1),
(4,'Oficina 101',4,20.00,true,2),
(5,'Oficina 102',6,25.00,true,2),
(6,'Meeting Room Alpha',8,30.00,true,3),
(7,'Meeting Room Beta',10,35.00,true,3),
(8,'Sala Creativa',12,40.00,true,3),
(9,'Auditorio',50,80.00,true,4),
(10,'Sala Workshop',20,50.00,true,4);

INSERT INTO usuarios (id, nombre, correo, password, activo, rol_id) VALUES
(1,'Luis Toscano','luis@correo.com','pass123',true,1),
(2,'Ana Martínez','ana@correo.com','pass123',true,2),
(3,'Carlos Pérez','carlos@correo.com','pass123',true,2),
(4,'María Gómez','maria@correo.com','pass123',true,2),
(5,'Andrés López','andres@correo.com','pass123',true,2),
(6,'Laura Rodríguez','laura@correo.com','pass123',true,2),
(7,'Pedro Sánchez','pedro@correo.com','pass123',true,2),
(8,'Sofía Herrera','sofia@correo.com','pass123',true,2),
(9,'Daniel Ruiz','daniel@correo.com','pass123',true,2),
(10,'Valentina Castro','valentina@correo.com','pass123',true,2),
(11,'Jorge Ramírez','jorge@correo.com','pass123',true,2),
(12,'Camila Torres','camila@correo.com','pass123',true,2),
(13,'David Morales','david@correo.com','pass123',true,2),
(14,'Paula Jiménez','paula@correo.com','pass123',true,2),
(15,'Miguel Vargas','miguel@correo.com','pass123',true,2),
(16,'Natalia Silva','natalia@correo.com','pass123',true,2),
(17,'Fernando Ríos','fernando@correo.com','pass123',true,2),
(18,'Gabriela Cruz','gabriela@correo.com','pass123',true,2),
(19,'Ricardo Vega','ricardo@correo.com','pass123',true,2),
(20,'Juliana Mendoza','juliana@correo.com','pass123',true,2);

INSERT INTO reservas (usuario_id, espacio_id, fecha, hora_inicio, hora_fin, estado_id) VALUES
(2,1,'2026-04-01','08:00','10:00',2),
(3,2,'2026-04-01','10:00','12:00',2),
(4,3,'2026-04-01','09:00','11:00',2),
(5,4,'2026-04-01','13:00','15:00',2),
(6,5,'2026-04-01','15:00','17:00',2),
(7,6,'2026-04-02','09:00','11:00',2),
(8,7,'2026-04-02','10:00','12:00',2),
(9,8,'2026-04-02','13:00','15:00',2),
(10,9,'2026-04-02','15:00','18:00',2),
(11,10,'2026-04-02','09:00','11:00',2),

(12,1,'2026-04-03','08:00','10:00',2),
(13,2,'2026-04-03','10:00','12:00',2),
(14,3,'2026-04-03','09:00','11:00',2),
(15,4,'2026-04-03','13:00','15:00',2),
(16,5,'2026-04-03','15:00','17:00',2),
(17,6,'2026-04-04','09:00','11:00',2),
(18,7,'2026-04-04','10:00','12:00',2),
(19,8,'2026-04-04','13:00','15:00',2),
(20,9,'2026-04-04','15:00','18:00',2),
(2,10,'2026-04-04','09:00','11:00',2),

(3,1,'2026-04-05','08:00','10:00',2),
(4,2,'2026-04-05','10:00','12:00',2),
(5,3,'2026-04-05','09:00','11:00',2),
(6,4,'2026-04-05','13:00','15:00',2),
(7,5,'2026-04-05','15:00','17:00',2),
(8,6,'2026-04-06','09:00','11:00',2),
(9,7,'2026-04-06','10:00','12:00',2),
(10,8,'2026-04-06','13:00','15:00',2),
(11,9,'2026-04-06','15:00','18:00',2),
(12,10,'2026-04-06','09:00','11:00',2),

(13,1,'2026-04-07','08:00','10:00',1),
(14,2,'2026-04-07','10:00','12:00',1),
(15,3,'2026-04-07','09:00','11:00',1),
(16,4,'2026-04-07','13:00','15:00',1),
(17,5,'2026-04-07','15:00','17:00',1),
(18,6,'2026-04-08','09:00','11:00',1),
(19,7,'2026-04-08','10:00','12:00',1),
(20,8,'2026-04-08','13:00','15:00',1),
(2,9,'2026-04-08','15:00','18:00',1),
(3,10,'2026-04-08','09:00','11:00',1),

(4,1,'2026-04-09','08:00','10:00',3),
(5,2,'2026-04-09','10:00','12:00',3),
(6,3,'2026-04-09','09:00','11:00',3),
(7,4,'2026-04-09','13:00','15:00',3),
(8,5,'2026-04-09','15:00','17:00',3),
(9,6,'2026-04-10','09:00','11:00',4),
(10,7,'2026-04-10','10:00','12:00',4),
(11,8,'2026-04-10','13:00','15:00',4),
(12,9,'2026-04-10','15:00','18:00',4),
(13,10,'2026-04-10','09:00','11:00',4);