// Configuración global
let espaciado;
let grosorLinea;

function setup() {
  // 1. Lienzo: Cuadrado de 600x600
  createCanvas(600, 600);
  
  // Usamos el modo HSB para asegurar colores vibrantes y saturados
  colorMode(HSB, 360, 100, 100, 1);
  
  // Generar la primera obra
  generarObra();
}

function draw() {
  // Mantenemos el draw vacío porque la imagen es estática.
}

// 5. Variación y Aleatoriedad: Al hacer clic, se regenera la obra
function mousePressed() {
  generarObra();
}

function generarObra() {
  // 2. Fondo: Color sólido oscuro para contrastar
  background(15); 
  
  // Configuración de las líneas - Hacemos el espaciado MÁS FINO para un look digital limpio
  // Antes: random(6, 12), Ahora: random(4, 7)
  espaciado = floor(random(4, 7)); 
  
  // 7. Composición: Cantidad de bloques/capas
  let numCapas = floor(random(3, 6)); 
  
  // El grosor se calcula para que las líneas de todas las capas 
  // quepan dentro del "espaciado" sin pisarse del todo
  grosorLinea = (espaciado / numCapas) * 0.9; // Hacemos las líneas ligeramente más gruesas en proporción al espacio para rellenar mejor
  strokeWeight(grosorLinea);
  strokeCap(SQUARE);

  let capas = [];

  // Capa Base (Fondo completo)
  capas.push({
    x: 0, y: 0, w: width, h: height,
    c1: color(random(360), random(80, 100), random(80, 100)),
    c2: color(random(360), random(80, 100), random(80, 100))
  });

  // 7. Bloques de Color: Generar rectángulos internos aleatorios
  for (let i = 1; i < numCapas; i++) {
    capas.push({
      x: random(width * 0.1, width * 0.5),
      y: random(height * 0.1, height * 0.5),
      w: random(width * 0.3, width * 0.8),
      h: random(height * 0.3, height * 0.8),
      // 4. Patrones de color vibrantes
      c1: color(random(360), random(70, 100), random(80, 100)),
      c2: color(random(360), random(70, 100), random(80, 100))
    });
  }

  // 3. Líneas Verticales y 7. Superposiciones
  for (let i = 0; i < capas.length; i++) {
    let capa = capas[i];
    
    // Desfase clave para el efecto cinético: 
    // Desplaza ligeramente las líneas de las capas superiores en el eje X
    let desfaseX = i * (espaciado / numCapas); 

    // Dibujar las líneas de esta capa
    for (let x = 0; x < width; x += espaciado) {
      
      // Solo dibuja si la línea cae dentro de la zona del bloque geométrico
      if (x >= capa.x && x <= capa.x + capa.w) {
        
        // 4. Degradados Lineales: Interpolar el color de izquierda a derecha
        let porcentaje = map(x, capa.x, capa.x + capa.w, 0, 1);
        let colorLinea = lerpColor(capa.c1, capa.c2, porcentaje);


        stroke(colorLinea);
        
        // Dibuja el segmento de línea vertical
        let posX = x + desfaseX;
        // Evitamos dibujar fuera del lienzo para mayor limpieza
        if (posX <= width) {
            line(posX, capa.y, posX, capa.y + capa.h);
        }
      }
    }
  }
}
