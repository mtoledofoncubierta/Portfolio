// Función para actualizar visualmente la barra y el color
function actualizarInterfaz(slot, actual, max) {
    const barraHP = slot.querySelector('.hp');
    const textoHP = slot.querySelector('.hp-text');
    const porcentaje = Math.max(0, Math.min(100, (actual / max) * 100));

    // Actualizar ancho y texto
    barraHP.style.width = porcentaje + "%";
    textoHP.innerText = `${actual} / ${max} PS`;

    // Colores fieles a GBA Esmeralda
    if (porcentaje > 50) {
        barraHP.style.background = "#70f8a8"; // Verde salud
    } else if (porcentaje > 20) {
        barraHP.style.background = "#f8e038"; // Amarillo salud media
    } else {
        barraHP.style.background = "#f85838"; // Rojo salud crítica
    }
}

// Configurar cada slot
document.querySelectorAll('.pokemon-slot').forEach(slot => {
    slot.addEventListener('click', function(e) {
        const texto = slot.querySelector('.hp-text').innerText;
        let [actual, max] = texto.match(/\d+/g).map(Number);
        
        // Definir cuánto curar o dañar
        // Shift + Click = 10 PS, Click normal = 5 PS
        const cantidad = e.shiftKey ? 10 : 5;

        if (e.altKey || e.ctrlKey) {
            // Curar si presionas Alt o Ctrl + Click
            actual = Math.min(max, actual + cantidad);
        } else {
            // Dañar por defecto al hacer click
            actual = Math.max(0, actual - cantidad);
        }

        actualizarInterfaz(slot, actual, max);
    });

    // Inicializar las barras al cargar la página
    const textoInicial = slot.querySelector('.hp-text').innerText;
    const [act, m] = textoInicial.match(/\d+/g).map(Number);
    actualizarInterfaz(slot, act, m);
});