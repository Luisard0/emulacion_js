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
  setStatus('Datos de ejemplo cargados. Presiona Ejecutar SJF.', '');
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
  setStatus('Datos aleatorizados. Presiona Ejecutar SJF.', '');
}

function renderInput() {
  var tb = document.getElementById('input-tbody');
  tb.innerHTML = '';
  procs.forEach(function (p, i) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + p.pid + '</td>' +
      '<td><input class="cell-input" type="number" min="1" value="' + p.burst + '" oninput="procs[' + i + '].burst=Math.max(1,parseInt(this.value)||1)"></td>' +
      '<td><input class="cell-input" type="number" min="0" value="' + p.arrival + '" oninput="procs[' + i + '].arrival=Math.max(0,parseInt(this.value)||0)"></td>';
    tb.appendChild(tr);
  });
}

/* ── SJF min-heap ─────────────────────────── */
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
  renderGantt(sjfRes);
  renderResults(sjfRes);
  renderCmp(sjfRes, fcfsRes);
  ['gantt-block', 'results-block', 'cmp-block'].forEach(function (id) {
    document.getElementById(id).classList.remove('hidden');
  });
  setStatus('SJF ejecutado — ' + procs.length + ' procesos, tiempo total: ' + sjfRes[sjfRes.length - 1].end + ' u.', 'ok');
}

/* ── GANTT celdas L/E/F ───────────────────── */
function renderGantt(results) {
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

  /* encabezado */
  var thead = document.createElement('thead');
  var hrow = document.createElement('tr');
  var th0 = document.createElement('th');
  th0.className = 'proc-col'; th0.textContent = 'Proceso'; hrow.appendChild(th0);
  for (var t = 0; t <= total; t++) {
    var th = document.createElement('th'); th.textContent = t; hrow.appendChild(th);
  }
  thead.appendChild(hrow); table.appendChild(thead);

  /* cuerpo */
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

/* ── RESULTADOS ───────────────────────────── */
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
      '<td style="color:#3a7bd5;font-weight:600">' + r.turnaround + '</td>' +
      '<td style="color:#d07000;font-weight:600">' + r.waiting + '</td>';
    tbody.appendChild(tr);
  });
  tfoot.innerHTML =
    '<tr><td colspan="5">Promedio</td>' +
    '<td>' + (sumT / n).toFixed(2) + '</td>' +
    '<td>' + (sumW / n).toFixed(2) + '</td></tr>';
}

/* ── COMPARATIVA ──────────────────────────── */
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
      '<td style="' + (better === 'sjf'  ? 'color:#1a7a40;font-weight:600' : '') + '">' + vs.toFixed(2) + '</td>' +
      '<td style="' + (better === 'fcfs' ? 'color:#1a7a40;font-weight:600' : '') + '">' + vf.toFixed(2) + '</td>' +
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

loadDefault();