function tresCirculos() {
  circulo(posXCirculos, posXCirculos+244, posYCirculos, color(5, 7, 50), color(104, 58, 46), color(152, 92, 44));
  circulo(posXCirculos+55, posXCirculos+299, posYCirculos-74, color(33, 66, 172), color(24, 48, 120), color(51, 20, 0));
  circulo(posXCirculos+105, posXCirculos+349, posYCirculos, color(115, 135, 97), color(141, 125, 75), color(202, 195, 84));
}

function circulo(posX1, posX2, posY1, colorSup, colorMed, colorInf) {
  push();
  for (let i = 0; i < 31; i++) {
    let alturaLinea = 51 * i / (3 + i / 3.3);
    let posXAz = posX1 + i * 4;
    let posXAz2 = posX2 - i * 4;

    for (let j = 0; j < alturaLinea; j++) {
      let degradado = map(j, 0, alturaLinea, 0, 1);

      let colorDegSup = lerpColor(colorMed, colorSup, degradado);
      stroke(colorDegSup);
      line(posXAz, posY1 - j, posXAz + 1, posY1 - j);
      line(posXAz2, posY1 - j, posXAz2 + 1, posY1 - j);

      let colorDegInf = lerpColor(colorMed, colorInf, degradado);
      stroke(colorDegInf);
      line(posXAz, posY1 + j, posXAz + 1, posY1 + j);
      line(posXAz2, posY1 + j, posXAz2 + 1, posY1 + j);
    }
  }
  pop();
}
