/* ===== DATOS DE LOS POKÉMON (ESTADÍSTICAS Y MOVIMIENTOS) ===== */
const datosPokemon = {
    "charizard": { 
        stats: [78, 84, 78, 109, 85, 100], 
        moves: [{n: "Lanzallamas", t: "fuego"}, {n: "Tajo Aéreo", t: "vuelo"}, {n: "Garra Dragón", t: "dragon"}, {n: "Pulso Dragón", t: "dragon"}],
        config: { frames: 143, width: 91, speed: 40 } // Datos exactos de tu imagen
    },
    "kingdra": { 
        stats: [75, 95, 95, 95, 95, 85], 
        moves: [{n: "Surf", t: "agua"}, {n: "Rayo Hielo", t: "hielo"}, {n: "Foco Resplandor", t: "acero"}, {n: "Hidrobomba", t: "agua"}] 
    },
    "gardevoir": { 
        stats: [68, 65, 65, 125, 115, 80], 
        moves: [{n: "Psíquico", t: "psiquico"}, {n: "Brillo Mágico", t: "hada"}, {n: "Bola Sombra", t: "fantasma"}, {n: "Paz Mental", t: "psiquico"}] 
    },
    "umbreon": { 
        stats: [95, 65, 110, 60, 130, 65], 
        moves: [{n: "Pulso Umbrío", t: "siniestro"}, {n: "Tóxico", t: "veneno"}, {n: "Luz Lunar", t: "hada"}, {n: "Vendetta", t: "siniestro"}] 
    },
    "dragapult": { 
        stats: [88, 120, 75, 100, 75, 142], 
        moves: [{n: "Draco Flechas", t: "dragon"}, {n: "Golpe Fantasma", t: "fantasma"}, {n: "Lanzallamas", t: "fuego"}, {n: "Ida y Vuelta", t: "bicho"}] 
    },
    "snorlax": { 
        stats: [160, 110, 65, 65, 110, 30], 
        moves: [{n: "Golpe Cuerpo", t: "normal"}, {n: "Terremoto", t: "tierra"}, {n: "Descanso", t: "psiquico"}, {n: "Triturar", t: "siniestro"}] 
    }
};

const etiquetas = ["HP", "ATK", "DEF", "SPATK", "SPDEF", "SPD"];
const modal = document.getElementById("pokemon-modal");
const closeModal = document.querySelector(".close-modal");

/* ===== LÓGICA DE INTERACCIÓN POKÉMON (HP Y DAÑO) ===== */
function actualizarInterfaz(slot, actual, max) {
    const barraHP = slot.querySelector('.hp-fill');
    const textoHP = slot.querySelector('.hp-text');
    const porcentaje = Math.max(0, Math.min(100, (actual / max) * 100));

    barraHP.style.width = porcentaje + "%";
    textoHP.innerText = `${actual} / ${max}`;

    if (porcentaje > 50) {
        delete barraHP.dataset.hp; 
    } else if (porcentaje > 20) {
        barraHP.dataset.hp = "medium"; 
    } else {
        barraHP.dataset.hp = "low"; 
    }
}

document.querySelectorAll('.pokemon-slot').forEach(slot => {
    const hpTextElement = slot.querySelector('.hp-text');
    if (hpTextElement) {
        const valores = hpTextElement.innerText.match(/\d+/g);
        if (valores) {
            actualizarInterfaz(slot, parseInt(valores[0]), parseInt(valores[1]));
        }
    }

    slot.addEventListener('click', function(e) {
        const texto = slot.querySelector('.hp-text').innerText;
        let [actual, max] = texto.match(/\d+/g).map(Number);
        const cantidad = e.shiftKey ? 20 : 10;

        if (e.altKey || e.ctrlKey) {
            actual = Math.min(max, actual + cantidad);
            actualizarInterfaz(slot, actual, max);
        } else if (e.shiftKey) {
            actual = Math.max(0, actual - cantidad);
            actualizarInterfaz(slot, actual, max);
        } else {
            const spriteElement = this.querySelector('.sprite');
            const pokeKey = spriteElement.classList[1]; 
            const nombre = this.querySelector('.poke-name').childNodes[0].textContent.trim();
            const nivel = this.querySelector('.poke-level').innerText;
            
            abrirFicha(pokeKey, nombre, nivel);
        }
    });
});

