/**
 * Implementación del algoritmo FCFS. 
 * 
 */

// Datos
let numProcesos = 10;
let procesos = [];
let nombres = ["A","B","C","D","E","F","G","H","I","J"];

// Se crear los procesos
for(let i = 0; i < numProcesos; i++){

    let proceso = {
        id: nombres[i],
        tEjecucion: Math.floor(Math.random() * 8) + 2,
        tLlegada: Math.floor(Math.random() * 15),
        restante: 0,
        tComienzo: -1,
        tFin: -1
    };

    // Se guarda el proceso en la lista de procesos
    procesos.push(proceso);
}

// Se ordenan los proceso por tiempo de llegada
procesos.sort(function(a,b){
    return a.tLlegada - b.tLlegada;
});


// Algoritmo first come first serve
function simularFCFS(){

    let tiempoActual = 0;
    let terminados = 0;

    let cola = [];
    let ejecutando = null;

    let gantt = {}; // pal gráfico
    let historial = [];

    // Inicializando tiempo restante y gráfico gannt
    for(let i = 0; i < procesos.length; i++){

        procesos[i].restante = procesos[i].tEjecucion;
        gantt[procesos[i].id] = [];
    }

    while(terminados < numProcesos){

        // Ver quien llega
        for(let i = 0; i < procesos.length; i++){
            
            if(procesos[i].tLlegada == tiempoActual){

                cola.push(procesos[i]);
            }
        }

        // Toma al primero de la cola
        if(ejecutando == null && cola.length > 0){

            ejecutando = cola.shift();
            ejecutando.tComienzo = tiempoActual;
        }

        // Guardar cola
        let lista = [];

        for(let i = cola.length - 1; i >= 0; i--){

            lista.push(cola[i].id);
        }

        historial.push({
            t: tiempoActual,
            lista: lista
        });

        // Estados
        for(let i = 0; i < procesos.length; i++){

            let estado = "";

            // Si el proceso se está ejecutando el estado es E
            if(ejecutando != null && procesos[i].id == ejecutando.id){

                estado = "E";
            }
            else{

                for(let j = 0; j < cola.length; j++){
                    // Si el proceso está en la cola el estado es L
                    if(cola[j].id == procesos[i].id){

                        estado = "L";
                    }
                }
            }
            // Si el proceso ya terminó el estado es F, despues de la ultima E (ejecución)
            if(procesos[i].tFin != -1 && procesos[i].tFin + 1 == tiempoActual){

                estado = "F";
            }
            // Se registra el estado del proceso en el tiempo actual
            gantt[procesos[i].id][tiempoActual] = estado;
        }

        // Ejecuta el proceso
        if(ejecutando != null){

            ejecutando.restante--;

            if(ejecutando.restante == 0){
                // Guarda el tiempo en el que terminó
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

// Grafico tipo GANTT 
function renderGantt(gantt, totalTiempo){

    let tabla = document.getElementById("gantt-chart");

    let texto = "<tr><th>Proceso</th>";

    for(let t = 0; t <= totalTiempo; t++){

        texto += "<th>" + t + "</th>";
    }

    texto += "</tr>";

    for(let i = 0; i < nombres.length; i++){

        texto += "<tr>";

        texto += "<td>" + nombres[i] + "</td>";

        for(let t = 0; t <= totalTiempo; t++){

            let estado = "";

            if(gantt[nombres[i]][t] != undefined){

                estado = gantt[nombres[i]][t];
            }

            texto += "<td class='estado-" + estado + "'>";
            texto += estado;
            texto += "</td>";
        }

        texto += "</tr>";
    }

    tabla.innerHTML = texto;
}

// Resultados
function renderResultados(historial){

    let body = document.getElementById("body-resultados");

    let texto = "";

    let sumaRetorno = 0;
    let sumaEspera = 0;

    for(let i = 0; i < procesos.length; i++){

        let retorno = procesos[i].tFin - procesos[i].tLlegada + 1;

        let espera = retorno - procesos[i].tEjecucion;

        sumaRetorno += retorno;
        sumaEspera += espera;

        texto += "<tr>";

        texto += "<td>" + procesos[i].id + "</td>";
        texto += "<td>" + procesos[i].tComienzo + "</td>";
        texto += "<td>" + procesos[i].tFin + "</td>";
        texto += "<td>" + retorno + "</td>";
        texto += "<td>" + espera + "</td>";

        texto += "</tr>";
    }

    body.innerHTML = texto;

    let promedioRetorno = (sumaRetorno / numProcesos).toFixed(2);
    let promedioEspera = (sumaEspera / numProcesos).toFixed(2);

    document.getElementById("promedios-fcfs").innerHTML =
        "<p>Promedio Retorno: " +
        promedioRetorno +
        " | Promedio Espera: " +
        promedioEspera +
        "</p>";

    renderColaGrafica(historial);
}

// Cola gráfica
function renderColaGrafica(historial){

    let container = document.getElementById("cola-container");

    let texto = "";

    for(let i = 0; i < historial.length; i++){

        texto += "<div class='cola-instante'>";

        texto += "<header>T:" + historial[i].t + "</header>";

        if(historial[i].lista.length == 0){

            texto += "<div>-</div>";
        }
        else{

            for(let j = 0; j < historial[i].lista.length; j++){

                texto += "<div>" + historial[i].lista[j] + "</div>";
            }
        }

        texto += "</div>";
    }

    container.innerHTML = texto;
}

// Mostrar tabla inicial
function renderEntrada(){

    let texto = "";

    for(let i = 0; i < procesos.length; i++){

        texto += "<tr>";
        texto += "<td>" + procesos[i].id + "</td>";
        texto += "<td>" + procesos[i].tEjecucion + "</td>";
        texto += "<td>" + procesos[i].tLlegada + "</td>";
        texto += "</tr>";
    }

    document.getElementById("body-entrada").innerHTML = texto;
}

// Iniciar
renderEntrada();
simularFCFS();