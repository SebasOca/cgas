function fondoRayado() {
  rotate(0.0046);
  push();
  for (let j = 0; j < 800; j = j+12) {
    lineaFondo(posXFondo+j, 0, colorLineaArriba0, colorLineaMedio0, colorLineaAbajo0);
    lineaFondo(posXFondo+4+j, 0, colorLineaArriba1, colorLineaMedio1, colorLineaAbajo1);
    lineaFondo(posXFondo+8+j, 0, colorLineaArriba2, colorLineaMedio2, colorLineaAbajo2);
    lineaFondo(posXFondo+12+j, 0, colorLineaArriba3, colorLineaMedio3, colorLineaAbajo3);
    lineaFondo(posXFondo+16+j, 0, colorLineaArriba4, colorLineaMedio4, colorLineaAbajo4);
    lineaFondo(posXFondo+20+j, 0, colorLineaArriba5, colorLineaMedio5, colorLineaAbajo5);
    lineaFondo(posXFondo+24+j, 0, colorLineaArriba6, colorLineaMedio6, colorLineaAbajo6);
    lineaFondo(posXFondo+28+j, 0, colorLineaArriba7, colorLineaMedio7, colorLineaAbajo7);
    lineaFondo(posXFondo+32+j, 0, colorLineaArriba8, colorLineaMedio8, colorLineaAbajo8);
    lineaFondo(posXFondo+36+j, 0, colorLineaArriba9, colorLineaMedio9, colorLineaAbajo9);
    lineaFondo(posXFondo+40+j, 0, colorLineaArriba10, colorLineaMedio10, colorLineaAbajo10);
    lineaFondo(posXFondo+44+j, 0, colorLineaArriba11, colorLineaMedio11, colorLineaAbajo11);
  }
  pop();
}

function lineaFondo(posX, posY, colorArriba, colorMedio, colorAbajo) {
  for (let x = 0; x < 1; x++) {
    for (let i = 0; i < 500; i++) {
      let intermedio = map(i, 0, 255, 0, 1);

      strokeWeight(4);

      let degrade = lerpColor(colorArriba, colorMedio, intermedio);
      stroke(degrade);
      line(posX+x, posY+i, posX+1.5+x, posY+400+i);

      let degrade2 = lerpColor(colorMedio, colorAbajo, intermedio);
      stroke(degrade2);
      line(posX+x, posY+i, posX+1.5+x, posY+800+i);
    }
  }
}
