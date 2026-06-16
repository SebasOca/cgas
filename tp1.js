//  MAPA DE CONTROLES DE VOZ:
//  ─────────────────────────────────────────────────────────
//  GRAVE   (freq 100–150 Hz) → Aumenta tamaño  [↑]
//  AGUDO   (freq 200–250 Hz) → Reduce tamaño   [↓]
//  MUY GRAVE (freq < 100 Hz) → Temblor         [ESPACIO]
//  FRECUENCIA ALTA (> 250 Hz)→ Movimiento ondulante [M]
//  SILENCIO (≥ 7 seg)        → Regenerar obra  [click]

let AMP_MIN = 0.002;
let AMP_MAX = 0.15;

let NOTA_MIN = 35;   // ≈  62 Hz  (extremo grave útil)
let NOTA_MAX = 77;   // ≈ 392 Hz  (extremo agudo útil)


let UMBRAL_SONIDO = 0.08;
let UMBRAL_SILENCIO_LARGO = 7000;

const FREC_TEMBLOR_MAX   = 100;
const FREC_GRAVE_MIN     = 100;
const FREC_GRAVE_MAX     = 150;
const FREC_AGUDO_MIN     = 200;
const FREC_AGUDO_MAX     = 250;
const FREC_MOVIMIENTO_MIN = 250;


let mic;
let pitch;
let audioIniciado = false;

const MODEL_URL =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

let amp  = 0;
let frec = 0;
let notaMidi = 0;

let gestorAmp;
let gestorFrec;


let intensidad = 0;
let altura     = 0;
let frecActual = 0;

let pisoAmp  = Infinity;
let techoAmp = -Infinity;
let calibrandoAmp = true;


let haySonido         = false;
let antesHabiaSonido  = false;
let empezoElSonido    = false;
let terminoElSonido   = false;

let marcaInicioSonido = 0;
let marcaFinSonido    = 0;
let durSilencio       = 0;


let vozGrave      = false;
let vozAgudo      = false;
let vozTemblor    = false;
let vozMovimiento = false;


let espaciado;
let grosorLinea;
let capas = [];
let numCapas;

let intensidadTemblor = 0;

let mostrarHUD = true;



const paletas = [
  ['#FFBD00', '#FF5400', '#00B4D8', '#03045E', '#9D4EDD'],
  ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
  ['#0F4C5C', '#5F0F40', '#9A031E', '#FB8B24', '#E36414'],
  ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#D4A373', '#B5838D']
];


function setup() {
  createCanvas(1100, 850);
  colorMode(RGB, 255);

  
  gestorAmp  = new GestorSenial(AMP_MIN,  AMP_MAX);
  gestorFrec = new GestorSenial(NOTA_MIN, NOTA_MAX);

  generarObra();
}


