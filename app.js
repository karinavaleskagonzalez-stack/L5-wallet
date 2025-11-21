// ===========================================================
//  🔹 1. INICIALIZACIÓN COMÚN (se corre en TODAS las páginas)
// ===========================================================
//
// Cuando el HTML termina de cargarse (DOMContentLoaded),
// llamo a todas las funciones "prepararXYZ".
// Cada función primero revisa si los elementos existen en
// esa página, así que no rompe nada aunque no estemos ahí.
//
document.addEventListener("DOMContentLoaded", () => {
  // MENÚ PRINCIPAL (menu.html)
  mostrarSaldoEnMenu();   // Muestra el saldo en el span #saldoActual
  prepararEventosMenu();  // Conecta los botones del menú

  // DEPÓSITO (deposit.html)
  prepararFormularioDeposito(); // Conecta el form #formDeposito

  // ENVIAR DINERO (sendmoney.html)
  prepararEnvioDinero();        // Conecta el form #formEnviar

  // LOGIN (login.html)
  prepararLogin();              // Conecta el form #formLogin

  // TRANSACCIÓN (envío)
  mostrarMovimientos();         // transactions.html
});


// ===========================================================
//  🔹 2. UTILIDADES COMPARTIDAS (todas las páginas)
//     - Manejo de saldo y movimientos en localStorage
// ===========================================================

// Claves para guardar datos en localStorage
const SALDO_KEY = "saldo";
const MOVIMIENTOS_KEY = "movimientos";


// --------- MOVIMIENTOS (para historial / transactions.html) ---------

// Devuelve un arreglo con todos los movimientos guardados.
// Si no hay nada aún, devuelve [] (arreglo vacío).
function obtenerMovimientos() {
  return JSON.parse(localStorage.getItem(MOVIMIENTOS_KEY) || "[]");
}

// Agrega un nuevo movimiento al historial y lo guarda en localStorage.
// Esta función se puede llamar desde depósito, envío de dinero, etc.
function registrarMovimiento(tipo, monto, detalle = "") {
  const movimientos = obtenerMovimientos();

  // Agrega el nuevo movimiento al inicio del arreglo (unshift)
  movimientos.unshift({
    tipo,                    // "Depósito" o "Envío"
    monto,                   // número (ej: 500)
    detalle,                 // ej: "A Juan Pérez" o "Depósito en cuenta"
    fecha: new Date().toLocaleString(), // fecha + hora legible
  });

  localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(movimientos));
}


// --------- SALDO (usado por menú, depósito y envío) ---------

// Obtiene el saldo actual. Si no hay saldo guardado, devuelve 0.
function obtenerSaldo() {
  return Number(localStorage.getItem(SALDO_KEY) || "0");
}

// Guarda un nuevo saldo en localStorage.
// Se usa después de un depósito o un envío de dinero.
function guardarSaldo(nuevoSaldo) {
  localStorage.setItem(SALDO_KEY, String(nuevoSaldo));
}

// Muestra el saldo en el menú principal (menu.html).
// Busca el span con id="saldoActual".
// Si no existe (porque no estamos en menu.html), no hace nada.
function mostrarSaldoEnMenu() {
  const spanSaldo = document.getElementById("saldoActual");
  if (!spanSaldo) return;

  const saldo = obtenerSaldo();
  spanSaldo.textContent = saldo.toFixed(2); // ejemplo: 1200.00
}


// ===========================================================
//  🔹 3. LOGIN (login.html)
//     - Formulario con id="formLogin"
//     - Input de RUT con id="rut"
//     - Input de contraseña con id="password"
// ===========================================================

