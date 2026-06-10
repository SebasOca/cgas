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

function setup() {
  createCanvas(800, 800);
  colorMode(RGB, 255);
  generarObra();
}

function draw() {
  background(15);

  if (keyIsDown(UP_ARROW)) { 
    modificarTamano(1.02);
  } else if (keyIsDown(DOWN_ARROW)) { 
    modificarTamano(0.98);
  }

  let estaPresionado = keyIsDown(77); // Tecla "M" para oscilar

  for (let i = 0; i < capas.length; i++) {
    let capa = capas[i];

    if (estaPresionado && i > 0) {
      capa.x += sin(frameCount * 0.05 + i) * 2;
      capa.y += cos(frameCount * 0.04 + i) * 1.5;

      capa.x = constrain(capa.x, 10, width - capa.w - 10);
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
        let posX_Linea = x + desfaseX;

        if (posX_Linea <= width) {
          line(posX_Linea, capa.y, posX_Linea, capa.y + capa.h);
        }
      }
    }
  }
}

function generarObra() {
  espaciado = floor(random(4, 7));
  numCapas = floor(random(4, 7));
  grosorLinea = (espaciado / numCapas) * 0.9;

  capas = [];

  let paletaElegida = random(paletas);

  // Capa Base
  capas.push({
    x: 0, y: 0, w: width, h: height,
    c1: color(random(paletaElegida)),
    c2: color(random(paletaElegida))
  });

  let margen = 50;

  for (let i = 1; i < numCapas; i++) {
    let posX = random(margen, width * 0.4);
    let posY = random(margen, height * 0.4);
    let anchoMax = (width - margen) - posX;
    let altoMax = (height - margen) - posY;

    capas.push({
      x: posX,
      y: posY,
      w: random(width * 0.3, anchoMax),
      h: random(height * 0.3, altoMax),
      c1: color(random(paletaElegida)),
      c2: color(random(paletaElegida))
    });
  }
}

function mousePressed() {
  generarObra();
}

function modificarTamano(factor) {
  for (let i = 1; i < capas.length; i++) {
    capas[i].w *= factor;
    capas[i].h *= factor;

    capas[i].w = constrain(capas[i].w, 60, width * 0.5);
    capas[i].h = constrain(capas[i].h, 60, height * 0.5);
  }
}
