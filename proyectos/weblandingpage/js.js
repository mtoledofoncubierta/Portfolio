// --- SELECTORES GLOBALES ---
const searchInput = document.getElementById('poke-search');
const searchResult = document.getElementById('search-result');
const teamSlots = document.getElementById('team-slots');
const teamCount = document.getElementById('team-count');
const autocompleteList = document.getElementById('autocomplete-list');
const avatarImg = document.getElementById('user-avatar');
const avatarModal = document.getElementById('avatar-modal');
const avatarOptions = document.getElementById('avatar-options');

let team = JSON.parse(localStorage.getItem('myPokeTeam')) || [];
let allPokemonNames = []; 

// --- NAVEGACIÓN ---
window.toggleMenu = () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
};

// --- TEAM BUILDER ---
async function loadPokemonList() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await res.json();
        allPokemonNames = data.results;
    } catch (e) { console.error("Error cargando lista:", e); }
}

searchInput?.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';
    if (!value) { autocompleteList.classList.add('hidden'); return; }

    const filtered = allPokemonNames.filter(p => p.name.includes(value)).slice(0, 8);
    if (filtered.length > 0) {
        autocompleteList.classList.remove('hidden');
        filtered.forEach(p => {
            const id = p.url.split('/')[6]; 
            const item = document.createElement('div');
            item.className = "flex items-center p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-0";
            item.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" class="w-10 h-10 mr-3 pixelated"><span class="capitalize text-sm font-medium">${p.name}</span>`;
            item.onclick = () => {
                searchInput.value = p.name;
                autocompleteList.classList.add('hidden');
                fetchPokemon(p.name);
            };
            autocompleteList.appendChild(item);
        });
    } else { autocompleteList.classList.add('hidden'); }
});

async function fetchPokemon(name) {
    searchResult.innerHTML = '<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>';
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();
        const imgUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
        searchResult.innerHTML = `
            <div class="animate__animated animate__zoomIn flex flex-col items-center w-full">
                <img src="${imgUrl}" class="w-32 h-32 drop-shadow-xl mb-2">
                <h4 class="capitalize font-black text-xl text-white">${data.name}</h4>
                <button onclick="addToTeam('${data.name}', '${imgUrl}')" class="w-full mt-4 py-3 bg-yellow-500 text-black font-black rounded-xl hover:bg-yellow-400 transition uppercase text-xs">Añadir al equipo</button>
            </div>`;
    } catch (e) { searchResult.innerHTML = "<p class='text-red-500'>Error al cargar</p>"; }
}

window.addToTeam = (name, img) => {
    if (team.length < 6) {
        team.push({ id: Date.now(), name, img });
        localStorage.setItem('myPokeTeam', JSON.stringify(team));
        updateTeamUI();
    } else { alert("¡Equipo lleno!"); }
};

window.removeFromTeam = (id) => {
    team = team.filter(p => p.id !== id);
    localStorage.setItem('myPokeTeam', JSON.stringify(team));
    updateTeamUI();
};

function updateTeamUI() {
    if(!teamCount || !teamSlots) return;
    teamCount.innerText = `${team.length} / 6`;
    teamSlots.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const p = team[i];
        const div = document.createElement('div');
        if (p) {
            div.className = "animate__animated animate__fadeIn bg-slate-800 h-64 rounded-[2.5rem] flex flex-col items-center justify-center relative border-2 border-yellow-500/30 group";
            div.innerHTML = `
                <button onclick="removeFromTeam(${p.id})" class="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition">✕</button>
                <img src="${p.img}" class="w-36 h-36">
                <p class="capitalize font-black text-xs mt-2 text-yellow-500">${p.name}</p>`;
        } else {
            div.className = "h-64 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-800 text-6xl font-black italic";
            div.innerText = i + 1;
        }
        teamSlots.appendChild(div);
    }
}

// --- AVATAR ---
window.toggleAvatarModal = () => avatarModal.classList.toggle('hidden');

function initAvatar() {
    const saved = localStorage.getItem('userAvatar');
    if (saved && avatarImg) avatarImg.src = saved;
    const trainers = ["red", "blue", "ethan", "lyra", "brendan", "may", "cynthia", "leon"];
    if(avatarOptions) {
        avatarOptions.innerHTML = trainers.map(t => `
            <div onclick="selectAvatar('https://play.pokemonshowdown.com/sprites/trainers/${t}.png')" class="cursor-pointer bg-slate-900 p-4 rounded-3xl border-2 border-slate-700 hover:border-yellow-500 transition flex flex-col items-center">
                <img src="https://play.pokemonshowdown.com/sprites/trainers/${t}.png" class="w-20 h-20 object-contain pixelated">
            </div>`).join('');
    }
}