function prepararLogin() {
  // Busca el formulario y los inputs por su id
  const form = document.getElementById("formLogin");
  const rut = document.getElementById("rut");
  const password = document.getElementById("password");

  // Si no existe el formulario (porque no esta en login.html),
  // salir y no hace nada.
  if (!form) return;

  // Se "engancha" al evento submit del formulario
  form.addEventListener("submit", (event) => {
    // Evita que el form recargue la página
    event.preventDefault();

    // Validación básica: que RUT y contraseña no estén vacíos
    if (!rut.value || !password.value) {
      alert("Debes ingresar tu RUT y contraseña.");
      return;
    }

    // Validación del formato del RUT usando el pattern del input.
    // checkValidity() usa lo que defini en el HTML (pattern, required, etc.).
    if (!rut.checkValidity()) {
      alert("El RUT no tiene un formato válido. Ej: 12345678-9");
      return;
    }

    // Si todo está OK → redirigir al menú principal
    window.location.href = "menu.html";
  });
}



// ===========================================================
//  🔹 4. MENÚ PRINCIPAL (menu.html)
//     - span#saldoActual (para mostrar el saldo)
//     - Botones: #btnDepositar, #btnEnviar, #btnMovimientos
//     - Párrafo #mensajeMenu (para mostrar mensajes de "Redirigiendo...")
// ===========================================================

function prepararEventosMenu() {
  const btnDepositar   = document.getElementById("btnDepositar");
  const btnEnviar      = document.getElementById("btnEnviar");
  const btnMovimientos = document.getElementById("btnMovimientos");
  const mensaje        = document.getElementById("mensajeMenu");

  // Botón "Depositar"
  if (btnDepositar) {
    btnDepositar.addEventListener("click", () => {
      if (mensaje) mensaje.textContent = "Redirigiendo a Depósito...";
      setTimeout(() => {
        window.location.href = "deposit.html";
      }, 700);
    });
  }

  // Botón "Enviar Dinero"
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      if (mensaje) mensaje.textContent = "Redirigiendo a Enviar Dinero...";
      setTimeout(() => {
        window.location.href = "sendmoney.html";
      }, 700);
    });
  }

  // Botón "Últimos Movimientos"
  if (btnMovimientos) {
    btnMovimientos.addEventListener("click", () => {
      if (mensaje) mensaje.textContent =
        "Redirigiendo a Últimos Movimientos...";
      setTimeout(() => {
        window.location.href = "transactions.html";
      }, 700);
    });
  }
}

// ===========================================================
//  🔹 5. DEPÓSITO (deposit.html)
//     - Formulario #formDeposito
//     - Input del monto #montoDeposito
//     - Párrafo de mensaje #msgDeposito
// ===========================================================

function prepararFormularioDeposito() {
  const form       = document.getElementById("formDeposito");
  const inputMonto = document.getElementById("montoDeposito");
  const mensaje    = document.getElementById("msgDeposito");

  // Si no estay en deposit.html, no hay formulario → salir
  if (!form || !inputMonto) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // evita que el form recargue la página

    const monto = Number(inputMonto.value);

    // Validación básica: que el monto sea un número mayor que 0
    if (isNaN(monto) || monto <= 0) {
      if (mensaje) {
        mensaje.classList.remove("text-success");
        mensaje.classList.add("text-danger");
        mensaje.textContent = "El monto debe ser mayor a 0.";
      }
      return;
    }

    // Obtenemos el saldo actual y calculamos el nuevo saldo
    const saldoActual = obtenerSaldo();
    const nuevoSaldo  = saldoActual + monto;

    // Guardar el nuevo saldo
    guardarSaldo(nuevoSaldo);

    // Registra el movimiento en el historial
    registrarMovimiento("Depósito", monto, "Depósito en cuenta");

    // Mostrar mensaje de éxito
    if (mensaje) {
      mensaje.classList.remove("text-danger");
      mensaje.classList.add("text-success");
      mensaje.textContent =
        `Depósito exitoso. Nuevo saldo: $ ${nuevoSaldo.toFixed(2)}`;
    }

    // Limpiar el input
    inputMonto.value = "";
  });
}


