let espaciado;
let grosorLinea;

// Guardamos las capas internas para poder redibujarlas con escala variable
let capasInternas = [];
let capaFondo = { c1: null, c2: null };
let numCapasFondo = 1;

// Escala de los rectángulos internos
let escala = 1;
let creciendo = false;
let achicando = false;


function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 1);
  background(15);
}

function draw() {
  if (capasInternas.length > 0) {
    if (creciendo) {
      escala += 0.012;
      _redibujar();
    } else if (achicando) {
      escala = max(0.05, escala - 0.012);
      _redibujar();
    }
  }
}


function lineasFondo() {
  numCapasFondo = floor(random(3, 6));

  background(15);
  espaciado = floor(random(4, 7));
  grosorLinea = (espaciado / numCapasFondo) * 0.9;
  strokeWeight(grosorLinea);
  strokeCap(SQUARE);

  capaFondo = {
    c1: color(random(360), random(80, 100), random(80, 100)),
    c2: color(random(360), random(80, 100), random(80, 100))
  };

  let desfaseX = 0;
  for (let x = 0; x < width; x += espaciado) {
    let porcentaje = map(x, 0, width, 0, 1);
    let colorLinea = lerpColor(capaFondo.c1, capaFondo.c2, porcentaje);
    let posX = x + desfaseX;
    stroke(colorLinea);
    line(posX, 0, posX, height);
  }
}


function cuadrosInternos() {
  let numCapas = floor(random(2, 5));

  grosorLinea = (espaciado / numCapas) * 0.9;
  strokeWeight(grosorLinea);
  strokeCap(SQUARE);

  capasInternas = [];

  for (let i = 1; i < numCapas; i++) {
    let w = random(width * 0.3, width * 0.8);
    let h = random(height * 0.3, height * 0.8);
    let x = random(width * 0.1, width * 0.5);
    let y = random(height * 0.1, height * 0.5);

    capasInternas.push({
      // Guardamos centro para escalar desde ahí
      cx: x + w / 2,
      cy: y + h / 2,
      w: w,
      h: h,
      c1: color(random(360), random(70, 100), random(80, 100)),
      c2: color(random(360), random(70, 100), random(80, 100))
    });
  }

  _dibujarCapasInternas();
}


function _dibujarCapasInternas() {
  let numCapas = capasInternas.length;
  strokeWeight(grosorLinea);
  strokeCap(SQUARE);

  for (let i = 0; i < numCapas; i++) {
    let capa = capasInternas[i];
    let desfaseX = i * (espaciado / (numCapas + 1));

    // Aplicar escala desde el centro del rectángulo
    let w = capa.w * escala;
    let h = capa.h * escala;
    let x = capa.cx - w / 2;
    let y = capa.cy - h / 2;

    for (let px = 0; px < width; px += espaciado) {
      if (px >= x && px <= x + w) {
        let porcentaje = map(px, x, x + w, 0, 1);
        let colorLinea = lerpColor(capa.c1, capa.c2, porcentaje);
        let posX = px + desfaseX;
        stroke(colorLinea);
        if (posX <= width) {
          line(posX, y, posX, y + h);
        }
      }
    }
  }
}


function _redibujar() {
  background(15);
  strokeWeight(grosorLinea);
  strokeCap(SQUARE);

  // Redibujar fondo
  for (let x = 0; x < width; x += espaciado) {
    let porcentaje = map(x, 0, width, 0, 1);
    let colorLinea = lerpColor(capaFondo.c1, capaFondo.c2, porcentaje);
    stroke(colorLinea);
    line(x, 0, x, height);
  }

  _dibujarCapasInternas();
}


function mousePressed() {
  escala = 1;
  lineasFondo();
  cuadrosInternos();
}


function keyPressed() {
  if (keyCode === UP_ARROW || key === '+') creciendo = true;
  if (keyCode === DOWN_ARROW || key === '-') achicando = true;
}

function keyReleased() {
  if (keyCode === UP_ARROW || key === '+') creciendo = false;
  if (keyCode === DOWN_ARROW || key === '-') achicando = false;
}