window.selectAvatar = (url) => {
    if(avatarImg) avatarImg.src = url;
    localStorage.setItem('userAvatar', url);
    toggleAvatarModal();
};

// --- TEST ---
window.procesarTest = (tipo) => {
    const container = document.getElementById('quiz-content');
    container.innerHTML = `
        <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-500 mb-4"></div>
            <p class="text-indigo-400 font-black uppercase tracking-widest text-sm text-center">Analizando aura...</p>
        </div>`;
    
    const res = tipo === 'impulsivo' 
        ? { p: "Charmander", id: "4", d: "¡Eres puro fuego y valentía!" }
        : { p: "Bulbasaur", id: "1", d: "Eres sabio y protector." };

    setTimeout(() => {
        container.innerHTML = `
            <div class="animate__animated animate__fadeIn text-center">
                <h3 class="text-4xl font-black mb-4 text-white uppercase italic">¡Eres un ${res.p}!</h3>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${res.id}.png" class="w-56 h-56 mx-auto">
                <p class="text-slate-300 mt-6 italic text-md">${res.d}</p>
                <button onclick="location.reload()" class="mt-8 px-8 py-3 bg-indigo-600 rounded-full text-xs font-black uppercase">Repetir</button>
            </div>`;
    }, 1500);
};

// --- MAPA ---
const puntosMap = [
    { n: "Pueblo Paleta", t: "78%", l: "24%", d: "Donde todo comienza." },
    { n: "Ciudad Celeste", t: "25%", l: "55%", d: "Gimnasio de Misty." },
    { n: "Ciudad Lavanda", t: "45%", l: "82%", d: "Lugar de fantasmas." }
];

function initMapa() {
    const mapa = document.getElementById('mapa-interactivo');
    const info = document.getElementById('map-info');
    if(!mapa) return;
    puntosMap.forEach(p => {
        const pin = document.createElement('div');
        pin.className = "absolute w-6 h-6 bg-red-600 rounded-full border-2 border-white cursor-pointer hover:scale-150 transition-all animate-bounce z-10";
        pin.style.top = p.t; pin.style.left = p.l;
        pin.onclick = () => { info.innerHTML = `<strong>${p.n}</strong>: ${p.d}`; };
        mapa.appendChild(pin);
    });
}

// --- LÓGICA DE TEXTO DINÁMICO ---
const frases = [
    "Gestiona tu equipo definitivo.",
    "Descubre tu identidad Pokémon.",
    "Explora las rutas clásicas de Kanto.",
    "Conviértete en el mejor entrenador.",
    "Analiza tu aura en nuestro test."
];
let fraseIndex = 0;
const textElement = document.getElementById('changing-text');

function cambiarFrase() {
    if(!textElement) return;
    textElement.style.opacity = 0;
    setTimeout(() => {
        fraseIndex = (fraseIndex + 1) % frases.length;
        textElement.innerText = frases[fraseIndex];
        textElement.style.opacity = 1;
    }, 500);
}

// --- LÓGICA DE REVELADO ESCALONADO (STAGGER) ---
function initStaggeredReveal() {
    const observerOptions = { threshold: 0.15 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Selecciona los hijos con la clase reveal-child dentro de la sección visible
                const children = entry.target.querySelectorAll('.reveal-child');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('active-child');
                    }, index * 200); // 200ms de retraso entre cada elemento
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observa todas las secciones con la clase stagger-section
    document.querySelectorAll('.stagger-section').forEach(section => {
        observer.observe(section);
    });
}

// --- INICIALIZACIÓN GENERAL ---
document.addEventListener('DOMContentLoaded', () => {
    loadPokemonList();
    updateTeamUI();
    initAvatar();
    initMapa();
    initStaggeredReveal();
    setInterval(cambiarFrase, 3500);
});

   document.addEventListener('DOMContentLoaded', () => {
            const observerOptions = { threshold: 0.1 };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const children = entry.target.querySelectorAll('.reveal-child');
                        children.forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('active-child');
                            }, index * 200); 
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.stagger-section').forEach(section => {
                observer.observe(section);
            });
        });