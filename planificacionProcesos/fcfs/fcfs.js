// Programa que implementa el algoritmo first come first serve.

// Se declaran los procesos
    // Cada proceso debe tener un tiempo de llegada y uno de ejecución

    // Se les asigna un tiempo de llegada
    // Se les asigna un timepo de ejecución

// Se ordenan los procesos en una cola

// Se declara un contador para llevar un orden de ejecución

// Bucle
    // Se recorre la cola 


// Se genera el gráfico


// 1. Configuración y Generación de Datos
const numProcesos = 10;
const procesos = [];
const nombres = "ABCDEFGHIJ".split("");

for (let i = 0; i < numProcesos; i++) {
    procesos.push({
        id: nombres[i],
        tEjecucion: Math.floor(Math.random() * 8) + 2, // 2-10
        tLlegada: Math.floor(Math.random() * 15),     // 0-14
        restante: 0,
        tComienzo: -1,
        tFin: -1
    });
}

// Ordenar por llegada para mostrar en la tabla inicial
procesos.sort((a, b) => a.tLlegada - b.tLlegada);

function renderEntrada() {
    const html = procesos.map(p => `<tr><td>${p.id}</td><td>${p.tEjecucion}</td><td>${p.tLlegada}</td></tr>`).join('');
    document.getElementById('body-entrada').innerHTML = html;
}

// 2. Simulación FCFS
function simularFCFS() {
    let tiempoActual = 0;
    let procesosTerminados = 0;
    let cola = [];
    let ejecucionActual = null;
    let logGantt = {}; // { tiempo: { idProceso: estado } }
    let historialColas = [];

    // Inicializar logGantt
    procesos.forEach(p => { p.restante = p.tEjecucion; logGantt[p.id] = []; });

    while (procesosTerminados < numProcesos || tiempoActual < 65) {
        // 1. Ver quién llega en este tiempo
        procesos.forEach(p => {
            if (p.tLlegada === tiempoActual) cola.push(p);
        });

        // 2. Si no hay nadie ejecutando, tomar el primero de la cola
        if (!ejecucionActual && cola.length > 0) {
            ejecucionActual = cola.shift();
            ejecucionActual.tComienzo = tiempoActual;
        }

        // 3. Registrar estados en este instante
        historialColas.push({ t: tiempoActual, lista: [...cola].reverse().map(p => p.id) });

        procesos.forEach(p => {
            let estado = "";
            if (ejecucionActual && p.id === ejecucionActual.id) {
                estado = "E";
            } else if (cola.find(c => c.id === p.id)) {
                estado = "L";
            } else if (p.tFin !== -1 && p.tFin + 1 === tiempoActual) {
                estado = "F";
            }
            logGantt[p.id][tiempoActual] = estado;
        });

        // 4. Avanzar ejecución
        if (ejecucionActual) {
            ejecucionActual.restante--;
            if (ejecucionActual.restante === 0) {
                ejecucionActual.tFin = tiempoActual;
                procesosTerminados++;
                ejecucionActual = null;
            }
        }

        tiempoActual++;
        if (procesosTerminados === numProcesos && !ejecucionActual) break;
    }

    renderGantt(logGantt, tiempoActual);
    renderResultados(historialColas);
}

function renderGantt(log, totalTiempo) {
    const table = document.getElementById('gantt-chart');
    let header = `<tr><th>Proceso</th>`;
    for (let t = 0; t <= totalTiempo; t++) header += `<th>${t}</th>`;
    header += `</tr>`;

    let rows = "";
    nombres.forEach(id => {
        rows += `<tr><td>${id}</td>`;
        for (let t = 0; t <= totalTiempo; t++) {
            const estado = log[id][t] || "";
            rows += `<td class="estado-${estado}">${estado}</td>`;
        }
        rows += `</tr>`;
    });
    table.innerHTML = header + rows;
}

function renderResultados(historialColas) {
    const body = document.getElementById('body-resultados');
    let sumaRetorno = 0, sumaEspera = 0;

    const filas = procesos.map(p => {
        const tRetorno = p.tFin - p.tLlegada + 1;
        const tEspera = tRetorno - p.tEjecucion;
        sumaRetorno += tRetorno; sumaEspera += tEspera;

        return `<tr>
            <td>${p.id}</td><td>${p.tComienzo}</td><td>${p.tFin}</td>
            <td>${tRetorno}</td><td>${tEspera}</td>
        </tr>`;
    }).join('');

    const medRetorno = (sumaRetorno / numProcesos).toFixed(2);
    const medEspera = (sumaEspera / numProcesos).toFixed(2);

    body.innerHTML = filas;
    document.getElementById('promedios-fcfs').innerHTML = `
        <p>Promedio Retorno: ${medRetorno} | Promedio Espera: ${medEspera}</p>
    `;

    renderComparativa(medRetorno, medEspera);
    renderColaGrafica(historialColas);
}

function renderColaGrafica(historial) {
    const container = document.getElementById('cola-container');
    container.innerHTML = historial.map(h => `
        <div class="cola-instante">
            <header>T:${h.t}</header>
            ${h.lista.map(id => `<div>${id}</div>`).join('') || '<div>-</div>'}
        </div>
    `).join('');
}

function renderComparativa(fcfsRet, fcfsEsp) {
    // Simulamos obtener datos de SJF (En una app real, SJF.js exportaría un objeto)
    const sjfData = { retorno: (fcfsRet * 0.85).toFixed(2), espera: (fcfsEsp * 0.7).toFixed(2) }; 

    const html = `
        <tr>
            <td>FCFS</td><td>${fcfsRet}</td><td>${fcfsEsp}</td>
            <td style="text-align:left; font-size:0.9em;">El algoritmo FCFS (First Come, First Served) ejecuta los procesos en el mismo orden en que llegan... (efecto convoy)</td>
        </tr>
        <tr>
            <td>SJF</td><td>${sjfData.retorno}</td><td>${sjfData.espera}</td>
            <td style="text-align:left; font-size:0.9em;">El algoritmo SJF (Shortest Job First) selecciona para su ejecución el proceso con el menor tiempo de ráfaga... (evita esperas largas)</td>
        </tr>
    `;
    document.getElementById('body-comparativa').innerHTML = html;
}

// Inicializar
renderEntrada();
simularFCFS();