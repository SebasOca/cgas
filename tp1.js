let espaciado;
let grosorLinea;


function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 1);
  background(15);
}

function draw() {

}


function lineasFondo() {
  let numCapas = floor(random(3, 6));
  let capas = [];

  background(15);
  espaciado = floor(random(4, 7));
  grosorLinea = (espaciado / numCapas) * 0.9;
  strokeWeight(grosorLinea);
  strokeCap(SQUARE);

  capas.push({
    c1: color(random(360), random(80, 100), random(80, 100)),
    c2: color(random(360), random(80, 100), random(80, 100))
  });

  for (let i = 0; i < capas.length; i++) {
    let capa = capas[i];
    let desfaseX = i * (espaciado / numCapas);

    for (let x = 0; x < width; x += espaciado) {
      let porcentaje = map(x, 0, width, 0, 1);
      let colorLinea = lerpColor(capa.c1, capa.c2, porcentaje);
      let posX = x + desfaseX;
      let posY = 0;

      stroke(colorLinea);
      line(posX, posY, posX, height);
    }
  }
}


function cuadrosInternos() {
  let numCapas = floor(random(2, 5));

  grosorLinea = (espaciado / numCapas) * 0.9;
  strokeWeight(grosorLinea);
  strokeCap(SQUARE);

  let capas = [];

  for (let i = 1; i < numCapas; i++) {
    capas.push({
      x: random(width * 0.1, width * 0.5),
      y: random(height * 0.1, height * 0.5),
      w: random(width * 0.3, width * 0.8),
      h: random(height * 0.3, height * 0.8),

      c1: color(random(360), random(70, 100), random(80, 100)),
      c2: color(random(360), random(70, 100), random(80, 100))
    });
  }

  for (let i = 0; i < capas.length; i++) {
    let capa = capas[i];
    let desfaseX = i * (espaciado / numCapas);

    for (let x = 0; x < width; x += espaciado) {
      if (x >= capa.x && x <= capa.x + capa.w) {
        let porcentaje = map(x, capa.x, capa.x + capa.w, 0, 1);
        let colorLinea = lerpColor(capa.c1, capa.c2, porcentaje);
        let posX = x + desfaseX;

        stroke(colorLinea);
        if (posX <= width) {
          line(posX, capa.y, posX, capa.y + capa.h);
        }
      }
    }
  }
}


function mousePressed() {
  lineasFondo();
  cuadrosInternos();
}