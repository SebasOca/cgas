// ============================================================
//  TP1 — CONTROL POR VOZ
//  Obra visual generativa controlada por micrófono
// ============================================================
//
//  MAPA DE CONTROLES DE VOZ:
//  ─────────────────────────────────────────────────────────
//  GRAVE   (freq 100–150 Hz) → Aumenta tamaño  [↑]
//  AGUDO   (freq 200–250 Hz) → Reduce tamaño   [↓]
//  MUY GRAVE (freq < 100 Hz) → Temblor         [ESPACIO]
//  FRECUENCIA ALTA (> 250 Hz)→ Movimiento ondulante [M]
//  SILENCIO (≥ 7 seg)        → Regenerar obra  [click]
//
//  TECLAS DE RESPALDO (siguen funcionando):
//  ↑ ↓  espacio  M   click
// ============================================================

// ──────────────────────────────────────────────────────────
//  CONFIGURACIÓN DE SONIDO
// ──────────────────────────────────────────────────────────

// Amplitud — se calibra automáticamente. Estos son valores
// de arranque conservadores; el sistema los ajusta en tiempo real.
let AMP_MIN = 0.002;
let AMP_MAX = 0.15;

// Nota MIDI: Do3 (48) ≈ 131 Hz  — La4 (69) ≈ 440 Hz
// Usamos notas MIDI porque el GestorSenial trabaja en escala lineal.
// Rango de interés: ~60 Hz (nota 35) — ~350 Hz (nota 77)
let NOTA_MIN = 35;   // ≈  62 Hz  (extremo grave útil)
let NOTA_MAX = 77;   // ≈ 392 Hz  (extremo agudo útil)

// Umbral de amplitud para considerar que "hay sonido"
let UMBRAL_SONIDO = 0.08;

// Silencio prolongado → regenerar obra (en milisegundos)
let UMBRAL_SILENCIO_LARGO = 7000; // 7 segundos

// ──────────────────────────────────────────────────────────
//  RANGOS DE FRECUENCIA → ACCIONES
//  (expresados en Hz reales para claridad)
//
//  < 100 Hz  → temblor
//  100–150 Hz → aumentar tamaño
//  200–250 Hz → reducir tamaño
//  > 250 Hz  → movimiento ondulante
// ──────────────────────────────────────────────────────────
const FREC_TEMBLOR_MAX   = 100;
const FREC_GRAVE_MIN     = 100;
const FREC_GRAVE_MAX     = 150;
const FREC_AGUDO_MIN     = 200;
const FREC_AGUDO_MAX     = 250;
const FREC_MOVIMIENTO_MIN = 250;

// ──────────────────────────────────────────────────────────
//  VARIABLES DE AUDIO
// ──────────────────────────────────────────────────────────
let mic;
let pitch;
let audioIniciado = false;

const MODEL_URL =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

// Valores crudos del micrófono
let amp  = 0;
let frec = 0;
let notaMidi = 0;

// Gestores (suavizan y normalizan la señal)
let gestorAmp;
let gestorFrec;

// Valores procesados
let intensidad = 0; // amplitud suavizada, rango 0–1
let altura     = 0; // pitch suavizado, rango 0–1
let frecActual = 0; // frecuencia en Hz reconstruida desde notaMidi

// Calibración automática de amplitud
let pisoAmp  = Infinity;
let techoAmp = -Infinity;
let calibrandoAmp = true; // siempre activo al inicio

// Detección de sonido / silencio
let haySonido         = false;
let antesHabiaSonido  = false;
let empezoElSonido    = false;
let terminoElSonido   = false;

let marcaInicioSonido = 0;
let marcaFinSonido    = 0;
let durSilencio       = 0;

// Flags de acción por voz (activos mientras la condición se cumple)
let vozGrave      = false; // aumentar tamaño
let vozAgudo      = false; // reducir tamaño
let vozTemblor    = false; // temblor (muy grave)
let vozMovimiento = false; // movimiento ondulante (agudo alto)

// ──────────────────────────────────────────────────────────
//  VARIABLES DE LA OBRA (igual que el original)
// ──────────────────────────────────────────────────────────
let espaciado;
let grosorLinea;
let capas = [];
let numCapas;

