USE obrapp;

INSERT INTO obras (
  nombre,
  clave,
  direccion,
  ubicacion,
  cliente,
  responsable,
  fecha_inicio,
  honorarios_porcentaje,
  estado
) VALUES (
  'Casa Angélica',
  'ANG',
  'Av. Reforma 123, CDMX',
  'CDMX, México',
  'Familia López',
  'Ariel Morales',
  '2025-01-01',
  12.5,
  'activa'
);

INSERT INTO cuentas (obra_id, nombre) VALUES
  (1, 'Caja chica');

INSERT INTO gastos (
  obra_id,
  cuenta_id,
  tipo,
  partida,
  concepto,
  proveedor,
  referencia_comprobante,
  comprobante_path,
  monto,
  iva,
  estatus_pago,
  fecha
) VALUES
  (
    1,
    1,
    'MAT',
    'Cimentación',
    'Compra de varilla',
    'Aceros del Centro',
    'VAR-001',
    NULL,
    18500.00,
    1,
    'P',
    '2025-01-02'
  ),
  (
    1,
    NULL,
    'M.O.',
    'Albañilería y muros',
    'Pago de cuadrilla',
    'Cuadrilla López',
    'MO-003',
    NULL,
    9200.00,
    0,
    'PP',
    '2025-01-04'
  );

INSERT INTO pagos (obra_id, gasto_id, cuenta_id, monto, fecha) VALUES
  (1, 1, 1, 18500.00, '2025-01-03');
