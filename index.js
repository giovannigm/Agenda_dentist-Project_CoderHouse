function inicio() {
    pedirDatos();

    const guardarBtn = document.getElementById("btnGuardar");
    guardarBtn.addEventListener("click", guardarConfiguracion);
    llenarSelectConHoras();

    const btnAgendar = document.getElementById("formularioAgenda");
    btnAgendar.addEventListener("submit", datosDeCita);
    agregarCita();

}

function guardarConfiguracion() {
    const diasTrabajo = obtenerDiasTrabajo();
    const horarioDisponible = generarHorasEntre();

    if (diasTrabajo.length == 0 || horarioDisponible.length == 0) {
        const notificationContainer = document.getElementById("notificationContainer1");
        const notification = document.createElement("div");
        notification.classList.add("alert");
        notification.textContent = "ingrese dato valido";
        notificationContainer.appendChild(notification);
    } else {
        localStorage.setItem("diasDeTrabajo", diasTrabajo);
        localStorage.setItem("horasDeTrabajo", horarioDisponible);
        llenarSelectConHoras();


    }
}

function obtenerDiasTrabajo() {
    const diasSeleccionados = [];
    const diasCheckbox = document.querySelectorAll("input[type=checkbox]:checked");

    diasCheckbox.forEach(checkbox => {
        diasSeleccionados.push(checkbox.id);
    });

    diasCheckbox.forEach(checkbox => {
        checkbox.checked = false;
    });

    return diasSeleccionados;

}

function generarHorasEntre() {
    const horaInicio = document.getElementById("horaApertura").value;
    const horaFin = document.getElementById("horaCierre").value;
    const horasGeneradas = [];

    if (horaInicio >= horaFin) {
        return horasGeneradas;
    } else {
        const [inicioHora, inicioMinuto] = horaInicio.split(":").map(Number);
        const [finHora, finMinuto] = horaFin.split(":").map(Number);

        let horaActual = inicioHora;
        let minutoActual = inicioMinuto;

        while (horaActual < finHora || (horaActual === finHora && minutoActual <= finMinuto)) {
            const horaFormateada = `${String(horaActual).padStart(2, "0")}:${String(minutoActual).padStart(2, "0")}`;
            horasGeneradas.push(horaFormateada);

            minutoActual += 30;
            if (minutoActual >= 60) {
                horaActual++;
                minutoActual -= 60;
            }
        }
        document.getElementById("horaApertura").value = "";
        document.getElementById("horaCierre").value = "";
        return horasGeneradas;
    }

}


function llenarSelectConHoras() {
    const horas = localStorage.getItem("horasDeTrabajo").split(",");
    const horasSelect = document.getElementById("horasSelect");
    horasSelect.innerHTML = "";
    horas.forEach(hora => {
        const option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;
        horasSelect.appendChild(option);
    })

}

//////////////////////////////////////////////////////////////////////////////////////////

const citasAgendadas = JSON.parse(localStorage.getItem("citasAgendadas")) || [];
function datosDeCita(event) {
    event.preventDefault();
    const nombrePersona = document.getElementById("nombre").value;
    const apellidoPersona = document.getElementById("apellido").value;
    const telefonoPersona = document.getElementById("telefono").value;
    const fechaAmodificar = document.getElementById("fecha").value;
    const eleccionHora = document.getElementById("horasSelect").value;
    console.log(fechaAmodificar); // Salida: 2023-08-23
    const partesFecha = fechaAmodificar.split("-");
    const year = parseInt(partesFecha[0]);
    const month = parseInt(partesFecha[1]);
    const day = parseInt(partesFecha[2]);
    const fechaPersona = `${day}/${month}/${year}`
    console.log(fechaPersona) // Salida: 23/08/2023
    //saber en que dia seleciono mediante el dia con numero 
    const fechaDeSeleccion = new Date(year, month - 1, day);
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaSemana = diasSemana[fechaDeSeleccion.getDay()];
    console.log(diaSemana);
    ////
    const agregarUnaCita = ({ nombre: nombrePersona, apellido: apellidoPersona, telefono: telefonoPersona, fecha: fechaPersona, horario: eleccionHora });
    const existenFecha = citasAgendadas.find(cita => cita.fecha === fechaPersona);
    const existenteHora = citasAgendadas.find(cita => cita.horario === eleccionHora);
    const fechaHoy = new Date();
    // const diaActual = fechaHoy.toLocaleDateString('es-ES', { weekday: 'long' });
    const mesActual = fechaHoy.toLocaleDateString('es-ES', { month: 'numeric' });
    const añoActual = fechaHoy.toLocaleDateString('es-ES', { year: 'numeric' });
    const diasAgendados = localStorage.getItem("diasDeTrabajo").split(",");
    console.log(diasAgendados);
    if (year < añoActual) {
        const notificationContainer = document.getElementById("notificationContainer2");
        notificationContainer.innerHTML = "";
        const notification = document.createElement("div");
        notification.classList.add("alert");
        notification.textContent = "Ingrese un Año valido.";
        notificationContainer.appendChild(notification);
    } else {
        if (month < mesActual) {
            const notificationContainer = document.getElementById("notificationContainer2");
            notificationContainer.innerHTML = "";
            const notification = document.createElement("div");
            notification.classList.add("alert");
            notification.textContent = "Ingrese un Mes valido.";
            notificationContainer.appendChild(notification);
        } else {
            if (diasAgendados.includes(diaSemana)) {
                if (existenFecha && existenteHora) {
                    console.log("existe")
                    const notificationContainer = document.getElementById("notificationContainer2");
                    notificationContainer.innerHTML = "";
                    const notification = document.createElement("div");
                    notification.classList.add("alert");
                    notification.textContent = "Ya existe una cita agendada en este horario.";
                    notificationContainer.appendChild(notification);
                } else {
                    console.log("no existe")
                    citasAgendadas.push(agregarUnaCita);
                    localStorage.setItem("citasAgendadas", JSON.stringify(citasAgendadas));
                    location.reload(); // recarga la pagina 
                }
            } else {
                const notificationContainer = document.getElementById("notificationContainer2");
                notificationContainer.innerHTML = "";
                const notification = document.createElement("div");
                notification.classList.add("alert");
                notification.textContent = `Los dias de atencion son ${diasAgendados}`;
                notificationContainer.appendChild(notification);
            }
        }
    }
}

function agregarCita() {
    const tableAgenda = document.getElementById("tableAgenda");
    citasAgendadas.forEach((cita, index) => {
        const nuevaFila = document.createElement("tr");
        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = cita.nombre;
        nuevaFila.appendChild(celdaNombre);
        const celdaApellido = document.createElement("td");
        celdaApellido.textContent = cita.apellido;
        nuevaFila.appendChild(celdaApellido);
        const celdaTelefono = document.createElement("td");
        celdaTelefono.textContent = cita.telefono;
        nuevaFila.appendChild(celdaTelefono);
        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = cita.fecha;
        nuevaFila.appendChild(celdaFecha);
        const celdaHora = document.createElement("td");
        celdaHora.textContent = cita.horario;
        nuevaFila.appendChild(celdaHora);

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = ("Eliminar");
        const celdaEliminar = document.createElement("td");
        celdaEliminar.appendChild(botonEliminar);
        botonEliminar.addEventListener("click", function () {
            citasAgendadas.splice(index, 1);
            localStorage.setItem("citasAgendadas", JSON.stringify(citasAgendadas));
            location.reload();
        });
        nuevaFila.appendChild(celdaEliminar);
        tableAgenda.appendChild(nuevaFila);
    });
}
const cargarDatosEnTabla = (data) => {
    const tableAgenda = document.getElementById("tableAgenda");

    data.forEach((dato) => {
        const nuevaFila = document.createElement("tr");
        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = dato.nombre;
        nuevaFila.appendChild(celdaNombre);
        const celdaApellido = document.createElement("td");
        celdaApellido.textContent = dato.apellido;
        nuevaFila.appendChild(celdaApellido);
        const celdaTelefono = document.createElement("td");
        celdaTelefono.textContent = dato.telefono;
        nuevaFila.appendChild(celdaTelefono);
        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = dato.fecha;
        nuevaFila.appendChild(celdaFecha);
        const celdaHora = document.createElement("td");
        celdaHora.textContent = dato.horario;
        nuevaFila.appendChild(celdaHora);
        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        const celdaEliminar = document.createElement("td");
        celdaEliminar.appendChild(botonEliminar);
        nuevaFila.appendChild(celdaEliminar);
        tableAgenda.appendChild(nuevaFila);

        botonEliminar.addEventListener("click", function () {
            nuevaFila.remove();
        });
    });
};

const pedirDatos = async () => {
    try {
        const resp = await fetch("./db/agenda.json");
        if (!resp.ok) {
            throw new Error("No se pudo obtener la respuesta.");
        }
        const data = await resp.json();
        cargarDatosEnTabla(data);
    } catch (error) {
        console.error("Error al obtener los datos:", error);
    }
};

inicio();
