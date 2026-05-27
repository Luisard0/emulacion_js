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
function ejecutarSimulacionReloj(numFrames, numProcesos, duracionTiempo, secuenciaDemanda = null) {
    
    // 1. Crear la secuencia de páginas si el usuario no metió una predeterminada
    if (secuenciaDemanda == null) {
        secuenciaDemanda = [];
        for (let i = 0; i < duracionTiempo; i++) {
            // Genera números aleatorios desde 0 hasta la cantidad de procesos - 1
            let paginaAleatoria = Math.floor(Math.random() * numProcesos);
            secuenciaDemanda.push(paginaAleatoria);
        }
    } else {
        // Si usamos el Excel precargado, el tiempo se adapta al tamaño de la lista
        duracionTiempo = secuenciaDemanda.length;
    }   
    
    // 2. Crear los marcos de memoria (Frames) vacíos
    // Cada marco será un arreglo simple con dos datos: [Página, Bit]
    let frames = [];
    for (let i = 0; i < numFrames; i++) {
        frames.push([null, 0]); // null significa que el espacio está vacío
    }

    let puntero = 0; // Apuntador del reloj que inicia en el índice 0 (Frame 1)
    let totalFallos = 0;
    let historialPasos = [];

    // 3. Empezar la simulación segundo a segundo
    for (let t = 0; t < duracionTiempo; t++) {
        let paginaSolicitada = secuenciaDemanda[t]; // Página que se necesita en este segundo
        let huboFallo = false;

        // Comprobar si la página ya está en la memoria RAM (Acierto / Hit)
        let encontrado = false;
        for (let i = 0; i < numFrames; i++) {
            if (frames[i][0] == paginaSolicitada) {
                frames[i][1] = 1; // Le damos una segunda oportunidad poniendo su bit en 1
                encontrado = true;
                break; // Detener la búsqueda porque ya se encontró
            }
        }

        // Si la página NO se encontró, ocurre un Fallo de Página y se aplica el reloj
        if (encontrado == false) {
            huboFallo = true;
            totalFallos = totalFallos + 1;

            // Bucle para mover la manecilla del reloj hasta encontrar un espacio
            while (true) {
                let paginaActual = frames[puntero][0];
                let bitUso = frames[puntero][1];

                // CASO 1: Si el cuadro está vacío o su bit de uso es 0, lo reemplazamos
                if (paginaActual == null || bitUso == 0) {
                    frames[puntero][0] = paginaSolicitada; // Colocamos la nueva página
                    frames[puntero][1] = 1; // Su bit inicia activado en 1
                    
                    // Avanzar el puntero circularmente a la siguiente posición
                    puntero = (puntero + 1) % numFrames;
                    break; // Romper el ciclo de búsqueda porque ya se alojó la página
                } 
                // CASO 2: Si el bit es 1, pierde su oportunidad, baja a 0 y avanza la manecilla
                else {
                    frames[puntero][1] = 0; // El bit de presencia baja a 0
                    puntero = (puntero + 1) % numFrames; // Avanzar circularmente
                }
            }
        }

        // 4. Clonar el estado de los marcos en este segundo de tiempo
        // Esto evita que los cambios futuros borren los datos de los segundos pasados
        let copiaMarcos = [];
        for (let i = 0; i < numFrames; i++) {
            copiaMarcos.push([frames[i][0], frames[i][1]]);
        }

        // Calcular en qué marco exacto se detuvo el apuntador físico
        let marcoApuntador = (puntero - 1 + numFrames) % numFrames;

        // Guardar todos los detalles de este paso para poder pintar la tabla al final
        historialPasos.push({
            tiempo: t + 1,
            demanda: paginaSolicitada,
            fallo: huboFallo ? "X" : "",
            estadoFrames: copiaMarcos,
            punteroEn: huboFallo ? marcoApuntador : -1 // Si no hubo fallo, el puntero no se mueve gráficamente
        });
    }

    // 5. Devolver los resultados estructurados listos para el HTML
    return {
        totalFallos: totalFallos,
        secuencia: secuenciaDemanda,
        historial: historialPasos
    };
}