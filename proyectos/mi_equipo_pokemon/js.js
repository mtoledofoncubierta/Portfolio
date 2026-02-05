const hps = document.querySelectorAll('.hp');

hps.forEach(hp => {
  hp.addEventListener('click', (e) => {

    let current = parseInt(hp.dataset.current);
    const max = parseInt(hp.dataset.max);

    // Shift + click = curar
    if (e.shiftKey) {
      current = Math.min(current + 10, max);
    } else {
      current = Math.max(current - 10, 0);
    }

    hp.dataset.current = current;

    const porcentaje = (current / max) * 100;
    hp.style.width = porcentaje + "%";

    // Color según PS
    if (porcentaje > 60) {
      hp.style.backgroundColor = "#4CAF50";
    } else if (porcentaje > 30) {
      hp.style.backgroundColor = "#FF9800";
    } else {
      hp.style.backgroundColor = "#F44336";
    }

    // Actualizar texto
    const psText = hp.parentElement.nextElementSibling;
    psText.textContent = `${current} / ${max} PS`;
  });
});

function actualizarHP(barraHP, psActual, psMax) {
    const porcentaje = (psActual / psMax) * 100;
    barraHP.style.width = porcentaje + "%";

    if (porcentaje > 70) {
        barraHP.style.backgroundColor = "#4CAF50"; // verde
    } else if (porcentaje > 40) {
        barraHP.style.backgroundColor = "#FF9800"; // naranja
    } else {
        barraHP.style.backgroundColor = "#FF5722"; // rojo
    }
}

