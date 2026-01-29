export const STATUS_OPTIONS = ["ACTIVA", "PAUSADA", "CERRADA"];

export const validateObraForm = (form) => {
  const errors = {};

  if (!form.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio";
  }

  if (!/^[A-Z0-9]{3}$/.test(form.clave)) {
    errors.clave = "Debe tener 3 caracteres alfanuméricos";
  }

  return errors;
};

export const buildObraPayload = (form) => {
  const payload = {
    nombre: form.nombre.trim(),
    clave: form.clave.trim(),
    cliente_nombre: form.cliente_nombre.trim(),
    status: form.status,
    fecha_inicio: form.fecha_inicio || undefined,
    direccion_estado: form.direccion_estado.trim(),
    direccion_ciudad: form.direccion_ciudad.trim(),
    direccion_colonia: form.direccion_colonia.trim(),
    direccion_calle: form.direccion_calle.trim(),
    direccion_numero: form.direccion_numero.trim(),
    direccion_cp: form.direccion_cp.trim(),
    portada_url: form.portada_url.trim(),
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === "" || payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};