/* ===== LÓGICA DEL GRÁFICO RADAR (HEXÁGONO) ===== */
function dibujarRadar(stats) {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centro = canvas.width / 2;
    const radioMax = 90; 
    const anguloPaso = (Math.PI * 2) / 6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 1;
    for(let i=1; i<=4; i++) {
        ctx.beginPath();
        let r = (radioMax / 4) * i;
        for(let j=0; j<6; j++) {
            let x = centro + r * Math.cos(anguloPaso * j - Math.PI/2);
            let y = centro + r * Math.sin(anguloPaso * j - Math.PI/2);
            if(j===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    ctx.fillStyle = "rgba(112, 200, 160, 0.6)";
    ctx.strokeStyle = "#183830";
    ctx.lineWidth = 2;
    ctx.beginPath();
    stats.forEach((stat, i) => {
        let r = (Math.min(stat, 160) / 160) * radioMax; 
        let x = centro + r * Math.cos(anguloPaso * i - Math.PI/2);
        let y = centro + r * Math.sin(anguloPaso * i - Math.PI/2);
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#183830";
    ctx.font = "bold 11px Arial";
    etiquetas.forEach((label, i) => {
        let x = centro + (radioMax + 25) * Math.cos(anguloPaso * i - Math.PI/2) - 15;
        let y = centro + (radioMax + 20) * Math.sin(anguloPaso * i - Math.PI/2) + 5;
        ctx.fillText(label, x, y);
    });
}

/* ===== CONTROL DEL MODAL (ABRIR FICHA) ===== */
function abrirFicha(key, nombre, nivel) {
    const pokeKey = key.toLowerCase();
    const data = datosPokemon[pokeKey];
    if(!data) return;

    const modalSprite = document.getElementById("modal-sprite");
    
    // Limpiar intervalos previos
    if (window.pokerender) clearInterval(window.pokerender);

    // CONFIGURACIÓN DE ANIMACIÓN (Para Charizard u otros con tira larga)
    if (data.config) {
        modalSprite.style.animation = "none";
        modalSprite.style.transition = "none";
        
        let frame = 0;
        const frames = data.config.frames;
        const width = data.config.width;

        window.pokerender = setInterval(() => {
            modalSprite.style.backgroundPosition = `-${frame * width}px 0px`;
            frame = (frame + 1) % frames;
        }, data.config.speed || 50);
    } else {
        // Si no tiene config especial, usa la animación de CSS normal
        modalSprite.style.animation = ""; 
        modalSprite.style.backgroundPosition = "";
    }

    document.getElementById("modal-name").innerText = nombre.toUpperCase();
    document.getElementById("modal-level").innerText = nivel;
    modalSprite.className = "sprite-detail " + pokeKey;

    dibujarRadar(data.stats);

    const movesDiv = document.getElementById("modal-moves");
    movesDiv.innerHTML = "";
    data.moves.forEach(move => {
        movesDiv.innerHTML += `<div class="move-card type-${move.t}">${move.n}</div>`;
    });

    modal.style.display = "block";
}

/* ===== EVENTOS DE CIERRE ===== */
if (closeModal) {
    closeModal.onclick = () => {
        modal.style.display = "none";
        if (window.pokerender) clearInterval(window.pokerender);
    };
}

window.onclick = (event) => { 
    if (event.target == modal) {
        modal.style.display = "none";
        if (window.pokerender) clearInterval(window.pokerender);
    }
};