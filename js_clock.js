/**JS para el algoritmo de clock ejecuta el remplazo de paginas Clock con el uso de un puntero circular 
 * Traemos los datos del HTML para poder manipularlos
 * @param {number} numFrames -cantidad de marcos 4 u 8
 * @param {number} numProcesos -universo de paginas 8 0 16
 * @param {number} duracionTiempo -paos de la simulacion 10 a 70
 * @param {Array} secuenciaDemanda -secuencia fijada opcional del ejemplo en clase
*/
/**
 * Lógica del Algoritmo Clock (Segunda Oportunidad) para Gestión de Memoria
 */
// Función principal para correr el algoritmo de reemplazo de páginas Clock
function ejecutarSimulacionReloj(numFrames, numProcesos, duracionTiempo, secuenciaDemanda = null) {

    // Si el usuario no mandó una secuencia fija desde el Excel, creamos una aleatoria
    if (secuenciaDemanda == null) {
        secuenciaDemanda = [];
        for (let i = 0; i < duracionTiempo; i++) {
            // Elige una página al azar desde 0 hasta el límite de procesos menos 1
            let paginaAleatoria = Math.floor(Math.random() * numProcesos);
            secuenciaDemanda.push(paginaAleatoria);
        }
    } else {
        // Si usamos los datos precargados, el tiempo se adapta al tamaño de la lista
        duracionTiempo = secuenciaDemanda.length;
    }

    // Creamos los marcos de memoria inicialmente vacíos
    // Cada posición adentro va a guardar: [Número de Página, Bit de Uso]
    let frames = [];
    for (let i = 0; i < numFrames; i++) {
        frames.push([null, 0]); // Iniciamos con null (vacío) y el bit en 0
    }

    let puntero = 0; // La manecilla del reloj que inicia en el Frame 1 (índice 0)
    let totalFallos = 0; // Contador total de fallos de página
    let historialPasos = []; // Lista para guardar los resultados de cada segundo

    // Empezamos a recorrer la lista de demandas paso a paso
    for (let t = 0; t < duracionTiempo; t++) {
        let paginaSolicitada = secuenciaDemanda[t]; // La página que se pide en este instante
        let huboFallo = false; // Bandera para saber si se activa el fallo o no

        // 1. Revisamos si la página ya está cargada en la memoria (Acierto / Hit)
        let encontrado = false;
        for (let i = 0; i < numFrames; i++) {
            if (frames[i][0] == paginaSolicitada) {
                frames[i][1] = 1; // Si ya estaba, se activa o mantiene su bit de uso en 1
                encontrado = true;
                break; // Cerramos el ciclo porque ya sabemos que sí está
            }
        }

        // 2. Si la página NO estaba en los marcos, ocurre un Fallo de Página
        if (encontrado == false) {
            huboFallo = true;
            totalFallos = totalFallos + 1; // Sumamos un fallo al total

            // Ciclo para mover la manecilla del reloj y buscar un lugar según el Excel de clase
            while (true) {
                let paginaActual = frames[puntero][0];
                let bitUso = frames[puntero][1];

                // CASO A: Si el marco está completamente vacío, la página entra directo
                // El puntero no avanza, se queda parado en este mismo marco que se llenó
                if (paginaActual == null) {
                    frames[puntero][0] = paginaSolicitada;
                    frames[puntero][1] = 1; // Su bit inicia en 1
                    break; // Rompemos el while porque ya se acomodó la página
                }

                // CASO B: Si el marco está lleno pero su bit es 0, se reemplaza la página vieja
                // El puntero tampoco avanza aquí, se queda quieto apuntando al cambio
                else if (bitUso == 0) {
                    frames[puntero][0] = paginaSolicitada;
                    frames[puntero][1] = 1; // Inicia en 1 de nuevo
                    break; // Rompemos el while porque el reemplazo terminó
                }

                // CASO C: Si el marco está lleno y su bit es 1, pierde su oportunidad
                // El bit baja a 0 y la manecilla avanza al siguiente marco de forma circular
                else {
                    frames[puntero][1] = 0; // Baja el bit a 0
                    puntero = (puntero + 1) % numFrames; // Avanza usando el residuo matemático
                }
            }
        }

        // 3. Clonamos el estado de los marcos en este segundo para la tabla
        // Esto evita que los cambios de los siguientes segundos borren el pasado
        let copiaMarcos = [];
        for (let i = 0; i < numFrames; i++) {
            copiaMarcos.push([frames[i][0], frames[i][1]]);
        }

        // 4. Guardamos los datos de este paso para mandarlos al HTML
        // Si hubo fallo, el asterisco '*' se va a pintar exactamente en el marco donde paró el puntero
        historialPasos.push({
            tiempo: t + 1,
            demanda: paginaSolicitada,
            fallo: huboFallo ? "X" : "",
            estadoFrames: copiaMarcos,
            punteroEn: huboFallo ? puntero : -1 // Si no hubo fallo se guarda -1 para no pintar asterisco
        });
    }

    // Regresamos el objeto con todos los resultados estructurados
    return {
        totalFallos: totalFallos,
        secuencia: secuenciaDemanda,
        historial: historialPasos
    };
}

// Función sencilla para redirigir al usuario al menú principal del proyecto
function regresarAlMain() {
    window.location.href = "index.html";
}