const paletas = [
  ['#FFBD00', '#FF5400', '#00B4D8', '#03045E', '#9D4EDD'],
  ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
  ['#0F4C5C', '#5F0F40', '#9A031E', '#FB8B24', '#E36414'],
  ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#D4A373', '#B5838D']
];

let intensidadTemblor = 0;

// ──────────────────────────────────────────────────────────
//  SETUP
// ──────────────────────────────────────────────────────────
function setup() {
  createCanvas(800, 800);
  colorMode(RGB, 255);

  // Inicializar gestores de señal
  gestorAmp  = new GestorSenial(AMP_MIN,  AMP_MAX);
  gestorFrec = new GestorSenial(NOTA_MIN, NOTA_MAX);

  generarObra();
}

// ──────────────────────────────────────────────────────────
//  DRAW — bucle principal
// ──────────────────────────────────────────────────────────
function draw() {

  // ── Pantalla de espera antes de que el usuario active el mic ──
  if (!audioIniciado) {
    background(15);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(22);
    text("Hacé click o tocá la pantalla para\nactivar el micrófono", width / 2, height / 2);
    textSize(13);
    fill(150);
    text("La obra se controla con la voz", width / 2, height / 2 + 60);
    return;
  }

  // ── Análisis de audio ──
  analizarAudio();

  // ── Acciones por voz (reemplazan a los botones) ──
  let aumentarTamanio  = vozGrave      || keyIsDown(UP_ARROW);
  let reducirTamanio   = vozAgudo      || keyIsDown(DOWN_ARROW);
  let temblorActivo    = vozTemblor    || keyIsDown(32);   // 32 = espacio
  let movimientoActivo = vozMovimiento || keyIsDown(77);   // 77 = M

  // ── Lógica de tamaño ──
  if (aumentarTamanio) {
    modificarTamano(1.02);
  } else if (reducirTamanio) {
    modificarTamano(0.98);
  }

  // ── Lógica de temblor ──
  if (temblorActivo) {
    intensidadTemblor = min(intensidadTemblor + 0.3, 12);
  } else {
    intensidadTemblor = max(intensidadTemblor - 0.5, 0);
  }

  // ── Silencio largo → regenerar obra (equivale a mousePressed) ──
  if (!haySonido && durSilencio >= UMBRAL_SILENCIO_LARGO) {
    generarObra();
    // Reinicia el contador para no regenerar cada frame
    marcaFinSonido = millis();
    durSilencio    = 0;
  }

  // ── Dibujo de capas ──
  background(15);

  for (let i = 0; i < capas.length; i++) {
    let capa = capas[i];

    // Movimiento ondulante
    if (movimientoActivo && i > 0) {
      capa.x += sin(frameCount * 0.05 + i) * 2;
      capa.y += cos(frameCount * 0.04 + i) * 1.5;
      capa.x = constrain(capa.x, 10, width  - capa.w - 10);
      capa.y = constrain(capa.y, 10, height - capa.h - 10);
    }

    let desfaseX = i * (espaciado / numCapas);

    strokeWeight(grosorLinea);
    strokeCap(SQUARE);

    for (let x = 0; x < width; x += espaciado) {
      if (x >= capa.x && x <= capa.x + capa.w) {

        let porcentaje = map(x, capa.x, capa.x + capa.w, 0, 1);
        let colorLinea = lerpColor(capa.c1, capa.c2, porcentaje);
        stroke(colorLinea);

        let temX = (i > 0 && intensidadTemblor > 0)
          ? random(-intensidadTemblor, intensidadTemblor) : 0;
        let temY = (i > 0 && intensidadTemblor > 0)
          ? random(-intensidadTemblor * 0.5, intensidadTemblor * 0.5) : 0;

        let posX_Linea = x + desfaseX + temX;
        if (posX_Linea <= width) {
          line(posX_Linea, capa.y + temY, posX_Linea, capa.y + capa.h + temY);
        }
      }
    }
  }

  // ── HUD de monitoreo (pulsar H para ocultar) ──
  if (mostrarHUD) {
    dibujarHUD();
  }
}

