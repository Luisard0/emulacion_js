//DOM
function navegarA(idPantallaDestino) {
    document.querySelectorAll('.slide-container').forEach(p => p.classList.remove('active'));
    document.getElementById(idPantallaDestino).classList.add('active');
}

function abrirModal(titulo) {
    const contenidoHTML = document.getElementById('modal-cuerpo').innerHTML;
    const nuevaPestana = window.open('', '_blank');
    
    nuevaPestana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
            <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;700&family=Space+Mono&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-dark: #050505; --bg-surface: #000000; --bg-card: #111111;
                    --primary: #FFEA00; --secondary: #00E5FF;
                    --text-main: #ffffff; --text-muted: #cccccc;
                }
                body {
                    background-color: var(--bg-dark);
                    color: var(--text-main);
                    font-family: 'Urbanist', sans-serif;
                    padding: 40px;
                    margin: 0;
                }
                h1 { 
                    color: var(--primary); text-transform: uppercase; 
                    letter-spacing: 2px; text-align: center; margin-bottom: 40px; 
                }
                .subtitle { font-family: 'Space+Mono', monospace; color: var(--secondary); font-size: 18px; margin-bottom: 10px; }
                
                /* Estilos globales de tablas (Aplica para Óptimo y Clock) */
                .tabla-neon { 
                    width: 100%; border-collapse: collapse; font-family: 'Space Mono', monospace; 
                    font-size: 14px; text-align: center; margin-bottom: 30px;
                }
                .tabla-neon th, .tabla-neon td { border: 1px solid #333; padding: 10px; min-width: 40px; color: #ffffff; }
                .tabla-neon th { background: #ffea001a; color: var(--primary); }
                .fallo-critico { color: #ff3366; font-weight: bold; text-shadow: 0 0 5px #ff336680; }
                
                /* Estilos específicos que requiere tu algoritmo FCFS y SJF */
                .estado-E { background-color: #00e5ff33; font-weight: bold; color: var(--secondary); }
                .estado-L { color: var(--text-muted); }
                .estado-F { background-color: #ffea0033; color: var(--primary); }
                .cola-instante { border: 1px solid #333; padding: 10px; border-radius: 5px; min-width: 60px; text-align: center; background: var(--bg-surface);}
                .cola-instante header { border-bottom: 1px solid var(--primary); margin-bottom: 5px; color: var(--primary); }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            <div style="background: var(--bg-card); padding: 30px; border-radius: 12px; border: 1px solid var(--secondary); overflow-x: auto;">
                ${contenidoHTML}
            </div>
        </body>
        </html>
    `);
    nuevaPestana.document.close();
    document.getElementById('modal-cuerpo').innerHTML = '';
}

function cerrarModal() {
}

// LÓGICA ÓPTIMO
function simulacionOptimaLogica(numFrames, numProcesos, totalTiempos) {
    const referencia = Array.from({ length: totalTiempos }, () => Math.floor(Math.random() * numProcesos) + 1);
    const frames = Array(numFrames).fill("-");
    const matrizFrames = Array.from({ length: numFrames }, () => Array(totalTiempos).fill("-"));
    const filaFallos = Array(totalTiempos).fill("");
    let totalFallos = 0;

    for (let tiempo = 0; tiempo < totalTiempos; tiempo++) {
        let paginaActual = referencia[tiempo];
        
        if (frames.includes(paginaActual)) {
            for (let f = 0; f < numFrames; f++) matrizFrames[f][tiempo] = frames[f];
            continue;
        }
        
        totalFallos++;
        filaFallos[tiempo] = "X";
        let espacioVacio = frames.indexOf("-");
        
        if (espacioVacio !== -1) {
            frames[espacioVacio] = paginaActual;
        } else {
            let indiceReemplazo = 0;
            let distanciaMaxima = -1;
            
            for (let f = 0; f < numFrames; f++) {
                let pagina = frames[f];
                let proximoUso = referencia.indexOf(pagina, tiempo + 1);
                if (proximoUso === -1) proximoUso = 9999; 
                
                if (proximoUso > distanciaMaxima) {
                    distanciaMaxima = proximoUso;
                    indiceReemplazo = f;
                }
            }
            frames[indiceReemplazo] = paginaActual;
        }
        for (let f = 0; f < numFrames; f++) matrizFrames[f][tiempo] = frames[f];
    }
    return { referencia, filaFallos, matrizFrames, numFrames, totalTiempos, totalFallos };
}

function renderizarTablaPaginacion(datos) {
    let html = `<p class="subtitle" style="margin-bottom:20px;">TOTAL DE FALLOS: <span style="color:#ff3366; font-size:24px;">${datos.totalFallos}</span></p>`;
    html += `<table class="tabla-neon"><thead><tr><th>Demanda</th>`;
    
    for(let i = 0; i < datos.totalTiempos; i++) {
        html += `<th>${datos.referencia[i]}</th>`;
    }
    html += `</tr></thead><tbody><tr><td style="color:var(--text-muted);">Fallo</td>`;
    
    for(let i = 0; i < datos.totalTiempos; i++) {
        let esFallo = datos.filaFallos[i] === "X" ? "fallo-critico" : "";
        html += `<td class="${esFallo}">${datos.filaFallos[i]}</td>`;
    }
    html += `</tr>`;
    
    for(let f = 0; f < datos.numFrames; f++) {
        html += `<tr><td style="color:#00E5FF; font-weight:bold;">F${f+1}</td>`;
        for(let i = 0; i < datos.totalTiempos; i++) {
            html += `<td>${datos.matrizFrames[f][i]}</td>`;
        }
        html += `</tr>`;
    }
    
    html += `<tr><td style="color:var(--primary); font-weight:bold; border-top: 2px solid var(--primary);">Tiempo</td>`;
    for(let i = 0; i < datos.totalTiempos; i++) {
        html += `<td style="color:var(--primary); border-top: 2px solid var(--primary);">${i + 1}</td>`;
    }
    html += `</tr></tbody></table>`;
    document.getElementById('modal-cuerpo').innerHTML = html;
}

// LÓGICA CLOCK
function ejecutarSimulacionReloj(numFrames, numProcesos, duracionTiempo, secuenciaDemanda = null) {
    if (secuenciaDemanda == null) {
        secuenciaDemanda = [];
        for (let i = 0; i < duracionTiempo; i++) {
            let paginaAleatoria = Math.floor(Math.random() * numProcesos);
            secuenciaDemanda.push(paginaAleatoria);
        }
    } else {
        duracionTiempo = secuenciaDemanda.length;
    }

    let frames = [];
    for (let i = 0; i < numFrames; i++) { frames.push([null, 0]); }

    let puntero = 0; 
    let totalFallos = 0; 
    let historialPasos = []; 

    for (let t = 0; t < duracionTiempo; t++) {
        let paginaSolicitada = secuenciaDemanda[t]; 
        let huboFallo = false; 
        let marcoApuntadorGuardado = -1; 
        let encontrado = false;
        
        for (let i = 0; i < numFrames; i++) {
            if (frames[i][0] == paginaSolicitada) {
                frames[i][1] = 1; 
                encontrado = true;
                break; 
            }
        }

        if (encontrado == false) {
            huboFallo = true;
            totalFallos = totalFallos + 1; 

            let indiceVacio = -1;
            for (let i = 0; i < numFrames; i++) {
                if (frames[i][0] === null) {
                    indiceVacio = i; 
                    break; 
                }
            }

            if (indiceVacio !== -1) {
                frames[indiceVacio][0] = paginaSolicitada;
                frames[indiceVacio][1] = 1;
                marcoApuntadorGuardado = -1; 
            } else {
                let buscador = puntero;
                while (true) {
                    let paginaActual = frames[buscador][0];
                    let bitUso = frames[buscador][1];

                    if (bitUso == 0) {
                        frames[buscador][0] = paginaSolicitada;
                        frames[buscador][1] = 1; 
                        marcoApuntadorGuardado = buscador; 
                        puntero = (buscador + 1) % numFrames;
                        break; 
                    } else {
                        frames[buscador][1] = 0;
                        buscador = (buscador + 1) % numFrames;
                    }
                }
            }
        }

        let copiaMarcos = [];
        for (let i = 0; i < numFrames; i++) {
            copiaMarcos.push([frames[i][0], frames[i][1]]);
        }

        historialPasos.push({
            tiempo: t + 1, demanda: paginaSolicitada,
            fallo: huboFallo ? "X" : "", estadoFrames: copiaMarcos,
            punteroEn: huboFallo ? marcoApuntadorGuardado : -1
        });
    }
    return { totalFallos: totalFallos, secuencia: secuenciaDemanda, historial: historialPasos };
}

function renderizarTablaClock(datos) {
    let numFrames = datos.historial[0].estadoFrames.length;
    let tTotal = datos.historial.length;

    let html = `<p class="subtitle" style="margin-bottom:20px;">TOTAL DE FALLOS: <span style="color:#ff3366; font-size:24px;">${datos.totalFallos}</span></p>`;
    html += `<table class="tabla-neon"><thead><tr><th>Demanda</th>`;

    for(let i=0; i<tTotal; i++) html += `<th>${datos.secuencia[i]}</th>`;
    html += `</tr></thead><tbody><tr><td style="color:var(--text-muted);">Fallo</td>`;

    for(let i=0; i<tTotal; i++) {
        let fallo = datos.historial[i].fallo;
        let esFallo = fallo === "X" ? "fallo-critico" : "";
        html += `<td class="${esFallo}">${fallo}</td>`;
    }
    html += `</tr>`;

    for(let f=0; f<numFrames; f++) {
        html += `<tr><td style="color:#00E5FF; font-weight:bold;">F${f+1}</td>`;
        for(let i=0; i<tTotal; i++) {
            let pagina = datos.historial[i].estadoFrames[f][0];
            let bit = datos.historial[i].estadoFrames[f][1];
            let val = pagina === null ? "-" : `${pagina} <span style="color:var(--text-muted); font-size:10px;">(${bit})</span>`;
            if(datos.historial[i].punteroEn === f) val += ` <span style="color:var(--primary);">*</span>`;
            html += `<td>${val}</td>`;
        }
        html += `</tr>`;
    }

    html += `<tr><td style="color:var(--primary); font-weight:bold; border-top: 2px solid var(--primary);">Tiempo</td>`;
    for(let i = 0; i < tTotal; i++) {
        html += `<td style="color:var(--primary); border-top: 2px solid var(--primary);">${i + 1}</td>`;
    }
    html += `</tr></tbody></table>`;
    document.getElementById('modal-cuerpo').innerHTML = html;
}

//LÓGICA FCFS
let numProcesos = 10;
let procesos = [];
let nombres = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
let tiemposLlegada = [];

const COMPORTAMIENTO_FCFS = "El algoritmo FCFS (First Come, First Served) ejecuta los procesos en el mismo orden en que llegan a la cola de planificación, sin considerar el tiempo de ejecución de cada uno. Su funcionamiento es sencillo y equitativo, ya que todos los procesos son atendidos conforme a su llegada, lo que facilita su implementación y administración dentro del sistema operativo. Sin embargo, este algoritmo puede generar un bajo rendimiento cuando un proceso de larga duración ocupa el procesador antes que varios procesos cortos, ocasionando el llamado efecto convoy, donde los procesos pequeños deben esperar largos periodos antes de ejecutarse. Como consecuencia, los tiempos promedio de espera y retorno suelen incrementarse, especialmente en cargas de trabajo con procesos de duración muy variable.";

const COMPORTAMIENTO_SJF = "El algoritmo SJF (Shortest Job First) selecciona para su ejecución el proceso con el menor tiempo de ráfaga, priorizando así las tareas más cortas. Gracias a esta estrategia, logra reducir considerablemente el tiempo promedio de espera y el tiempo promedio de retorno, ofreciendo un mejor rendimiento general del sistema en comparación con FCFS. No obstante, su principal desventaja es que los procesos largos pueden quedar esperando indefinidamente si continúan llegando procesos cortos, fenómeno conocido como inanición o starvation. Además, para su correcta implementación es necesario estimar previamente el tiempo de ejecución de cada proceso, lo cual no siempre es posible con precisión en entornos reales.";

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

function prepararProcesosAleatorios() {
    procesos = [];
    generarTiemposLlegadaAleatorios();
    for (let i = 0; i < numProcesos; i++) {
        procesos.push({
            id: nombres[i], tEjecucion: Math.floor(Math.random() * 8) + 2,
            tLlegada: tiemposLlegada[i], restante: 0, tComienzo: -1, tFin: -1
        });
    }
    procesos.sort(function(a, b) { return a.tLlegada - b.tLlegada; });
}

function simularFCFS() {
    let tiempoActual = 0, terminados = 0, cola = [], ejecutando = null, gantt = {}, historial = [];

    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i];
        p.restante = p.tEjecucion; p.tFin = -1; p.tComienzo = -1; gantt[p.id] = [];
    }
    procesos.sort(function(a, b) { return a.tLlegada - b.tLlegada; });

    while (terminados < procesos.length) {
        for (let i = 0; i < procesos.length; i++) {
            if (procesos[i].tLlegada == tiempoActual) cola.push(procesos[i]);
        }
        if (ejecutando == null && cola.length > 0) {
            ejecutando = cola.shift(); ejecutando.tComienzo = tiempoActual;
        }

        let listaNombresCola = [];
        for (let i = cola.length - 1; i >= 0; i--) { listaNombresCola.push(cola[i].id); }
        historial.push({ t: tiempoActual, lista: listaNombresCola });

        for (let i = 0; i < procesos.length; i++) {
            let p = procesos[i], estado = "";
            if (ejecutando != null && p.id == ejecutando.id) {
                estado = "E";
            } else {
                for (let j = 0; j < cola.length; j++) {
                    if (cola[j].id == p.id) { estado = "L"; break; }
                }
            }
            if (p.tFin != -1 && p.tFin + 1 == tiempoActual) { estado = "F"; }
            gantt[p.id][tiempoActual] = estado;
        }

        if (ejecutando != null) {
            ejecutando.restante--;
            if (ejecutando.restante == 0) {
                ejecutando.tFin = tiempoActual; terminados++; ejecutando = null;
            }
        }
        tiempoActual++;
    }
    renderGanttFCFS(gantt, tiempoActual);
    renderResultadosFCFS(historial);
}

function obtenerMetricasFCFS() {
    let sumaRetorno = 0, sumaEspera = 0;
    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i], retorno = p.tFin - p.tLlegada + 1, espera = retorno - p.tEjecucion;
        sumaRetorno += retorno; sumaEspera += espera;
    }
    return { retorno: (sumaRetorno / procesos.length).toFixed(2), espera: (sumaEspera / procesos.length).toFixed(2) };
}

function renderEntradaFCFS() {
    let html = "";
    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i];
        html += "<tr><td style='color:var(--primary);'>" + p.id + "</td><td>" + p.tEjecucion + "</td><td>" + p.tLlegada + "</td></tr>";
    }
    document.getElementById("body-entrada").innerHTML = html;
}

function renderGanttFCFS(gantt, totalTiempo) {
    let tabla = document.getElementById("gantt-chart");
    let cabecera = "<tr><th>Proceso</th>";
    for (let t = 0; t <= totalTiempo; t++) cabecera += "<th>" + t + "</th>";
    cabecera += "</tr>";

    let filas = "", ids = [];
    for(let i=0; i < procesos.length; i++) ids.push(procesos[i].id);
    ids.sort();

    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        filas += "<tr><td style='color:var(--primary);'>" + id + "</td>";
        for (let t = 0; t <= totalTiempo; t++) {
            let estado = gantt[id][t] || "";
            filas += "<td class='estado-" + estado + "'>" + estado + "</td>";
        }
        filas += "</tr>";
    }
    tabla.innerHTML = cabecera + filas;
}

function renderResultadosFCFS(historial) {
    let html = "";
    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i], retorno = p.tFin - p.tLlegada + 1, espera = retorno - p.tEjecucion;
        html += "<tr><td style='color:var(--primary);'>" + p.id + "</td><td>" + p.tComienzo + "</td><td>" + p.tFin + "</td><td>" + retorno + "</td><td>" + espera + "</td></tr>";
    }
    document.getElementById("body-resultados").innerHTML = html;
    let m = obtenerMetricasFCFS();
    document.getElementById("promedios-fcfs").innerHTML = "<p><strong>Promedio Retorno:</strong> " + m.retorno + " | <strong>Promedio Espera:</strong> " + m.espera + "</p>";
    renderColaGraficaFCFS(historial);
}

function renderColaGraficaFCFS(historial) {
    let html = "";
    for (let i = 0; i < historial.length; i++) {
        let h = historial[i];
        html += "<div class='cola-instante'><header>T:" + h.t + "</header>";
        if (h.lista.length === 0) { html += "<div>-</div>"; } 
        else { for (let j = 0; j < h.lista.length; j++) { html += "<div>" + h.lista[j] + "</div>"; } }
        html += "</div>";
    }
    document.getElementById("cola-container").innerHTML = html;
}

//LÓGICA SJF
var procs = [];

function loadDefault() {
  procs = [
    { pid: 'A', burst: 5,  arrival: 0  },
    { pid: 'B', burst: 4,  arrival: 10 },
    { pid: 'C', burst: 2,  arrival: 15 },
    { pid: 'D', burst: 5,  arrival: 7  },
    { pid: 'E', burst: 8,  arrival: 13 },
    { pid: 'F', burst: 3,  arrival: 3  },
    { pid: 'G', burst: 10, arrival: 9  },
    { pid: 'H', burst: 3,  arrival: 12 },
    { pid: 'I', burst: 8,  arrival: 2  },
    { pid: 'J', burst: 7,  arrival: 6  }
  ];
  renderInput();
  hideResults();
  setStatus('Datos de ejemplo cargados. Tabla generada con SJF.', '');
}

function randomize() {
  var pids = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  var t = 0;
  procs = pids.map(function (pid) {
    t += Math.floor(Math.random() * 4);
    return { pid: pid, burst: Math.floor(Math.random() * 9) + 1, arrival: t };
  });
  renderInput();
  hideResults();
  setStatus('Datos aleatorizados. Tabla generada con SJF.', '');
}

function renderInput() {
  var tb = document.getElementById('input-tbody');
  tb.innerHTML = '';
  procs.forEach(function (p, i) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + p.pid + '</td>' +
      '<td>' + p.burst + '</td>' +
      '<td>' + p.arrival + '</td>';
    tb.appendChild(tr);
  });
}

function sjf(input) {
  var pending = input.map(function (p) { return Object.assign({}, p); })
    .sort(function (a, b) {
      return a.arrival !== b.arrival ? a.arrival - b.arrival : a.pid.localeCompare(b.pid);
    });
  var heap = [];
  
  function cmp(a, b) {
    if (a.burst !== b.burst) return a.burst - b.burst;
    if (a.arrival !== b.arrival) return a.arrival - b.arrival;
    return a.pid.localeCompare(b.pid);
  }

  function hpush(p) {
    heap.push(p);
    var i = heap.length - 1;
    while (i > 0) {
      var par = (i - 1) >> 1;
      if (cmp(heap[i], heap[par]) < 0) {
        var t = heap[i]; heap[i] = heap[par]; heap[par] = t; i = par;
      } else break;
    }
  }

  function hpop() {
    var top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      var i = 0;
      while (true) {
        var s = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < heap.length && cmp(heap[l], heap[s]) < 0) s = l;
        if (r < heap.length && cmp(heap[r], heap[s]) < 0) s = r;
        if (s === i) break;
        var t = heap[i]; heap[i] = heap[s]; heap[s] = t; i = s;
      }
    }
    return top;
  }

  var results = [], time = 0, idx = 0;
  while (idx < pending.length || heap.length) {
    while (idx < pending.length && pending[idx].arrival <= time)
      hpush(Object.assign({}, pending[idx++]));
    if (!heap.length) { time = pending[idx].arrival; continue; }
    var p = hpop(), start = time, end = time + p.burst;
    while (idx < pending.length && pending[idx].arrival <= end)
      hpush(Object.assign({}, pending[idx++]));
    results.push({
      pid: p.pid, burst: p.burst, arrival: p.arrival,
      start: start, end: end,
      turnaround: end - p.arrival, waiting: start - p.arrival
    });
    time = end;
  }
  return results;
}

function fcfs(input) {
  var sorted = input.map(function (p) { return Object.assign({}, p); })
    .sort(function (a, b) {
      return a.arrival !== b.arrival ? a.arrival - b.arrival : a.pid.localeCompare(b.pid);
    });
  var time = 0;
  return sorted.map(function (p) {
    if (time < p.arrival) time = p.arrival;
    var start = time, end = time + p.burst; time = end;
    return {
      pid: p.pid, burst: p.burst, arrival: p.arrival,
      start: start, end: end,
      turnaround: end - p.arrival, waiting: start - p.arrival
    };
  });
}

function runSJF() {
  if (!procs.length) { setStatus('Sin procesos.', 'err'); return; }
  var sjfRes = sjf(procs), fcfsRes = fcfs(procs);
  renderGanttSJF(sjfRes);
  renderResults(sjfRes);
  renderCmp(sjfRes, fcfsRes);
  ['gantt-block', 'results-block', 'cmp-block'].forEach(function (id) {
    document.getElementById(id).classList.remove('hidden');
  });
  setStatus('SJF ejecutado — ' + procs.length + ' procesos, tiempo total: ' + sjfRes[sjfRes.length - 1].end + ' u.', 'ok');
}

function renderGanttSJF(results) {
  var total = results.reduce(function (mx, r) { return Math.max(mx, r.end); }, 0);
  var pidOrder = procs.map(function (p) { return p.pid; });
  var stateMap = {};
  pidOrder.forEach(function (pid) { stateMap[pid] = new Array(total + 1).fill(''); });
  results.forEach(function (r) {
    for (var t = r.arrival; t < r.start; t++) if (t <= total) stateMap[r.pid][t] = 'L';
    for (var t = r.start; t < r.end; t++) if (t <= total) stateMap[r.pid][t] = 'E';
    if (r.end <= total) stateMap[r.pid][r.end] = 'F';
  });

  var table = document.getElementById('gantt-table');
  table.innerHTML = '';

  var thead = document.createElement('thead');
  var hrow = document.createElement('tr');
  var th0 = document.createElement('th');
  th0.className = 'proc-col'; th0.textContent = 'Proceso'; hrow.appendChild(th0);
  for (var t = 0; t <= total; t++) {
    var th = document.createElement('th'); th.textContent = t; hrow.appendChild(th);
  }
  thead.appendChild(hrow); table.appendChild(thead);

  var tbody = document.createElement('tbody');
  pidOrder.forEach(function (pid) {
    var tr = document.createElement('tr');
    var tdp = document.createElement('td');
    tdp.className = 'proc-label'; tdp.textContent = pid; tr.appendChild(tdp);
    for (var t = 0; t <= total; t++) {
      var td = document.createElement('td'); td.className = 'gc';
      var st = stateMap[pid][t];
      if (st === 'L')      { td.classList.add('gc-l'); td.textContent = 'L'; }
      else if (st === 'E') { td.classList.add('gc-e'); td.textContent = 'E'; }
      else if (st === 'F') { td.classList.add('gc-f'); td.textContent = 'F'; }
      else td.classList.add('gc-empty');
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

function renderResults(results) {
  var tbody = document.getElementById('results-tbody');
  var tfoot = document.getElementById('results-tfoot');
  tbody.innerHTML = ''; tfoot.innerHTML = '';
  var ordered = results.slice().sort(function (a, b) { return a.pid.localeCompare(b.pid); });
  var n = ordered.length, sumT = 0, sumW = 0;
  ordered.forEach(function (r) {
    sumT += r.turnaround; sumW += r.waiting;
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + r.pid + '</td><td>' + r.arrival + '</td><td>' + r.burst + '</td>' +
      '<td>' + r.start + '</td><td>' + r.end + '</td>' +
      '<td style="color:#00E5FF;font-weight:600">' + r.turnaround + '</td>' +
      '<td style="color:#FFEA00;font-weight:600">' + r.waiting + '</td>';
    tbody.appendChild(tr);
  });
  tfoot.innerHTML =
    '<tr><td colspan="5" style="color:#FFEA00;">Promedio</td>' +
    '<td style="color:#FFEA00;">' + (sumT / n).toFixed(2) + '</td>' +
    '<td style="color:#FFEA00;">' + (sumW / n).toFixed(2) + '</td></tr>';
}

function renderCmp(sjfRes, fcfsRes) {
  var n = sjfRes.length;
  var awS = sjfRes.reduce(function (s, r)  { return s + r.waiting; }, 0) / n;
  var atS = sjfRes.reduce(function (s, r)  { return s + r.turnaround; }, 0) / n;
  var awF = fcfsRes.reduce(function (s, r) { return s + r.waiting; }, 0) / n;
  var atF = fcfsRes.reduce(function (s, r) { return s + r.turnaround; }, 0) / n;

  var tbody = document.getElementById('cmp-tbody');
  tbody.innerHTML = '';

  function addRow(label, vs, vf) {
    var better = vs < vf ? 'sjf' : vs > vf ? 'fcfs' : 'equal';
    var tag =
      better === 'sjf'  ? '<span class="tag-better">SJF ✓</span>' :
      better === 'fcfs' ? '<span class="tag-worse">FCFS ✓</span>' :
                          '<span class="tag-equal">Igual</span>';
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + label + '</td>' +
      '<td style="' + (better === 'sjf'  ? 'color:#2ecc71;font-weight:600' : '') + '">' + vs.toFixed(2) + '</td>' +
      '<td style="' + (better === 'fcfs' ? 'color:#2ecc71;font-weight:600' : '') + '">' + vf.toFixed(2) + '</td>' +
      '<td>' + Math.abs(vf - vs).toFixed(2) + '</td>' +
      '<td>' + tag + '</td>';
    tbody.appendChild(tr);
  }

  addRow('T. Espera Promedio', awS, awF);
  addRow('T. Retorno Promedio', atS, atF);
}

function setStatus(msg, type) {
  var el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + (type || '');
}

function hideResults() {
  ['gantt-block', 'results-block', 'cmp-block'].forEach(function (id) {
    document.getElementById(id).classList.add('hidden');
  });
}


//LISTENERS PARA DOM
document.addEventListener('DOMContentLoaded', () => {
    
    function obtenerConfiguracionMemoria() {
        const frames = parseInt(document.getElementById('mem-frames').value);
        const procesos = parseInt(document.getElementById('mem-procesos').value);
        const tiempo = parseInt(document.getElementById('mem-tiempo').value);

        if (isNaN(tiempo) || tiempo < 10 || tiempo > 70) {
            alert("[ERROR] El tiempo de simulación debe encontrarse estrictamente entre 10 y 70 unidades.");
            return null;
        }
        return { frames, procesos, tiempo };
    }

    document.getElementById('btn-ejecutar-optimo').addEventListener('click', () => {
        const config = obtenerConfiguracionMemoria();
        if (!config) return; 
        const datosOptimos = simulacionOptimaLogica(config.frames, config.procesos, config.tiempo);
        renderizarTablaPaginacion(datosOptimos);
        abrirModal('TABLA DE COMPORTAMIENTO: ALGORITMO ÓPTIMO');
    });

    document.getElementById('btn-ejecutar-clock-aleatorio').addEventListener('click', () => {
        const config = obtenerConfiguracionMemoria();
        if (!config) return;
        const datosClock = ejecutarSimulacionReloj(config.frames, config.procesos, config.tiempo);
        renderizarTablaClock(datosClock);
        abrirModal('TABLA DE COMPORTAMIENTO: ALGORITMO CLOCK (ALEATORIO)');
    });

    document.getElementById('btn-ejecutar-clock-excel').addEventListener('click', () => {
        const secuenciaExcel = [5, 2, 3, 2, 4, 1, 3, 2, 5, 5, 8, 9, 6, 0, 2, 11, 5, 9, 6, 2];
        const datosClock = ejecutarSimulacionReloj(4, 16, secuenciaExcel.length, secuenciaExcel);
        renderizarTablaClock(datosClock);
        abrirModal('TABLA DE COMPORTAMIENTO: ALGORITMO CLOCK (DATOS EXCEL)');
    });

    document.getElementById('btn-ejecutar-fcfs').addEventListener('click', () => {
        document.getElementById('modal-cuerpo').innerHTML = `
            <div style="display:flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    <h3 class="color-primary" style="margin-bottom:10px;">Entrada</h3>
                    <table class="tabla-neon">
                        <thead><tr><th>ID</th><th>Ejecución</th><th>Llegada</th></tr></thead>
                        <tbody id="body-entrada"></tbody>
                    </table>
                </div>
                <div style="flex: 2; min-width: 400px;">
                    <h3 class="color-primary" style="margin-bottom:10px;">Resultados</h3>
                    <table class="tabla-neon">
                        <thead><tr><th>ID</th><th>Comienzo</th><th>Fin</th><th>Retorno</th><th>Espera</th></tr></thead>
                        <tbody id="body-resultados"></tbody>
                    </table>
                    <div id="promedios-fcfs" style="margin-top:15px; color:var(--secondary); font-size: 18px;"></div>
                </div>
            </div>
            <h3 class="color-primary" style="margin-top:30px; margin-bottom:10px;">Diagrama de Gantt</h3>
            <table class="tabla-neon" id="gantt-chart" style="width: auto;"></table>
            <h3 class="color-primary" style="margin-top:30px; margin-bottom:10px;">Estado de la Cola</h3>
            <div id="cola-container" style="display:flex; gap:15px; overflow-x:auto; padding-bottom:15px; color: white;"></div>
        `;
        prepararProcesosAleatorios();
        renderEntradaFCFS();
        simularFCFS();
        abrirModal('PLANIFICACIÓN DE CPU: FCFS');
    });

    document.getElementById('btn-ejecutar-sjf-aleatorio').addEventListener('click', () => {
        ejecutarIntegracionSJF(true, 'PLANIFICACIÓN DE CPU: SJF (ALEATORIO)');
    });

    document.getElementById('btn-ejecutar-sjf-ejemplo').addEventListener('click', () => {
        ejecutarIntegracionSJF(false, 'PLANIFICACIÓN DE CPU: SJF (EJEMPLO)');
    });

    function ejecutarIntegracionSJF(esAleatorio, tituloPestana) {
        document.getElementById('modal-cuerpo').innerHTML = `
            <style>
                .gc { text-align: center; border: 1px solid #333; padding: 8px;}
                .gc-l { color: var(--text-muted); }
                .gc-e { background-color: rgba(0, 229, 255, 0.2); font-weight: bold; color: var(--secondary); }
                .gc-f { background-color: rgba(255, 234, 0, 0.2); color: var(--primary); }
                .gc-empty { background-color: transparent; }
                .proc-label { color: var(--primary); font-weight: bold; }
                .tag-better { color: #000; background: #2ecc71; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;}
                .tag-worse { color: #fff; background: #e74c3c; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;}
                .tag-equal { color: #000; background: #f1c40f; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;}
                .status { margin-bottom: 20px; font-family: 'Space Mono', monospace; color: var(--primary); }
                .hidden { display: none; }
            </style>
            
            <div id="status" class="status"></div>
            
            <div style="display:flex; justify-content:center; margin-bottom: 30px;">
                <table id="input-table" class="tabla-neon" style="width: auto;">
                    <thead><tr><th>ID</th><th>Ráfaga</th><th>Llegada</th></tr></thead>
                    <tbody id="input-tbody"></tbody>
                </table>
            </div>
            
            <div id="gantt-block" class="hidden">
                <h3 style="color:var(--primary); margin-top: 20px; margin-bottom: 10px;">DIAGRAMA DE GANTT</h3>
                <table id="gantt-table" class="tabla-neon" style="width: auto;"></table>
            </div>
            
            <div id="results-block" class="hidden">
                <h3 style="color:var(--primary); margin-top: 40px; margin-bottom: 10px;">TABLA DE RESULTADOS SJF</h3>
                <table class="tabla-neon">
                    <thead><tr><th>PID</th><th>Llegada</th><th>Ráfaga</th><th>Inicio</th><th>Fin</th><th>Retorno</th><th>Espera</th></tr></thead>
                    <tbody id="results-tbody"></tbody>
                    <tfoot id="results-tfoot"></tfoot>
                </table>
            </div>
            
            <div id="cmp-block" class="hidden">
                <h3 style="color:var(--primary); margin-top: 40px; margin-bottom: 10px;">COMPARATIVA (SJF vs FCFS)</h3>
                <table class="tabla-neon" style="width: auto; margin: 0 auto;">
                    <thead><tr><th>Métrica</th><th>SJF</th><th>FCFS</th><th>Diferencia</th><th>Mejor</th></tr></thead>
                    <tbody id="cmp-tbody"></tbody>
                </table>
            </div>
        `;

        if(esAleatorio) {
            randomize();
        } else {
            loadDefault();
        }
        
        runSJF();
        abrirModal(tituloPestana);
    }
});