function cuadrados() {
  push();
  for (let j = 0; j < 100; j = j+10) {
    lineaCuadrado(posXCuadrados+j, posYCuadrados, colorLineaArriba1, colorLineaMedio1, colorLineaAbajo1);
    lineaCuadrado(posXCuadrados+1+j, posYCuadrados, colorLineaArriba2, colorLineaMedio2, colorLineaAbajo2);
    lineaCuadrado(posXCuadrados+2+j, posYCuadrados, colorLineaArriba3, colorLineaMedio3, colorLineaAbajo3);
    lineaCuadrado(posXCuadrados+3+j, posYCuadrados, colorLineaArriba4, colorLineaMedio4, colorLineaAbajo4);
    lineaCuadrado(posXCuadrados+4+j, posYCuadrados, colorLineaArriba5, colorLineaMedio5, colorLineaAbajo5);
    lineaCuadrado(posXCuadrados+5+j, posYCuadrados, colorLineaArriba6, colorLineaMedio6, colorLineaAbajo6);
    lineaCuadrado(posXCuadrados+6+j, posYCuadrados, colorLineaArriba7, colorLineaMedio7, colorLineaAbajo7);
    lineaCuadrado(posXCuadrados+7+j, posYCuadrados, colorLineaArriba8, colorLineaMedio8, colorLineaAbajo8);
    lineaCuadrado(posXCuadrados+8+j, posYCuadrados, colorLineaArriba9, colorLineaMedio9, colorLineaAbajo9);
    lineaCuadrado(posXCuadrados+9+j, posYCuadrados, colorLineaArriba10, colorLineaMedio10, colorLineaAbajo10);
}
  pop();
}

function lineaCuadrado(posX, posY, colorArriba, colorMedio, colorAbajo) {
  for (let x = 0; x < 1; x++) {
    for (let i = 0; i < 10; i++) {
      let intermedio = map(i, -50, 250, 0, 1);

      let degrade = lerpColor(colorArriba, colorMedio, intermedio);
      stroke(degrade);
      line(posX+x, posY+i, posX+0.5+x, posY+100+i);
    }
  }
}