// ──────────────────────────────────────────────────────────
//  ANÁLISIS DE AUDIO
//  Lee el micrófono, actualiza gestores y determina qué
//  acción de voz está activa según la frecuencia detectada.
// ──────────────────────────────────────────────────────────
function analizarAudio() {

  amp = mic.getLevel();

  // Calibración automática de rango de amplitud
  if (calibrandoAmp) {
    pisoAmp  = min(pisoAmp,  amp);
    techoAmp = max(techoAmp, amp);
    // Actualizar el gestor con los extremos capturados
    gestorAmp.minimo = pisoAmp  + 0.0001; // evitar división por cero
    gestorAmp.maximo = max(techoAmp, pisoAmp + 0.01);
  }

  gestorAmp.actualizar(amp);
  intensidad = gestorAmp.filtrada;

  // Determinar si hay sonido
  haySonido        = intensidad > UMBRAL_SONIDO;
  empezoElSonido   = haySonido && !antesHabiaSonido;
  terminoElSonido  = !haySonido && antesHabiaSonido;

  if (empezoElSonido) {
    marcaInicioSonido = millis();
    durSilencio       = 0;
  }

  if (terminoElSonido) {
    marcaFinSonido = millis();
  }

  if (!haySonido) {
    durSilencio = millis() - marcaFinSonido;
  }

  antesHabiaSonido = haySonido;

  // ── Reconstruir frecuencia en Hz desde nota MIDI suavizada ──
  // notaMidi se actualiza asincrónicamente desde getPitch()
  gestorFrec.actualizar(notaMidi);
  altura = gestorFrec.filtrada;

  // El GestorSenial normaliza entre NOTA_MIN y NOTA_MAX.
  // Deshacer la normalización para obtener Hz.
  let notaMidiSuavizada = map(altura, 0, 1, NOTA_MIN, NOTA_MAX);
  frecActual = (notaMidi > 0) ? midiToFreq(notaMidiSuavizada) : 0;

  // ── Clasificar acción según rango de frecuencia ──
  if (haySonido && frecActual > 0) {
    vozTemblor    = frecActual <  FREC_TEMBLOR_MAX;
    vozGrave      = frecActual >= FREC_GRAVE_MIN     && frecActual < FREC_GRAVE_MAX;
    vozAgudo      = frecActual >= FREC_AGUDO_MIN     && frecActual < FREC_AGUDO_MAX;
    vozMovimiento = frecActual >= FREC_MOVIMIENTO_MIN;
  } else {
    // Sin sonido: apagar todos los controles de voz
    vozTemblor    = false;
    vozGrave      = false;
    vozAgudo      = false;
    vozMovimiento = false;
  }
}

// ──────────────────────────────────────────────────────────
//  HUD DE MONITOREO
// ──────────────────────────────────────────────────────────
let mostrarHUD = true;

function dibujarHUD() {
  push();
  fill(0, 0, 0, 170);
  noStroke();
  rect(0, 0, 260, 220, 0, 0, 8, 0);

  textAlign(LEFT, BASELINE);
  textSize(11);

  let col  = (v) => v ? color(80, 255, 120) : color(100);
  let tick = (v) => v ? "●" : "○";

  fill(180);
  text("CONTROL POR VOZ  [H para ocultar]", 10, 18);

  fill(200);
  text("Amp:  " + amp.toFixed(4) +
       "  |  Intensidad: " + intensidad.toFixed(2), 10, 38);
  text("Frec: " + frecActual.toFixed(1) + " Hz" +
       "  |  MIDI: " + notaMidi.toFixed(1), 10, 54);
  text("Silencio: " + (durSilencio / 1000).toFixed(1) +
       " s  /  " + (UMBRAL_SILENCIO_LARGO / 1000) + " s", 10, 70);

  // Indicadores de acción
  let y = 94;
  fill(col(vozTemblor || keyIsDown(32)));
  text(tick(vozTemblor || keyIsDown(32)) +
       "  TEMBLOR     < " + FREC_TEMBLOR_MAX + " Hz  [espacio]", 10, y);

  y += 18;
  fill(col(vozGrave || keyIsDown(UP_ARROW)));
  text(tick(vozGrave || keyIsDown(UP_ARROW)) +
       "  TAMAÑO +    " + FREC_GRAVE_MIN + "–" + FREC_GRAVE_MAX + " Hz  [↑]", 10, y);

  y += 18;
  fill(col(vozAgudo || keyIsDown(DOWN_ARROW)));
  text(tick(vozAgudo || keyIsDown(DOWN_ARROW)) +
       "  TAMAÑO -    " + FREC_AGUDO_MIN + "–" + FREC_AGUDO_MAX + " Hz  [↓]", 10, y);

  y += 18;
  fill(col(vozMovimiento || keyIsDown(77)));
  text(tick(vozMovimiento || keyIsDown(77)) +
       "  MOVIMIENTO  > " + FREC_MOVIMIENTO_MIN + " Hz  [M]", 10, y);

  y += 18;
  let silLargo = (!haySonido && durSilencio >= UMBRAL_SILENCIO_LARGO * 0.5);
  fill(col(silLargo));
  text(tick(silLargo) +
       "  REGENERAR   silencio " + (UMBRAL_SILENCIO_LARGO / 1000) + " s  [click]", 10, y);

  pop();
}

