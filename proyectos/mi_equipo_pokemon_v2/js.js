/* ===== LÓGICA DE INTERACCIÓN POKÉMON ===== */

// Función para actualizar visualmente la barra y el color
function actualizarInterfaz(slot, actual, max) {
    const barraHP = slot.querySelector('.hp-fill'); // Corregido: antes era .hp
    const textoHP = slot.querySelector('.hp-text');
    
    // Calcular porcentaje
    const porcentaje = Math.max(0, Math.min(100, (actual / max) * 100));

    // Actualizar ancho y texto (Fiel a GBA)
    barraHP.style.width = porcentaje + "%";
    textoHP.innerText = `${actual} / ${max}`;

    // Cambiar estados usando el dataset (para que el CSS aplique los colores correctos)
    if (porcentaje > 50) {
        delete barraHP.dataset.hp; // Verde (por defecto)
    } else if (porcentaje > 20) {
        barraHP.dataset.hp = "medium"; // Amarillo
    } else {
        barraHP.dataset.hp = "low"; // Rojo
    }
}

// Configurar cada slot del equipo
document.querySelectorAll('.pokemon-slot').forEach(slot => {
    
    // 1. Inicializar las barras al cargar (basado en el texto del HTML)
    const textoInicial = slot.querySelector('.hp-text').innerText;
    const valores = textoInicial.match(/\d+/g);
    
    if (valores) {
        const act = parseInt(valores[0]);
        const m = parseInt(valores[1]);
        actualizarInterfaz(slot, act, m);
    }

    // 2. Evento de Click para Dañar/Curar
    slot.addEventListener('click', function(e) {
        const texto = slot.querySelector('.hp-text').innerText;
        let [actual, max] = texto.match(/\d+/g).map(Number);
        
        // Definir cantidad: Shift + Click = 20 PS, Click normal = 10 PS
        const cantidad = e.shiftKey ? 20 : 10;

        // Lógica de daño o cura
        if (e.altKey || e.ctrlKey) {
            // Curar si presionas Alt o Ctrl + Click
            actual = Math.min(max, actual + cantidad);
            console.log(`Curando a ${slot.querySelector('.poke-name').innerText}...`);
        } else {
            // Dañar por defecto
            actual = Math.max(0, actual - cantidad);
            console.log(`Dañando a ${slot.querySelector('.poke-name').innerText}...`);
        }

        actualizarInterfaz(slot, actual, max);
    });
});