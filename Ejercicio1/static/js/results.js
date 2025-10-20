const percentSpan = document.getElementById("percent");
const circle = document.getElementById("circle");
const percent = parseInt(percentSpan.textContent);

// Función para elegir color según el porcentaje
function getColor(p) {
    if (p >= 70) return "#4caf50"; // verde
    if (p >= 40) return "#ffeb3b"; // amarillo
    return "#f44336"; // rojo
}

// Función para actualizar la rueda
function updateCircle(p) {
    const degree = (p / 100) * 360;
    const color = getColor(p);
    circle.style.background = `conic-gradient(${color} ${degree}deg, #ddd ${degree}deg)`;
    percentSpan.textContent = `${p}%`;
}

// Animación suave
let current = 0;
let interval = setInterval(() => {
    if (current < percent) {
        current++;
        updateCircle(current);
    } else {
        clearInterval(interval);
    }
}, 10);
