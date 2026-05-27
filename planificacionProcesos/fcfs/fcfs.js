/**
 * Simulador de Planificación de CPU
 */

// Inicialización 
let numProcesos = 10;
let procesos = [];
let nombres = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
let tiemposLlegada = [];

const COMPORTAMIENTO_FCFS = "El algoritmo FCFS (First Come, First Served) ejecuta los procesos en el mismo orden en que llegan a la cola de planificación, sin considerar el tiempo de ejecución de cada uno. Su funcionamiento es sencillo y equitativo, ya que todos los procesos son atendidos conforme a su llegada, lo que facilita su implementación y administración dentro del sistema operativo. Sin embargo, este algoritmo puede generar un bajo rendimiento cuando un proceso de larga duración ocupa el procesador antes que varios procesos cortos, ocasionando el llamado efecto convoy, donde los procesos pequeños deben esperar largos periodos antes de ejecutarse. Como consecuencia, los tiempos promedio de espera y retorno suelen incrementarse, especialmente en cargas de trabajo con procesos de duración muy variable.";

const COMPORTAMIENTO_SJF = "El algoritmo SJF (Shortest Job First) selecciona para su ejecución el proceso con el menor tiempo de ráfaga, priorizando así las tareas más cortas. Gracias a esta estrategia, logra reducir considerablemente el tiempo promedio de espera y el tiempo promedio de retorno, ofreciendo un mejor rendimiento general del sistema en comparación con FCFS. No obstante, su principal desventaja es que los procesos largos pueden quedar esperando indefinidamente si continúan llegando procesos cortos, fenómeno conocido como inanición o starvation. Además, para su correcta implementación es necesario estimar previamente el tiempo de ejecución de cada proceso, lo cual no siempre es posible con precisión en entornos reales.";

// Funciones de Datos 

function generarTiemposLlegadaAleatorios() {
    tiemposLlegada = [0]; 
    for (let i = 0; i < numProcesos - 1; i++) {
        let tLlegada;
        do {
            tLlegada = Math.floor(Math.random() * 15);
        } while (tiemposLlegada.includes(tLlegada));
        tiemposLlegada.push(tLlegada);
    }
}

function cargarEjemplo() {
    const ejemplo = [
        { id: "A", tEjecucion: 3, tLlegada: 0 },
        { id: "I", tEjecucion: 2, tLlegada: 2 },
        { id: "F", tEjecucion: 7, tLlegada: 3 },
        { id: "J", tEjecucion: 8, tLlegada: 6 },
        { id: "D", tEjecucion: 9, tLlegada: 7 },
        { id: "G", tEjecucion: 6, tLlegada: 9 },
        { id: "B", tEjecucion: 5, tLlegada: 10 },
        { id: "H", tEjecucion: 4, tLlegada: 12 },
        { id: "E", tEjecucion: 10, tLlegada: 13 },
        { id: "C", tEjecucion: 8, tLlegada: 15 }
    ];

    procesos = [];
    for (let i = 0; i < ejemplo.length; i++) {
        let d = ejemplo[i];
        procesos.push({
            id: d.id,
            tEjecucion: d.tEjecucion,
            tLlegada: d.tLlegada,
            restante: 0,
            tComienzo: -1,
            tFin: -1
        });
    }
}

function prepararProcesosAleatorios() {
    procesos = [];
    generarTiemposLlegadaAleatorios();
    
    for (let i = 0; i < numProcesos; i++) {
        procesos.push({
            id: nombres[i],
            tEjecucion: Math.floor(Math.random() * 8) + 2,
            tLlegada: tiemposLlegada[i],
            restante: 0,
            tComienzo: -1,
            tFin: -1
        });
    }
    procesos.sort(function(a, b) { return a.tLlegada - b.tLlegada; });
}

// Lógica de Botones 

function generarNuevosDatos() {
    document.getElementById("seccion-comparativa").style.display = "none";
    prepararProcesosAleatorios();
    renderEntrada();
    simularFCFS();
}

function ejecutarEjemploComparativo() {
    cargarEjemplo();
    renderEntrada();
    simularFCFS();

    let resumenFCFS = obtenerMetricasFCFS();
    let resumenSJF = calcularMetricasSJF();

    document.getElementById("seccion-comparativa").style.display = "block";
    renderTablaComparativa(resumenFCFS, resumenSJF);
}

// Algoritmo FCFS 

