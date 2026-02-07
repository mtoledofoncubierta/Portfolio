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

const datosPokemon = {
    "charizard": { stats: { ATK: 84, DEF: 78, SPD: 100 }, moves: ["Lanzallamas", "Vuelo", "Garra Dragón", "Tajo Aéreo"] },
    "kingdra": { stats: { ATK: 95, DEF: 95, SPD: 85 }, moves: ["Surf", "Rayo Hielo", "Danza Dragón", "Hidrobomba"] },
    "gardevoir": { stats: { ATK: 65, DEF: 65, SPD: 80 }, moves: ["Psíquico", "Paz Mental", "Rayo", "Brillo Mágico"] },
    "umbreon": { stats: { ATK: 65, DEF: 110, SPD: 65 }, moves: ["Luz Lunar", "Tóxico", "Vendetta", "Protección"] },
    "dragapult": { stats: { ATK: 120, DEF: 75, SPD: 142 }, moves: ["Draco Flechas", "Espectro-golpe", "Lanzallamas", "U-turn"] },
    "snorlax": { stats: { ATK: 110, DEF: 65, SPD: 30 }, moves: ["Golpe Cuerpo", "Descanso", "Terremoto", "Maldición"] }
};

const modal = document.getElementById("pokemon-modal");
const closeModal = document.querySelector(".close-modal");

// Abrir Ficha al hacer click
document.querySelectorAll('.pokemon-slot').forEach(slot => {
    slot.addEventListener('click', function(e) {
        // Si no estás pulsando Shift/Alt (que es para curar), abrimos la ficha
        if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
            const pokeClass = this.querySelector('.sprite').classList[1]; // charizard, kingdra, etc.
            const nombre = this.querySelector('.poke-name span:first-child').innerText;
            const nivel = this.querySelector('.poke-level').innerText;
            
            abrirFicha(pokeClass, nombre, nivel);
        }
    });
});

function abrirFicha(key, nombre, nivel) {
    const data = datosPokemon[key];
    document.getElementById("modal-name").innerText = nombre;
    document.getElementById("modal-level").innerText = nivel;
    
    // Configurar Sprite
    const sprite = document.getElementById("modal-sprite");
    sprite.className = "sprite " + key; // Esto hereda la imagen de tu CSS

    // Cargar Stats
    const statsDiv = document.getElementById("modal-stats");
    statsDiv.innerHTML = "";
    for (let stat in data.stats) {
        statsDiv.innerHTML += `
            <div class="stat-row">
                ${stat}: ${data.stats[stat]}
                <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${data.stats[stat]}%"></div></div>
            </div>`;
    }

    // Cargar Movimientos
    const movesDiv = document.getElementById("modal-moves");
    movesDiv.innerHTML = "";
    data.moves.forEach(move => {
        movesDiv.innerHTML += `<div class="move-card">${move}</div>`;
    });

    modal.style.display = "block";
}

// Cerrar Modal
closeModal.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }