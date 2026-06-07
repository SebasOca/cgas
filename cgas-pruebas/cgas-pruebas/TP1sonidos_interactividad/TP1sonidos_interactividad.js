let espaciado;
let grosorLinea;
let capas = [];
let numCapas;

const paletas = [
  // Paleta 1: Cálidos y Cian (Amarillos, Naranjas, Celestes)
  ['#FFBD00', '#FF5400', '#00B4D8', '#03045E', '#9D4EDD'],
  // Paleta 2: Tierra y Azul Profundo (Óxidos, Crema, Azul Marino)
  ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
  // Paleta 3: Tonos Bosque y Magenta (Verdes oscuros, Teal, Vino)
  ['#0F4C5C', '#5F0F40', '#9A031E', '#FB8B24', '#E36414'],
  // Paleta 4: Etéreos y Pasteles (Verde agua, Lavanda, Durazno)
  ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#D4A373', '#B5838D']
];

function setup() {
  createCanvas(600, 600);
  colorMode(RGB, 255);
  generarObra();
}

function draw() {
  background(15);

  // CONTROL DE TAMAÑO: Mantené apretada la Flecha Arriba o Flecha Abajo
  if (keyIsDown(UP_ARROW)) { 
    modificarTamano(1.02); // Agranda un 2% por frame
  } else if (keyIsDown(DOWN_ARROW)) { 
    modificarTamano(0.98); // Achica un 2% por frame
  }

  let estaPresionado = keyIsDown(49); // Tecla 1 para oscilar

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

  let margen = 40;

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

    capas[i].w = constrain(capas[i].w, 20, width * 0.9);
    capas[i].h = constrain(capas[i].h, 20, height * 0.9);
  }
}