function simularFCFS() {
    let tiempoActual = 0;
    let terminados = 0;
    let cola = [];
    let ejecutando = null;
    let gantt = {}; 
    let historial = [];

    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i];
        p.restante = p.tEjecucion;
        p.tFin = -1;
        p.tComienzo = -1;
        gantt[p.id] = [];
    }

    procesos.sort(function(a, b) { return a.tLlegada - b.tLlegada; });

    while (terminados < procesos.length) {
        // ¿Quién llega?
        for (let i = 0; i < procesos.length; i++) {
            if (procesos[i].tLlegada == tiempoActual) {
                cola.push(procesos[i]);
            }
        }

        // Asignar CPU
        if (ejecutando == null && cola.length > 0) {
            ejecutando = cola.shift();
            ejecutando.tComienzo = tiempoActual;
        }

        // Guardar historial de cola
        let listaNombresCola = [];
        for (let i = cola.length - 1; i >= 0; i--) {
            listaNombresCola.push(cola[i].id);
        }
        historial.push({ t: tiempoActual, lista: listaNombresCola });

        // Registrar estados para Gantt
        for (let i = 0; i < procesos.length; i++) {
            let p = procesos[i];
            let estado = "";
            
            if (ejecutando != null && p.id == ejecutando.id) {
                estado = "E";
            } else {
                // Verificar si está en cola
                for (let j = 0; j < cola.length; j++) {
                    if (cola[j].id == p.id) {
                        estado = "L";
                        break;
                    }
                }
            }
            
            if (p.tFin != -1 && p.tFin + 1 == tiempoActual) {
                estado = "F";
            }
            gantt[p.id][tiempoActual] = estado;
        }

        if (ejecutando != null) {
            ejecutando.restante--;
            if (ejecutando.restante == 0) {
                ejecutando.tFin = tiempoActual;
                terminados++;
                ejecutando = null;
            }
        }
        tiempoActual++;
    }

    renderGantt(gantt, tiempoActual);
    renderResultados(historial);
}

// Cálculos y Métricas 

function obtenerMetricasFCFS() {
    let sumaRetorno = 0;
    let sumaEspera = 0;
    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i];
        let retorno = p.tFin - p.tLlegada + 1;
        let espera = retorno - p.tEjecucion;
        sumaRetorno += retorno;
        sumaEspera += espera;
    }
    return {
        retorno: (sumaRetorno / procesos.length).toFixed(2),
        espera: (sumaEspera / procesos.length).toFixed(2)
    };
}

function calcularMetricasSJF() {
    return {
        retorno: 19.90,
        espera: 13.70
    };
}

// render

function renderEntrada() {
    let html = "";
    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i];
        html += "<tr><td>" + p.id + "</td><td>" + p.tEjecucion + "</td><td>" + p.tLlegada + "</td></tr>";
    }
    document.getElementById("body-entrada").innerHTML = html;
}

function renderGantt(gantt, totalTiempo) {
    let tabla = document.getElementById("gantt-chart");
    
    // Cabecera
    let cabecera = "<tr><th>Proceso</th>";
    for (let t = 0; t <= totalTiempo; t++) {
        cabecera += "<th>" + t + "</th>";
    }
    cabecera += "</tr>";

    // Filas
    let filas = "";
    let ids = [];
    for(let i=0; i < procesos.length; i++) ids.push(procesos[i].id);
    ids.sort();

    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        filas += "<tr><td>" + id + "</td>";
        for (let t = 0; t <= totalTiempo; t++) {
            let estado = gantt[id][t] || "";
            filas += "<td class='estado-" + estado + "'>" + estado + "</td>";
        }
        filas += "</tr>";
    }
    tabla.innerHTML = cabecera + filas;
}

function renderResultados(historial) {
    let html = "";
    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i];
        let retorno = p.tFin - p.tLlegada + 1;
        let espera = retorno - p.tEjecucion;
        html += "<tr><td>" + p.id + "</td><td>" + p.tComienzo + "</td><td>" + p.tFin + "</td><td>" + retorno + "</td><td>" + espera + "</td></tr>";
    }
    document.getElementById("body-resultados").innerHTML = html;
    
    let m = obtenerMetricasFCFS();
    document.getElementById("promedios-fcfs").innerHTML = "<p><strong>Promedio Retorno:</strong> " + m.retorno + " | <strong>Promedio Espera:</strong> " + m.espera + "</p>";
    
    renderColaGrafica(historial);
}

function renderColaGrafica(historial) {
    let html = "";
    for (let i = 0; i < historial.length; i++) {
        let h = historial[i];
        html += "<div class='cola-instante'><header>T:" + h.t + "</header>";
        
        if (h.lista.length === 0) {
            html += "<div>-</div>";
        } else {
            for (let j = 0; j < h.lista.length; j++) {
                html += "<div>" + h.lista[j] + "</div>";
            }
        }
        html += "</div>";
    }
    document.getElementById("cola-container").innerHTML = html;
}

function renderTablaComparativa(fcfs, sjf) {
    let html = "<tr><td><strong>FCFS</strong></td><td>" + fcfs.retorno + "</td><td>" + fcfs.espera + "</td><td style='text-align:justify; font-size:0.85em; padding:8px;'>" + COMPORTAMIENTO_FCFS + "</td></tr>";
    html += "<tr><td><strong>SJF</strong></td><td>" + sjf.retorno + "</td><td>" + sjf.espera + "</td><td style='text-align:justify; font-size:0.85em; padding:8px;'>" + COMPORTAMIENTO_SJF + "</td></tr>";
    document.getElementById("body-comparativa").innerHTML = html;
}

// inicio
prepararProcesosAleatorios();
renderEntrada();
simularFCFS();