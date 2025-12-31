ObrAPP es una aplicacion web (PWA) para gestionar obras de construccion por administracion, sus principales objetivos son:

/ Control de gastos
/ Control de cuentas (internas)
/ Visibilidad de saldos
/ Trazabilidad de movimientos

Flujos principales como usuario ADMIN:

 /Alta obra:
1. abrir aplicacion
2. hacer login como admin
3. click en boton "+"
3. Seleccionar "Alta de Obra"
4. Llenar campos minimos:
        Nombre del proyecto
        Clave: (3 caracteres alfanumericos)
        Dirección: 
        Ubicación: seleccionar del mapa 
        Cliente(s):
        Responsable de obra: 
        Fecha de inciio
        Porcentaje de honorarios (ej. 10 - 20%)
        Estado: activa / archivada
5. click en "Crear obra"
6. Pantalla de obras

 /Ver listado de pagos 
1. Desde la pantalla principal
2. Seleccionar obra
3. ver listaddo de gastos de la semana en curso y los gastos no pagados
    Tipo
    Concepto
    Proveedor
    Referencia del comprobante
    Importe
    "PP"/"P"  "PP" viene de por pagar, debe de aparecer en letras rojas, "P" viene de pagado, debe de aparecer con letras verdes
4. Click en algun gasto "PP"
5. Se muestran todos los campos del gasto
6. Click en boton pagar
7. Seleccionar cuenta
8. Click en registar pago 
9. El pago se deve de reflejar en el listado

 /Generar estimación
*La estimación es un documento PDF que refleja el estado financiero de la obra al corte de la semana en curso. (Por defecto: lunes - domingo) Responde a
        Datos de Obra:
                Nombre  
                Dirección
                Cliente
        Datos de estimación 
                Fecha
                No. de estimación (Asignación automatizada)
                Semana del año
        Estado de cuenta semana anterior:
                Pago semana anterior (= suma de pagos realizados en la semana previa)
                Saldo semana anterior (= (Gastos acumulados hasta el final de la semana previa + Honorarios acumulados hasta el final de la semana previa) - Pagos acumulados hasta el final de la semana previa)
                Saldo al iniciar la semana  (= Saldo semana anterior)
        Gastos de la semana en curso
                Tabla de gastos mostrando:
                        Fecha
                        Concepto
                        Proveedor
                        Referencia del comprobante
                        Subtotal
                                Si IVA = Sí → Subtotal = Importe / 1.16
                                Si IVA = No → Subtotal = Importe
                        Total (Importe)
                Suma del importe de gastos
                Cálculo de honorarios (Automatizado)
                        Base para honorarios (Suma del importe de gastos de la semana en curso)
                Honorarios ( % / Importe)
                Total de gastos Semana en curso (incluyendo hon)
        Estado de cuenta semana en curso
                Saldo al iniciar la semana
                Total de gastos semana en curso
                Pagos semana en curso
                Saldo al final de la semana en curso (Saldo al final de la semana en curso = Saldo al iniciar la semana - Total de gastos semana en curso (incluyendo honorarios) + Pagos semana en curso)
                Total a pagar
*Nota de corte semanal: Aunque la estimación se genere y envíe al cliente jueves o viernes, para efectos del sistema el corte de cada estimación se considera al final de la semana (por ejemplo, domingo). Los pagos que el cliente realice después de recibir la estimación, pero dentro de esa misma semana, se contabilizan en “Pago semana anterior” de la siguiente estimación
*Ejemplo de formato anexo en carpeta /docs/estimacion muestra.pdf
*Pantalla A:
        ┌──────────────────────────────────────────────┐
        │ Estimaciones — Obra: Casa Angélica           │
        │                                              │
        │ [+ Generar estimación]                        │
        │                                              │
        │ Semana        Periodo        Total   Status  │
        │ 2025-W01      30 Dic–5 Ene   $45,200  Cerrada │
        │ 2024-W52      23–29 Dic      $18,900  Cerrada │
        │                                              │
        └──────────────────────────────────────────────┘

*Modal
        Generar estimación semanal

        Periodo:
        [ Lunes 30 Dic 2025 ]  →  [ Domingo 5 Ene 2026 ]

        Resumen previo:
        - Gastos totales:        $45,200
        - Pagados:              $32,000
        - Por pagar:            $13,200
        - Cuentas afectadas:    2

        ⚠️ Esta acción generará un corte financiero.

        [ Cancelar ]    [ Generar estimación ]

*Pantalla B

        Estimación semanal
        Periodo: 30 Dic 2025 – 5 Ene 2026
        Generada el: 5 Ene 2026 · por Ariel

        [ Descargar PDF ]   [ Volver ]
        

Flujos principales como usuario RESIDENTE:

 / Registrar gasto:
1. abrir aplicacion
2. hacer login como residente
3. seleccionar obra de la BD
3. click en registar gasto
4. Llenar campos minimos:
        Fecha: seleccionar fecha
        Tipo: seleccionar entre: M.O. (Mano de obra), MAT (materiales), CON (contratista) y IND (Indirectos)
        Partida: seleccionar entre: Preliminares, Cimentación, Albañilería y muros, Estructuras y Losas, Instalaciones, Aplanados, Recubrimientos, Pintura y Acabados, Cancelería, Herrería, Carpintería e Indirectos
        Concepto: texto corto que describa el gasto
        Proveedor: texto con funcion de autocompletado
        Comprobante: PDF o JPG 
        Referencia del comprobante: no mas de 10 caracteres alfanumericos
        Importe: MXN pagados
        IVA: Sí/No
        Pago: "Por pagar"/"Pagado" 
        Cuenta: Si se selecciono "Por pagar" el un usuario admin seleccionara la cuenta despues, si selecciono "Pagado" quiere decir que el residente lo pago de su caja chica, por lo que se debe de ir a esa cuenta
5. click en "Crear Gasto"

 / Ver listado de gastos
1. Desde la pantalla principal
2. Seleccionar obra
3. ver listaddo de gastos de la semana en curso y los gastos no pagados
    Tipo
    Concepto
    Proveedor
    Referencia del comprobante
    Importe
    "PP"/"P"  "PP" viene de por pagar, debe de aparecer en letras rojas, "P" viene de pagado, debe de aparecer con letras verdes
4. Click en algun gasto
6. Se muestran todos los campos del gasto seleccionado