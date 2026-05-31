/**JS para el algoritmo de clock ejecuta el remplazo de paginas Clock con el uso de un puntero circular 
 * Traemos los datos del HTML para poder manipularlos
 * @param {number} numFrames -cantidad de marcos 4 u 8
 * @param {number} numProcesos -universo de paginas 8 0 16
 * @param {number} duracionTiempo -paos de la simulacion 10 a 70
 * @param {Array} secuenciaDemanda -secuencia fijada opcional del ejemplo en clase
*/
// Función principal para correr el algoritmo de reemplazo de páginas Clock
// Función principal para correr el algoritmo de reemplazo de páginas Clock
function ejecutarSimulacionReloj(numFrames, numProcesos, duracionTiempo, secuenciaDemanda = null) {

    // Si el usuario no mandó una secuencia fija desde el Excel, creamos una aleatoria
    if (secuenciaDemanda == null) {
        secuenciaDemanda = [];
        for (let i = 0; i < duracionTiempo; i++) {
            let paginaAleatoria = Math.floor(Math.random() * numProcesos);
            secuenciaDemanda.push(paginaAleatoria);
        }
    } else {
        duracionTiempo = secuenciaDemanda.length;
    }

    // Creamos los marcos de memoria inicialmente vacíos
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
        let marcoApuntadorGuardado = -1; // Nos ayuda a saber en qué fila pintar el asterisco

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

            // Buscamos de forma manual si todavía queda algún marco vacío (Llenado inicial)
            let indiceVacio = -1;
            for (let i = 0; i < numFrames; i++) {
                if (frames[i][0] === null) {
                    indiceVacio = i; // Guardamos la posición del primer hueco libre
                    break; // Salimos del ciclo al encontrar el primero
                }
            }

            // Si encontramos un espacio vacío, metemos la página directamente ahí
            if (indiceVacio !== -1) {
                frames[indiceVacio][0] = paginaSolicitada;
                frames[indiceVacio][1] = 1;
                
                // Mientras se esté llenando la memoria, no mostramos el asterisco en la tabla
                marcoApuntadorGuardado = -1; 
            } 
            // Si ya NO hay espacios vacíos, la memoria está saturada: arranca el algoritmo del reloj
            else {
                let buscador = puntero;

                while (true) {
                    let paginaActual = frames[buscador][0];
                    let bitUso = frames[buscador][1];

                    // Si el bit de uso es 0, encontramos a la víctima para reemplazarla
                    if (bitUso == 0) {
                        frames[buscador][0] = paginaSolicitada;
                        frames[buscador][1] = 1; // Su bit vuelve a iniciar en 1
                        
                        marcoApuntadorGuardado = buscador; // Aquí se queda fijo el asterisco

                        // La manecilla real del reloj avanza un cuadro de forma circular
                        puntero = (buscador + 1) % numFrames;
                        break; // Terminamos la búsqueda
                    } 
                    else {
                        // Segunda oportunidad: bajamos el bit a 0 y avanzamos el buscador al siguiente marco
                        frames[buscador][1] = 0;
                        buscador = (buscador + 1) % numFrames;
                    }
                }
            }
        }

        // 3. Clonamos el estado de los marcos en este segundo para la tabla
        let copiaMarcos = [];
        for (let i = 0; i < numFrames; i++) {
            copiaMarcos.push([frames[i][0], frames[i][1]]);
        }

        // 4. Guardamos los datos de este paso para mandarlos al HTML
        historialPasos.push({
            tiempo: t + 1,
            demanda: paginaSolicitada,
            fallo: huboFallo ? "X" : "",
            estadoFrames: copiaMarcos,
            punteroEn: huboFallo ? marcoApuntadorGuardado : -1
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