function draw() {
  if (!audioIniciado) {
    background(10, 10, 10);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(22);
    text("Clickeá la pantalla para activar el micrófono", width / 2, height / 2);
    textSize(16);
    fill(180);
    text("La obra se controla con la voz", width / 2, height / 2 + 60);
    return;
  }

  analizarAudio();

  let aumentarTamanio  = vozGrave      || keyIsDown(UP_ARROW);
  let reducirTamanio   = vozAgudo      || keyIsDown(DOWN_ARROW);
  let temblorActivo    = vozTemblor    || keyIsDown(32);
  let movimientoActivo = vozMovimiento || keyIsDown(77);

  if (aumentarTamanio) {
    modificarTamano(1.02);
  } else if (reducirTamanio) {
    modificarTamano(0.98);
  }


  if (temblorActivo) {
    intensidadTemblor = min(intensidadTemblor + 0.3, 12);
  } else {
    intensidadTemblor = max(intensidadTemblor - 0.5, 0);
  }

  if (!haySonido && durSilencio >= UMBRAL_SILENCIO_LARGO) {
    generarObra();
    marcaFinSonido = millis();
    durSilencio    = 0;
  }

  background(10, 10, 10);

  for (let i = 0; i < capas.length; i++) {
    let capa = capas[i];

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
  
  if (mostrarHUD) {
    dibujarHUD();
  }
}


function analizarAudio() {
  amp = mic.getLevel();
  if (calibrandoAmp) {
    pisoAmp  = min(pisoAmp,  amp);
    techoAmp = max(techoAmp, amp);
    gestorAmp.minimo = pisoAmp  + 0.0001;
    gestorAmp.maximo = max(techoAmp, pisoAmp + 0.01);
  }

  gestorAmp.actualizar(amp);
  intensidad = gestorAmp.filtrada;

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

  gestorFrec.actualizar(notaMidi);
  altura = gestorFrec.filtrada;

  let notaMidiSuavizada = map(altura, 0, 1, NOTA_MIN, NOTA_MAX);
  frecActual = (notaMidi > 0) ? midiToFreq(notaMidiSuavizada) : 0;

  if (haySonido && frecActual > 0) {
    vozTemblor    = frecActual <  FREC_TEMBLOR_MAX;
    vozGrave      = frecActual >= FREC_GRAVE_MIN     && frecActual < FREC_GRAVE_MAX;
    vozAgudo      = frecActual >= FREC_AGUDO_MIN     && frecActual < FREC_AGUDO_MAX;
    vozMovimiento = frecActual >= FREC_MOVIMIENTO_MIN;
  } else {
    vozTemblor    = false;
    vozGrave      = false;
    vozAgudo      = false;
    vozMovimiento = false;
  }
}


function dibujarHUD() {
  push();
  fill(0, 0, 0, 170);
  strokeCap(ROUND);
  rect(0, 50, 280, 220, 0, 24, 24, 24);
  noStroke();
  textAlign(LEFT, BASELINE);
  

  let col  = (v) => v ? color(80, 255, 120) : color(100);
  let tick = (v) => v ? "●" : "○";

  fill(180);
  textSize(14);
  text("Control por voz  (H para ocultar)", 20, 78);

  textSize(11);

  fill(200);
  text("Amp:  " + amp.toFixed(4) + "  |  Intensidad: " + intensidad.toFixed(2), 20, 98);
  text("Frec: " + frecActual.toFixed(1) + " Hz" + "  |  MIDI: " + notaMidi.toFixed(1), 20, 1014);
  text("Silencio: " + (durSilencio / 1000).toFixed(1) + " s  /  " + (UMBRAL_SILENCIO_LARGO / 1000) + " s", 20, 130);


  let y = 94;
  fill(col(vozTemblor || keyIsDown(32)));
  text(tick(vozTemblor || keyIsDown(32)) + "  TEMBLOR     < " + FREC_TEMBLOR_MAX + " Hz  [espacio]", 20, y + 62);

  y += 18;
  fill(col(vozGrave || keyIsDown(UP_ARROW)));
  text(tick(vozGrave || keyIsDown(UP_ARROW)) + "  TAMAÑO +    " + FREC_GRAVE_MIN + "–" + FREC_GRAVE_MAX + " Hz  [↑]", 20, y + 64);

  y += 18;
  fill(col(vozAgudo || keyIsDown(DOWN_ARROW)));
  text(tick(vozAgudo || keyIsDown(DOWN_ARROW)) + "  TAMAÑO -    " + FREC_AGUDO_MIN + "–" + FREC_AGUDO_MAX + " Hz  [↓]", 20, y + 66);

  y += 18;
  fill(col(vozMovimiento || keyIsDown(77)));
  text(tick(vozMovimiento || keyIsDown(77)) + "  MOVIMIENTO  > " + FREC_MOVIMIENTO_MIN + " Hz  [M]", 20, y + 68);

  y += 18;
  let silLargo = (!haySonido && durSilencio >= UMBRAL_SILENCIO_LARGO * 0.5);
  fill(col(silLargo));
  text(tick(silLargo) + "  REGENERAR   silencio " + (UMBRAL_SILENCIO_LARGO / 1000) + " s  [click]", 20, y + 70);

  pop();
}


function generarObra() {
  espaciado  = floor(random(4, 7));
  numCapas   = floor(random(4, 7));
  grosorLinea = (espaciado / numCapas) * 0.9;
  intensidadTemblor = 0;
  capas = [];

  let paletaElegida = random(paletas);

  capas.push({
    x: 300, y: 50, w: width, h: height,
    c1: color(random(paletaElegida)),
    c2: color(random(paletaElegida))
  });

  let margen = 50;
  for (let i = 1; i < numCapas; i++) {
    let posX    = random(margen + 300, width  * 0.4);
    let posY    = random(margen + 50, height * 0.4);
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
    getPitch();
  });
}


function mousePressed() {
  if (!audioIniciado) {
    iniciarAudio();
  } else {
    generarObra();
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
    pisoAmp  = Infinity;
    techoAmp = -Infinity;
    calibrandoAmp = true;
    console.log("Calibración de amplitud reiniciada");
  }
}
