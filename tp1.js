let obra;
let colorLineaArriba0, colorLineaArriba1, colorLineaArriba2, colorLineaArriba3, colorLineaArriba4, colorLineaArriba5, colorLineaArriba6, colorLineaArriba7, colorLineaArriba8, colorLineaArriba9, colorLineaArriba10, colorLineaArriba11;
let colorLineaMedio0, colorLineaMedio1, colorLineaMedio2, colorLineaMedio3, colorLineaMedio4, colorLineaMedio5, colorLineaMedio6, colorLineaMedio7, colorLineaMedio8, colorLineaMedio9, colorLineaMedio10, colorLineaMedio11;
let colorLineaAbajo0, colorLineaAbajo1, colorLineaAbajo2, colorLineaAbajo3, colorLineaAbajo4, colorLineaAbajo5, colorLineaAbajo6, colorLineaAbajo7, colorLineaAbajo8, colorLineaAbajo9, colorLineaAbajo10, colorLineaAbajo11;
let colorAz1, colorAz2, colorAz3, colorAm1, colorAm2, colorAm3, colorNar1, colorNar2, colorNar3;

let posXFondo = 0;
let posXCuadrados = 26;
let posYCuadrados = 83;


function preload() {
  colorLineaArriba0 = color (16, 32, 25, 100);
  colorLineaArriba1 = color (113, 133, 103, 100);
  colorLineaArriba2 = color (36, 76, 101, 100);
  colorLineaArriba3 = color (21, 39, 38, 100);
  colorLineaArriba4 = color (121, 151, 115, 100);
  colorLineaArriba5 = color (37, 68, 89, 100);
  colorLineaArriba6 = color (5, 24, 38, 100);
  colorLineaArriba7 = color (115, 159, 151, 100);
  colorLineaArriba8 = color (40, 79, 86, 100);
  colorLineaArriba9 = color (12, 29, 20, 100);
  colorLineaArriba10 = color (110, 139, 145, 100);
  colorLineaArriba11 = color (45, 90, 108, 100);

  colorLineaMedio0 = color (23, 37, 47, 50);
  colorLineaMedio1 = color (25, 35, 47, 50);
  colorLineaMedio2 = color (74, 59, 36, 50);
  colorLineaMedio3 = color (25, 28, 27, 50);
  colorLineaMedio4 = color (91, 87, 83, 50);
  colorLineaMedio5 = color (100, 79, 55, 50);
  colorLineaMedio6 = color (19, 30, 29, 50);
  colorLineaMedio7 = color (81, 78, 89, 50);
  colorLineaMedio8 = color (127, 110, 89, 50);
  colorLineaMedio9 = color (29, 34, 43, 50);
  colorLineaMedio10 = color (87, 78, 83, 50);
  colorLineaMedio11 = color (116, 97, 86, 50);

  colorLineaAbajo0 = color (30, 64, 83, 100);
  colorLineaAbajo1 = color (40, 39, 21, 100);
  colorLineaAbajo2 = color (118, 144, 92, 100);
  colorLineaAbajo3 = color (45, 82, 79, 100);
  colorLineaAbajo4 = color (48, 46, 29, 100);
  colorLineaAbajo5 = color (129, 153, 112, 100);
  colorLineaAbajo6 = color (21, 75, 68, 100);
  colorLineaAbajo7 = color (43, 54, 20, 100);
  colorLineaAbajo8 = color (121, 149, 118, 100);
  colorLineaAbajo9 = color (20, 52, 60, 100);
  colorLineaAbajo10 = color (34, 34, 12, 100);
  colorLineaAbajo11 = color (124, 144, 98, 100);
}

function setup() {
  createCanvas (800, 800);
  background('#222222');
}

function draw() {
  fondoRayado();
  cuadrados();
  push();
  rotate(0.0046);
  pop();
  movimiento();
}

function movimiento () {
  if (keyIsPressed === true) {
    if (keyCode === LEFT_ARROW) {
      posXCuadrados= posXCuadrados-4;
    } else if (keyCode === RIGHT_ARROW) {
      posXCuadrados= posXCuadrados+4;
    } else if (keyCode === UP_ARROW) {
      posYCuadrados= posYCuadrados-4;
    } else if (keyCode === DOWN_ARROW) {
      posYCuadrados= posYCuadrados+4;
    }
  }
}