// ===========================================================
//  🔹 6. ENVIAR DINERO (sendmoney.html)
//     - Formulario #formEnviar
//     - Inputs: #nombreDestinatario, #montoEnvio
//     - Párrafo de mensaje #msgEnvio
//     - Saldo actual
// ===========================================================
  // Engancha el formulario de enviar dinero, valida los datos,
  // descuenta el monto del saldo, guarda el cambio y registra
  // el movimiento en el historial.

function prepararEnvioDinero() {
  // 1) Tomo los elementos del DOM
  const form        = document.getElementById("formEnviar");
  const inputNombre = document.getElementById("nombreDestinatario");
  const inputMonto  = document.getElementById("montoEnvio");
  const mensaje     = document.getElementById("msgEnvio");

  // 2) Si no estoy en sendmoney.html, no hago nada
  if (!form || !inputNombre || !inputMonto) return;

  // 3) Me engancho al submit del formulario
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // 4) Leo los valores del formulario
    const nombre = inputNombre.value.trim();
    const monto  = Number(inputMonto.value);

    // 5) Validaciones básicas
    if (!nombre) {
      if (mensaje) {
        mensaje.className = "mt-3 fw-semibold text-danger";
        mensaje.textContent = "Debes ingresar el nombre del destinatario.";
      }
      return;
    }

    if (isNaN(monto) || monto <= 0) {
      if (mensaje) {
        mensaje.className = "mt-3 fw-semibold text-danger";
        mensaje.textContent = "El monto debe ser mayor que 0.";
      }
      return;
    }

    // 6) Obtengo el saldo actual
    const saldoActual = obtenerSaldo();

    // 7) Verifico saldo suficiente
    if (monto > saldoActual) {
      if (mensaje) {
        mensaje.className = "mt-3 fw-semibold text-danger";
        mensaje.textContent = "No tienes saldo suficiente para este envío.";
      }
      return;
    }

    // 8) Calculo el nuevo saldo y lo guardo
    const nuevoSaldo = saldoActual - monto;
    guardarSaldo(nuevoSaldo);

    // 9) Registro el movimiento en el historial
    registrarMovimiento("Envío", monto, `A ${nombre}`);

    // 10) Muestro mensaje de éxito
    if (mensaje) {
      mensaje.className = "mt-3 fw-semibold text-success";
      mensaje.textContent =
        `Envío exitoso a ${nombre}. Nuevo saldo: $ ${nuevoSaldo.toFixed(2)}`;
    }

    // 11) Limpio los campos
    inputNombre.value = "";
    inputMonto.value  = "";
  });
}
// ===========================================================
//  MOSTRAR ÚLTIMOS MOVIMIENTOS (transactions.html)
// ===========================================================
//
// Lee los movimientos desde localStorage y los dibuja
// en una tabla dentro del contenedor con id="listaMovimientos".
//
function mostrarMovimientos() {
  const contenedor = document.getElementById("listaMovimientos");
  if (!contenedor) return; // si no estamos en transactions.html, salimos

  const movimientos = obtenerMovimientos();

  // Si no hay movimientos, mostrar un mensaje amigable
  if (movimientos.length === 0) {
    contenedor.innerHTML = `
      <p class="text-muted">
        Aún no hay movimientos registrados.  
        Realiza un depósito o un envío para verlos aquí.
      </p>
    `;
    return;
  }

  // Generar las filas de la tabla a partir del historial
  const filasHTML = movimientos.map((mov) => `
    <tr>
      <td>${mov.fecha}</td>
      <td>${mov.tipo}</td>
      <td>${mov.detalle || "-"}</td>
      <td class="text-end">$ ${mov.monto.toFixed(2)}</td>
    </tr>
  `).join("");

  // Armar la tabla completa con Bootstrap
  contenedor.innerHTML = `
    <div class="table-responsive mt-3">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Detalle</th>
            <th class="text-end">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${filasHTML}
        </tbody>
      </table>
    </div>
  `;
}



