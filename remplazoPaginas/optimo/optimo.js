// ==========================
// CONFIGURACIÓN
// ==========================
function obtenerConfiguracion() {

    const frames = parseInt(document.getElementById('mem-frames').value);
    const procesos = parseInt(document.getElementById('mem-procesos').value);
    const tiempo = parseInt(document.getElementById('mem-tiempo').value);

    if (isNaN(tiempo) || tiempo < 10 || tiempo > 70) {
        alert("⚠️ El tiempo debe estar entre 10 y 70");
        return null;
    }

    return { frames, procesos, tiempo };
}


// ==========================
// ALGORITMO ÓPTIMO
// ==========================
function simulacionOptima(numFrames, numProcesos, totalTiempos) {

    const referencia = Array.from(
        { length: totalTiempos },
        () => Math.floor(Math.random() * numProcesos) + 1
    );

    const frames = Array(numFrames).fill("-");
    const matriz = Array.from({ length: numFrames }, () =>
        Array(totalTiempos).fill("-")
    );

    const fallos = Array(totalTiempos).fill("");
    let totalFallos = 0;

    for (let t = 0; t < totalTiempos; t++) {

        const paginaActual = referencia[t];

        // HIT
        if (frames.includes(paginaActual)) {

            for (let f = 0; f < numFrames; f++) {
                matriz[f][t] = frames[f];
            }

            continue;
        }

        // FALLO
        totalFallos++;
        fallos[t] = "X";

        const indiceVacio = frames.indexOf("-");

        if (indiceVacio !== -1) {

            frames[indiceVacio] = paginaActual;

        } else {

            let indiceReemplazo = 0;
            let distanciaMaxima = -1;

            for (let f = 0; f < numFrames; f++) {

                const pagina = frames[f];
                let proximoUso = referencia.indexOf(pagina, t + 1);

                if (proximoUso === -1) proximoUso = Infinity;

                if (proximoUso > distanciaMaxima) {
                    distanciaMaxima = proximoUso;
                    indiceReemplazo = f;
                }
            }

            frames[indiceReemplazo] = paginaActual;
        }

        for (let f = 0; f < numFrames; f++) {
            matriz[f][t] = frames[f];
        }
    }

    return {
        referencia,
        matriz,
        fallos,
        totalFallos,
        totalTiempos,
        numFrames
    };
}


// ==========================
// RENDER
// ==========================
function renderTabla(data) {

    let html = `
        <p class="subtitle" style="margin-bottom:20px;">
            TOTAL DE FALLOS:
            <span style="color:#ff3366; font-size:24px;">
                ${data.totalFallos}
            </span>
        </p>
    `;

    html += `<table class="tabla-neon">`;

    // CABECERA
    html += `<thead><tr><th>Demanda</th>`;
    data.referencia.forEach(v => html += `<th>${v}</th>`);
    html += `</tr></thead>`;

    html += `<tbody>`;

    // FILA FALLOS
    html += `<tr><td>Fallo</td>`;
    data.fallos.forEach(f => {
        html += `<td class="${f ? 'fallo-critico' : ''}">${f}</td>`;
    });
    html += `</tr>`;

    // FRAMES
    for (let f = 0; f < data.numFrames; f++) {

        html += `<tr><td style="color:#00E5FF; font-weight:bold;">F${f + 1}</td>`;

        for (let t = 0; t < data.totalTiempos; t++) {
            html += `<td>${data.matriz[f][t]}</td>`;
        }

        html += `</tr>`;
    }

    // TIEMPO
    html += `<tr>
        <td style="color:#FFEA00; font-weight:bold;">Tiempo</td>`;

    for (let t = 0; t < data.totalTiempos; t++) {
        html += `<td style="color:#FFEA00;">${t + 1}</td>`;
    }

    html += `</tr>`;

    html += `</tbody></table>`;

    const contenedor = document.getElementById('resultado');
    contenedor.innerHTML = html;

    // UX: scroll automático
    contenedor.scrollIntoView({ behavior: 'smooth' });
}


// ==========================
// EVENTOS
// ==========================
document.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById('btn-ejecutar');

    btn.addEventListener('click', () => {

        const config = obtenerConfiguracion();
        if (!config) return;

        // Feedback visual
        btn.innerText = "PROCESANDO...";
        btn.disabled = true;

        setTimeout(() => {

            const data = simulacionOptima(
                config.frames,
                config.procesos,
                config.tiempo
            );

            renderTabla(data);

            btn.innerText = "EJECUTAR SIMULACIÓN";
            btn.disabled = false;

        }, 200);
    });

});