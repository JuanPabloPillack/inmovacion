USE database_gbs_yasociados;


-- ===========================
-- TABLA Clientes
-- ===========================
CREATE TABLE IF NOT EXISTS Clientes (
    Id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    Apellido VARCHAR(100) NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Documento INT NOT NULL,
    Correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    Telefono INT NOT NULL,
    Descripcion VARCHAR(200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Tipo de cliente
-- ===========================
CREATE TABLE IF NOT EXISTS Tipo_cliente (
    Id_Tipo_cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Rol del usuario
-- ===========================
CREATE TABLE IF NOT EXISTS Rol (
    Id_rol INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Medios de pago
-- ===========================
CREATE TABLE IF NOT EXISTS Medios_de_pago (
    Id_medio_de_pago INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Provincia
-- ===========================
CREATE TABLE IF NOT EXISTS Provincia(
    Id_provincia INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Tipo de inmueble
-- ===========================
CREATE TABLE IF NOT EXISTS Tipo_inmueble(
    Id_tipo_inmueble INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Estado
-- ===========================
CREATE TABLE IF NOT EXISTS Estado(
    Id_estado INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Estado de rendición
-- ===========================
CREATE TABLE IF NOT EXISTS Estado_rendicion(
    Id_estado_rendicion INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Proveedor
-- ===========================
CREATE TABLE IF NOT EXISTS Proveedor (
    Id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    Razon_social VARCHAR(100) NOT NULL,
    Correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    Telefono INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Intermedia entre cliente y tipo de cliente
-- ===========================
CREATE TABLE IF NOT EXISTS Cliente_Tipo_cliente (
    Id_cliente INT NOT NULL,
    Id_Tipo_cliente INT NOT NULL,
    PRIMARY KEY (Id_cliente, Id_Tipo_cliente),
    FOREIGN KEY (Id_cliente) REFERENCES Clientes(Id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Tipo_cliente) REFERENCES Tipo_cliente(Id_Tipo_cliente) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Usuario
-- ===========================
CREATE TABLE IF NOT EXISTS Usuario (
    Id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    Id_rol INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    Telefono INT,
    Contrasena VARCHAR(255) NOT NULL,
    Fecha_registro DATE NOT NULL,
    FOREIGN KEY (Id_rol) REFERENCES Rol(Id_rol) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Localidad
-- ===========================
CREATE TABLE IF NOT EXISTS Localidad(
    Id_localidad INT AUTO_INCREMENT PRIMARY KEY,
    Id_provincia INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (Id_provincia) REFERENCES Provincia(Id_provincia) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Barrio
-- ===========================
CREATE TABLE IF NOT EXISTS Barrio(
    Id_barrio INT AUTO_INCREMENT PRIMARY KEY,
    Id_localidad INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (Id_localidad) REFERENCES Localidad(Id_localidad) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Ubicación
-- ===========================
CREATE TABLE IF NOT EXISTS Ubicacion(
    Id_ubicacion INT AUTO_INCREMENT PRIMARY KEY,
    Id_barrio INT NOT NULL,
    Nombre_calle VARCHAR(100) NOT NULL,
    Numero INT NOT NULL,
    FOREIGN KEY (Id_barrio) REFERENCES Barrio(Id_barrio) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Inmuebles
-- ===========================
CREATE TABLE IF NOT EXISTS Inmuebles (
    Id_inmueble INT AUTO_INCREMENT PRIMARY KEY,
    Id_tipo_inmueble INT NOT NULL,
    Id_ubicacion INT NOT NULL,
    Id_estado INT NOT NULL,
    Id_cliente INT NOT NULL,
    Superficie_total DECIMAL(10,2) NOT NULL,
    Superficie_cubierta DECIMAL(10,2),
    Cantidad_ambientes INT,
    Antiguedad INT,
    Precio DECIMAL(10,2) NOT NULL,
    Foto VARCHAR(200) NOT NULL,
    Detalles VARCHAR(255),
    FOREIGN KEY (Id_tipo_inmueble) REFERENCES Tipo_inmueble(Id_tipo_inmueble) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_ubicacion) REFERENCES Ubicacion(Id_ubicacion) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_estado) REFERENCES Estado(Id_estado) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_cliente) REFERENCES Clientes(Id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Contratos
-- ===========================
CREATE TABLE IF NOT EXISTS Contratos(
    Id_contrato INT AUTO_INCREMENT PRIMARY KEY,
    Id_cliente INT NOT NULL,
    Id_inmueble INT NOT NULL,
    Archivo VARCHAR(200) NOT NULL,
    FOREIGN KEY (Id_cliente) REFERENCES Clientes(Id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_inmueble) REFERENCES Inmuebles(Id_inmueble) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Cobranzas
-- ===========================
CREATE TABLE IF NOT EXISTS Cobranzas(
    Id_cobranza INT AUTO_INCREMENT PRIMARY KEY,
    Id_cliente INT NOT NULL,
    Id_inmueble INT NOT NULL,
    Id_medio_de_pago INT NOT NULL,
    Fecha DATE NOT NULL,
    Descripcion VARCHAR(200) NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Id_cliente) REFERENCES Clientes(Id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_inmueble) REFERENCES Inmuebles(Id_inmueble) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_medio_de_pago) REFERENCES Medios_de_pago(Id_medio_de_pago) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Rendición
-- ===========================
CREATE TABLE IF NOT EXISTS Rendicion(
    Id_rendicion INT AUTO_INCREMENT PRIMARY KEY,
    Id_cliente INT NOT NULL,
    Id_inmueble INT NOT NULL,
    Id_estado_rendicion INT NOT NULL,
    Fecha_inicio DATE NOT NULL,
    Fecha_final DATE NOT NULL,
    Fecha_generacion DATE NOT NULL,
    Monto_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Id_cliente) REFERENCES Clientes(Id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_inmueble) REFERENCES Inmuebles(Id_inmueble) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_estado_rendicion) REFERENCES Estado_rendicion(Id_estado_rendicion) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- TABLA Pagos
-- ===========================
CREATE TABLE IF NOT EXISTS Pagos(
    Id_pago INT AUTO_INCREMENT PRIMARY KEY,
    Id_proveedor INT NOT NULL,
    Id_medio_de_pago INT NOT NULL,
    Id_inmueble INT NOT NULL,
    Fecha DATE NOT NULL,
    Descripcion VARCHAR(200) NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Id_proveedor) REFERENCES Proveedor(Id_proveedor) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_medio_de_pago) REFERENCES Medios_de_pago(Id_medio_de_pago) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_inmueble) REFERENCES Inmuebles(Id_inmueble) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- HISTORIALES
-- ===========================
CREATE TABLE IF NOT EXISTS Historial_cliente (
    Id_historial_cliente INT AUTO_INCREMENT PRIMARY KEY,
    Id_usuario INT NOT NULL,
    Id_cliente INT NOT NULL,
    Fecha_hora DATETIME NOT NULL,
    Campo_modificado VARCHAR(255) NOT NULL,
    Valor_antiguo VARCHAR(255) NOT NULL,
    Valor_nuevo VARCHAR(255) NOT NULL,
    FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_cliente) REFERENCES Clientes(Id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Historial_cobranza(
    Id_historial_cobranza INT AUTO_INCREMENT PRIMARY KEY,
    Id_usuario INT NOT NULL,
    Id_cobranza INT NOT NULL,
    Fecha_hora DATETIME NOT NULL,
    Campo_modificado VARCHAR(255) NOT NULL,
    Valor_antiguo VARCHAR(255) NOT NULL,
    Valor_nuevo VARCHAR(255) NOT NULL,
    FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_cobranza) REFERENCES Cobranzas(Id_cobranza) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Historial_inmueble(
    Id_historial_inmueble INT AUTO_INCREMENT PRIMARY KEY,
    Id_inmueble INT NOT NULL,
    Id_usuario INT NOT NULL,
    Fecha_hora DATETIME NOT NULL,
    Campo_modificado VARCHAR(255) NOT NULL,
    Valor_antiguo VARCHAR(255) NOT NULL,
    Valor_nuevo VARCHAR(255) NOT NULL,
    FOREIGN KEY (Id_inmueble) REFERENCES Inmuebles(Id_inmueble) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Historial_rendicion(
    Id_historial_rendicion INT AUTO_INCREMENT PRIMARY KEY,
    Id_rendicion INT NOT NULL,
    Id_usuario INT NOT NULL,
    Fecha_hora DATETIME NOT NULL,
    Campo_modificado VARCHAR(255) NOT NULL,
    Valor_antiguo VARCHAR(255) NOT NULL,
    Valor_nuevo VARCHAR(255) NOT NULL,
    FOREIGN KEY (Id_rendicion) REFERENCES Rendicion(Id_rendicion) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Historial_pago(
    Id_historial_pago INT AUTO_INCREMENT PRIMARY KEY,
    Id_usuario INT NOT NULL,
    Id_pago INT NOT NULL,
    Fecha_hora DATETIME NOT NULL,
    Campo_modificado VARCHAR(255) NOT NULL,
    Valor_antiguo VARCHAR(255) NOT NULL,
    Valor_nuevo VARCHAR(255) NOT NULL,
    FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Id_pago) REFERENCES Pagos(Id_pago) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