// ──────────────────────────────────────────────────────────
//  GENERACIÓN DE OBRA (igual que el original)
// ──────────────────────────────────────────────────────────
function generarObra() {
  espaciado  = floor(random(4, 7));
  numCapas   = floor(random(4, 7));
  grosorLinea = (espaciado / numCapas) * 0.9;
  intensidadTemblor = 0;
  capas = [];

  let paletaElegida = random(paletas);

  capas.push({
    x: 0, y: 0, w: width, h: height,
    c1: color(random(paletaElegida)),
    c2: color(random(paletaElegida))
  });

  let margen = 50;
  for (let i = 1; i < numCapas; i++) {
    let posX    = random(margen, width  * 0.4);
    let posY    = random(margen, height * 0.4);
    let anchoMax = (width  - margen) - posX;
    let altoMax  = (height - margen) - posY;

    capas.push({
      x: posX, y: posY,
      w: random(width  * 0.3, anchoMax),
      h: random(height * 0.3, altoMax),
      c1: color(random(paletaElegida)),
      c2: color(random(paletaElegida))
    });
  }
}

function modificarTamano(factor) {
  for (let i = 1; i < capas.length; i++) {
    capas[i].w *= factor;
    capas[i].h *= factor;
    capas[i].w = constrain(capas[i].w, 60, width  * 0.5);
    capas[i].h = constrain(capas[i].h, 60, height * 0.5);
  }
}

// ──────────────────────────────────────────────────────────
//  INICIO DE AUDIO (requiere gesto del usuario)
// ──────────────────────────────────────────────────────────
async function iniciarAudio() {
  if (audioIniciado) return;
  try {
    await userStartAudio();
    mic = new p5.AudioIn();
    mic.start(
      () => {
        audioIniciado    = true;
        marcaFinSonido   = millis();
        marcaInicioSonido = millis();
        startPitch();
      },
      (err) => console.error("No se pudo iniciar el micrófono:", err)
    );
  } catch (err) {
    console.error("Error al habilitar el contexto de audio:", err);
  }
}

// ──────────────────────────────────────────────────────────
//  DETECCIÓN DE PITCH (ML5 — CREPE)
// ──────────────────────────────────────────────────────────
function startPitch() {
  pitch = ml5.pitchDetection(
    MODEL_URL,
    getAudioContext(),
    mic.stream,
    modelLoaded
  );
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (err) { getPitch(); return; }
    if (frequency) {
      frec     = frequency;
      notaMidi = freqToMidi(frequency);
    } else {
      frec     = 0;
      notaMidi = 0;
    }
    getPitch(); // loop asincrónico
  });
}

// ──────────────────────────────────────────────────────────
//  EVENTOS DE ENTRADA
// ──────────────────────────────────────────────────────────
function mousePressed() {
  if (!audioIniciado) {
    iniciarAudio();
  } else {
    generarObra(); // comportamiento original: regenerar al hacer click
  }
}

function touchStarted() {
  iniciarAudio();
  return false;
}

function keyPressed() {
  if (key === "h" || key === "H") {
    mostrarHUD = !mostrarHUD;
  }
  if (key === "c" || key === "C") {
    // Reinicia calibración de amplitud
    pisoAmp  = Infinity;
    techoAmp = -Infinity;
    calibrandoAmp = true;
    console.log("Calibración de amplitud reiniciada");
  }
}
