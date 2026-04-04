const searchInput = document.getElementById('poke-search');
const searchResult = document.getElementById('search-result');
const teamSlots = document.getElementById('team-slots');
const teamCount = document.getElementById('team-count');
const autocompleteList = document.getElementById('autocomplete-list');
const avatarImg = document.getElementById('user-avatar');
const avatarModal = document.getElementById('avatar-modal');
const avatarOptions = document.getElementById('avatar-options');
const avatarName = document.getElementById('avatar-name');
const trainerNameInput = document.getElementById('trainer-name');
const saveProfileBtn = document.getElementById('save-profile');
const trainerSummary = document.getElementById('trainer-summary');
const clearTeamBtn = document.getElementById('clear-team');
const quizContent = document.getElementById('quiz-content');
const startQuizBtn = document.getElementById('start-quiz');

let team = JSON.parse(localStorage.getItem('myPokeTeam')) || [];
let allPokemonNames = [];
let trainerProfile = JSON.parse(localStorage.getItem('trainerProfile')) || {
    name: '',
    avatar: 'https://play.pokemonshowdown.com/sprites/trainers/red.png',
    avatarLabel: 'Red'
};

const trainerSprites = [
    { label: 'Red', key: 'red' },
    { label: 'Blue', key: 'blue' },
    { label: 'Ethan', key: 'ethan' },
    { label: 'Lyra', key: 'lyra' },
    { label: 'Brendan', key: 'brendan' },
    { label: 'May', key: 'may' },
    { label: 'Cynthia', key: 'cynthia' },
    { label: 'Leon', key: 'leon' },
    { label: 'Dawn', key: 'dawn' },
    { label: 'Rosa', key: 'rosa' },
    { label: 'Hilda', key: 'hilda' },
    { label: 'Serena', key: 'serena' }
];

function capitalize(txt) {
    if (!txt) return '';
    return txt.charAt(0).toUpperCase() + txt.slice(1);
}

window.toggleMenu = () => {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
};

async function loadPokemonList() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await res.json();
        allPokemonNames = data.results;
    } catch (error) {
        console.error('Error cargando lista:', error);
    }
}

searchInput?.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';

    if (!value) {
        autocompleteList.classList.add('hidden');
        return;
    }

    const filtered = allPokemonNames.filter((p) => p.name.includes(value)).slice(0, 8);

    if (filtered.length === 0) {
        autocompleteList.classList.add('hidden');
        return;
    }

    autocompleteList.classList.remove('hidden');

    filtered.forEach((pokemon) => {
        const id = pokemon.url.split('/')[6];
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'w-full text-left flex items-center p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-0';
        item.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" class="w-10 h-10 mr-3 pixelated"><span class="capitalize text-sm font-medium">${pokemon.name}</span>`;
        item.onclick = () => {
            searchInput.value = pokemon.name;
            autocompleteList.classList.add('hidden');
            fetchPokemon(pokemon.name);
        };
        autocompleteList.appendChild(item);
    });
});

async function fetchPokemon(name) {
    if (!searchResult) return;

    searchResult.innerHTML = '<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>';

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();
        const imgUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
        const types = data.types.map((t) => capitalize(t.type.name));

        searchResult.innerHTML = `
            <div class="animate__animated animate__zoomIn flex flex-col items-center w-full">
                <img src="${imgUrl}" class="w-32 h-32 drop-shadow-xl mb-2" alt="${data.name}">
                <h4 class="capitalize font-black text-xl text-white">${data.name}</h4>
                <div class="flex gap-2 flex-wrap justify-center mt-2">
                    ${types.map((t) => `<span class="text-[10px] uppercase px-2 py-1 rounded-full bg-slate-700 text-slate-200 font-bold">${t}</span>`).join('')}
                </div>
                <button onclick="addToTeam('${data.name}', '${imgUrl}', '${types.join(',')}')" class="w-full mt-4 py-3 bg-yellow-500 text-black font-black rounded-xl hover:bg-yellow-400 transition uppercase text-xs">Anadir al equipo</button>
            </div>`;
    } catch (error) {
        searchResult.innerHTML = '<p class="text-red-500">No se pudo cargar ese Pokemon.</p>';
    }
}

window.addToTeam = (name, img, typesString) => {
    if (team.length >= 6) {
        alert('Equipo lleno (maximo 6).');
        return;
    }

    if (team.some((p) => p.name === name)) {
        alert('Ese Pokemon ya esta en tu equipo.');
        return;
    }

    team.push({
        id: Date.now(),
        name,
        img,
        types: (typesString || '').split(',').filter(Boolean)
    });

    localStorage.setItem('myPokeTeam', JSON.stringify(team));
    updateTeamUI();
};

window.removeFromTeam = (id) => {
    team = team.filter((p) => p.id !== id);
    localStorage.setItem('myPokeTeam', JSON.stringify(team));
    updateTeamUI();
};

clearTeamBtn?.addEventListener('click', () => {
    if (!team.length) return;
    const ok = confirm('Quieres vaciar el equipo completo?');
    if (!ok) return;

    team = [];
    localStorage.setItem('myPokeTeam', JSON.stringify(team));
    updateTeamUI();
});

function updateTeamUI() {
    if (!teamCount || !teamSlots) return;

    teamCount.innerText = `${team.length} / 6`;
    teamSlots.innerHTML = '';

    for (let i = 0; i < 6; i += 1) {
        const pokemon = team[i];
        const card = document.createElement('div');

        if (pokemon) {
            card.className = 'animate__animated animate__fadeIn bg-slate-800 min-h-[280px] rounded-[2.5rem] flex flex-col items-center justify-center relative border-2 border-yellow-500/30 group p-4';
            card.innerHTML = `
                <button onclick="removeFromTeam(${pokemon.id})" class="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition" aria-label="Eliminar Pokemon">X</button>
                <img src="${pokemon.img}" class="w-32 h-32" alt="${pokemon.name}">
                <p class="capitalize font-black text-sm mt-2 text-yellow-500">${pokemon.name}</p>
                <div class="mt-2 flex gap-2 flex-wrap justify-center">
                    ${(pokemon.types || []).map((t) => `<span class="text-[10px] uppercase px-2 py-1 rounded-full bg-slate-700 text-slate-200 font-bold">${t}</span>`).join('')}
                </div>`;
        } else {
            card.className = 'min-h-[280px] border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-700 text-6xl font-black italic';
            card.innerText = i + 1;
        }

        teamSlots.appendChild(card);
    }
}

window.toggleAvatarModal = () => {
    avatarModal?.classList.toggle('hidden');
};

function initAvatar() {
    if (avatarImg) avatarImg.src = trainerProfile.avatar;
    if (avatarName) avatarName.innerText = `Avatar actual: ${trainerProfile.avatarLabel}`;

    if (!avatarOptions) return;

    avatarOptions.innerHTML = trainerSprites.map((trainer) => {
        const url = `https://play.pokemonshowdown.com/sprites/trainers/${trainer.key}.png`;
        return `
            <button type="button" onclick="selectAvatar('${url}', '${trainer.label}')" class="cursor-pointer bg-slate-900 p-4 rounded-3xl border-2 border-slate-700 hover:border-yellow-500 transition flex flex-col items-center">
                <img src="${url}" class="w-20 h-20 object-contain pixelated" alt="Avatar ${trainer.label}">
                <span class="text-[10px] uppercase tracking-widest mt-2 text-slate-300 font-bold">${trainer.label}</span>
            </button>`;
    }).join('');
}

window.selectAvatar = (url, label) => {
    trainerProfile.avatar = url;
    trainerProfile.avatarLabel = label;

    if (avatarImg) avatarImg.src = url;
    if (avatarName) avatarName.innerText = `Avatar actual: ${label}`;

    localStorage.setItem('trainerProfile', JSON.stringify(trainerProfile));
    window.toggleAvatarModal();
    renderTrainerSummary();
};

function renderTrainerSummary() {
    if (!trainerSummary) return;

    const name = trainerProfile.name || 'Sin nombre';
    trainerSummary.innerText = `Entrenador: ${name} - Equipo guardado: ${team.length}/6`;
}

function initTrainerProfile() {
    if (trainerNameInput && trainerProfile.name) {
        trainerNameInput.value = trainerProfile.name;
    }

    saveProfileBtn?.addEventListener('click', () => {
        const name = trainerNameInput?.value.trim();
        if (!name) {
            alert('Escribe un nombre de entrenador.');
            return;
        }

        trainerProfile.name = name;
        localStorage.setItem('trainerProfile', JSON.stringify(trainerProfile));
        renderTrainerSummary();
    });

    renderTrainerSummary();
}

const quizQuestions = [
    {
        question: 'Te despiertas en un bosque desconocido. Que haces primero?',
        answers: [
            { text: 'Exploro sin miedo.', score: { torchic: 2, pikachu: 1 } },
            { text: 'Observo el entorno con calma.', score: { treecko: 2, eevee: 1 } },
            { text: 'Busco a alguien para cooperar.', score: { mudkip: 2, riolu: 1 } },
            { text: 'Intento proteger a los demas antes.', score: { riolu: 2, mudkip: 1 } }
        ]
    },
    {
        question: 'En una mision, tu rol ideal es...',
        answers: [
            { text: 'Liderar el ataque.', score: { torchic: 2, riolu: 1 } },
            { text: 'Trazar estrategia.', score: { treecko: 2, eevee: 1 } },
            { text: 'Apoyar y curar.', score: { mudkip: 2, pikachu: 1 } },
            { text: 'Mantener la moral del grupo.', score: { eevee: 2, pikachu: 1 } }
        ]
    },
    {
        question: 'Que clima prefieres para entrenar?',
        answers: [
            { text: 'Soleado y calido.', score: { torchic: 2 } },
            { text: 'Lluvia y charcos.', score: { mudkip: 2 } },
            { text: 'Brisa fresca de bosque.', score: { treecko: 2 } },
            { text: 'Tormenta electrica.', score: { pikachu: 2 } }
        ]
    },
    {
        question: 'Que valor te representa mas?',
        answers: [
            { text: 'Coraje.', score: { torchic: 2, riolu: 1 } },
            { text: 'Empatia.', score: { mudkip: 2, eevee: 1 } },
            { text: 'Disciplina.', score: { riolu: 2, treecko: 1 } },
            { text: 'Adaptabilidad.', score: { eevee: 2, pikachu: 1 } }
        ]
    },
    {
        question: 'Si pierdes una pelea, como reaccionas?',
        answers: [
            { text: 'Me vuelvo a levantar enseguida.', score: { torchic: 2 } },
            { text: 'Analizo errores y ajusto.', score: { treecko: 2 } },
            { text: 'Pido consejo y mejoro.', score: { mudkip: 2, eevee: 1 } },
            { text: 'Entreno con intensidad.', score: { riolu: 2, pikachu: 1 } }
        ]
    },
    {
        question: 'Tu energia social suele ser...',
        answers: [
            { text: 'Muy intensa y electrica.', score: { pikachu: 2, torchic: 1 } },
            { text: 'Serena y observadora.', score: { treecko: 2 } },
            { text: 'Cercana y amigable.', score: { eevee: 2, mudkip: 1 } },
            { text: 'Fuerte pero reservada.', score: { riolu: 2 } }
        ]
    }
];

const pokemonPersonality = {
    torchic: { name: 'Torchic', id: 255, text: 'Valiente, optimista y con fuego competitivo.' },
    mudkip: { name: 'Mudkip', id: 258, text: 'Leal, flexible y con gran espiritu de equipo.' },
    treecko: { name: 'Treecko', id: 252, text: 'Calculador, tranquilo y elegante bajo presion.' },
    pikachu: { name: 'Pikachu', id: 25, text: 'Energia pura, carisma y chispa social.' },
    eevee: { name: 'Eevee', id: 133, text: 'Versatil, curiosa y con gran capacidad de adaptacion.' },
    riolu: { name: 'Riolu', id: 447, text: 'Disciplinado, justo y con determinacion.' }
};

let currentQuestionIndex = 0;
let quizScore = resetQuizScore();

function resetQuizScore() {
    return {
        torchic: 0,
        mudkip: 0,
        treecko: 0,
        pikachu: 0,
        eevee: 0,
        riolu: 0
    };
}

function startQuiz() {
    currentQuestionIndex = 0;
    quizScore = resetQuizScore();
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const questionData = quizQuestions[currentQuestionIndex];
    const progress = `${currentQuestionIndex + 1} / ${quizQuestions.length}`;

    quizContent.innerHTML = `
        <div class="text-left">
            <p class="text-[11px] uppercase tracking-[0.3em] text-indigo-300 font-black mb-3">Pregunta ${progress}</p>
            <h3 class="text-xl md:text-2xl font-black italic mb-8 text-white">${questionData.question}</h3>
            <div class="grid gap-4">
                ${questionData.answers.map((answer, idx) => `
                    <button type="button" class="quiz-answer p-4 bg-slate-800 text-slate-100 font-bold rounded-2xl text-xs md:text-sm tracking-wide hover:bg-indigo-600 transition-all text-left" data-answer-index="${idx}">
                        ${answer.text}
                    </button>
                `).join('')}
            </div>
        </div>`;

    document.querySelectorAll('.quiz-answer').forEach((btn) => {
        btn.addEventListener('click', () => {
            const index = Number(btn.dataset.answerIndex);
            processQuizAnswer(index);
        });
    });
}

function processQuizAnswer(answerIndex) {
    const selected = quizQuestions[currentQuestionIndex].answers[answerIndex];

    Object.entries(selected.score).forEach(([key, value]) => {
        quizScore[key] += value;
    });

    currentQuestionIndex += 1;

    if (currentQuestionIndex >= quizQuestions.length) {
        showQuizResult();
        return;
    }

    renderQuizQuestion();
}

function showQuizResult() {
    const winnerKey = Object.keys(quizScore).sort((a, b) => quizScore[b] - quizScore[a])[0];
    const result = pokemonPersonality[winnerKey];

    quizContent.innerHTML = `
        <div class="animate__animated animate__fadeIn text-center">
            <p class="text-[11px] uppercase tracking-[0.3em] text-indigo-300 font-black mb-3">Resultado final</p>
            <h3 class="text-4xl font-black mb-4 text-white uppercase italic">Eres ${result.name}</h3>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${result.id}.png" class="w-56 h-56 mx-auto" alt="${result.name}">
            <p class="text-slate-300 mt-6 italic text-md">${result.text}</p>
            <button id="restart-quiz" type="button" class="mt-8 px-8 py-3 bg-indigo-600 rounded-full text-xs font-black uppercase hover:bg-indigo-500">Repetir test</button>
        </div>`;

    document.getElementById('restart-quiz')?.addEventListener('click', startQuiz);
}

startQuizBtn?.addEventListener('click', startQuiz);

const hoennZones = [
    {
        name: '1 - Villa Raiz',
        style: { top: '61%', left: '23%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Poochyena', id: 261 },
            { name: 'Zigzagoon', id: 263 },
            { name: 'Wurmple', id: 265 }
        ]
    },
    {
        name: '2 - Pueblo Escaso',
        style: { top: '58%', left: '15%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Zigzagoon', id: 263 },
            { name: 'Poochyena', id: 261 },
            { name: 'Wurmple', id: 265 }
        ]
    },
    {
        name: '3 - Ciudad Petalia',
        style: { top: '50%', left: '8%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Ralts', id: 280 },
            { name: 'Lotad', id: 270 },
            { name: 'Seedot', id: 273 }
        ]
    },
    {
        name: '4 - Bosque Petalia',
        style: { top: '45%', left: '3%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Shroomish', id: 285 },
            { name: 'Slakoth', id: 287 },
            { name: 'Cascoon', id: 268 },
            { name: 'Silcoon', id: 266 }
        ]
    },
    {
        name: '5 - Ciudad Ferrica',
        style: { top: '35%', left: '3%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Wingull', id: 278 },
            { name: 'Taillow', id: 276 },
            { name: 'Marill', id: 183 }
        ]
    },
    {
        name: '6 - Tunel Ferrigola',
        style: { top: '24%', left: '3%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Whismur', id: 293 },
            { name: 'Nincada', id: 290 },
            { name: 'Skitty', id: 300 }
        ]
    },
    {
        name: '7 - Pueblo Azuliza',
        style: { top: '84%', left: '12%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Makuhita', id: 296 },
            { name: 'Aron', id: 304 },
            { name: 'Zubat', id: 41 },
            { name: 'Sableye', id: 302 }
        ]
    },
    {
        name: '8 - Ciudad Portual',
        style: { top: '57%', left: '22%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Wingull', id: 278 },
            { name: 'Tentacool', id: 72 },
            { name: 'Electrike', id: 309 }
        ]
    },
    {
        name: '9 - Camino de Bicis',
        style: { top: '55%', left: '30%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Electrike', id: 309 },
            { name: 'Gulpin', id: 316 },
            { name: 'Minun', id: 312 }
        ]
    },
    {
        name: '10 - Ciudad Malvalona',
        style: { top: '46%', left: '40%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Electrike', id: 309 },
            { name: 'Gulpin', id: 316 },
            { name: 'Minun', id: 312 },
            { name: 'Plusle', id: 311 }
        ]
    },
    {
        name: '11 - Desierto',
        style: { top: '39%', left: '47%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Trapinch', id: 328 },
            { name: 'Sandshrew', id: 27 },
            { name: 'Baltoy', id: 343 }
        ]
    },
    {
        name: '12 - Senda Ignea',
        style: { top: '33%', left: '52%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Numel', id: 322 },
            { name: 'Koffing', id: 109 },
            { name: 'Slugma', id: 218 }
        ]
    },
    {
        name: '13 - Pueblo Pardal',
        style: { top: '17%', left: '14%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Spinda', id: 327 },
            { name: 'Skarmory', id: 227 },
            { name: 'Slugma', id: 218 }
        ]
    },
    {
        name: '14 - Cascada Meteoro',
        style: { top: '21%', left: '6%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Solrock', id: 338 },
            { name: 'Lunatone', id: 337 },
            { name: 'Golbat', id: 42 }
        ]
    },
    {
        name: '15 - Pueblo Verdegal',
        style: { top: '42%', left: '20%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Roselia', id: 315 },
            { name: 'Illumise', id: 314 },
            { name: 'Volbeat', id: 313 }
        ]
    },
    {
        name: '16 - Monte Cenizo',
        style: { top: '22%', left: '29%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Numel', id: 322 },
            { name: 'Spoink', id: 325 },
            { name: 'Skarmory', id: 227 }
        ]
    },
    {
        name: '17 - Pueblo Lavacalda',
        style: { top: '34%', left: '25%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Numel', id: 322 },
            { name: 'Slugma', id: 218 },
            { name: 'Koffing', id: 109 }
        ]
    },
    {
        name: '18 - Instituto Meteorologico',
        style: { top: '28%', left: '31%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Castform', id: 351 },
            { name: 'Kecleon', id: 352 },
            { name: 'Wingull', id: 278 }
        ]
    },
    {
        name: '19 - Ciudad Arborada',
        style: { top: '10%', left: '28%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Tropius', id: 357 },
            { name: 'Kecleon', id: 352 },
            { name: 'Oddish', id: 43 }
        ]
    },
    {
        name: '20 - Monte Pirico',
        style: { top: '49%', left: '61%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Shuppet', id: 353 },
            { name: 'Duskull', id: 355 },
            { name: 'Vulpix', id: 37 }
        ]
    },
    {
        name: '21 - Zona Safari',
        style: { top: '17%', left: '50%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Pikachu', id: 25 },
            { name: 'Natu', id: 177 },
            { name: 'Doduo', id: 84 }
        ]
    },
    {
        name: '22 - Ciudad Calagua',
        style: { top: '17%', left: '69%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Pikachu', id: 25 },
            { name: 'Doduo', id: 84 },
            { name: 'Natu', id: 177 },
            { name: 'Wobbuffet', id: 202 }
        ]
    },
    {
        name: '23 - Guarida Magma/Aqua',
        style: { top: '16%', left: '76%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Mightyena', id: 262 },
            { name: 'Golbat', id: 42 },
            { name: 'Mightyena', id: 262 }
        ]
    },
    {
        name: '24 - Ciudad Algaria',
        style: { top: '22%', left: '90%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Staryu', id: 120 },
            { name: 'Corsola', id: 222 },
            { name: 'Wailmer', id: 320 }
        ]
    },
    {
        name: '25 - Archipielago',
        style: { top: '38%', left: '70%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Tentacool', id: 72 },
            { name: 'Sharpedo', id: 319 },
            { name: 'Wailmer', id: 320 }
        ]
    },
    {
        name: '26 - Ciudad Colosalia',
        style: { top: '39%', left: '94%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Luvdisc', id: 370 },
            { name: 'Sealeo', id: 364 },
            { name: 'Relicanth', id: 369 }
        ]
    },
    {
        name: '27 - Liga Pokemon / Ciudad Colosalia',
        style: { top: '31%', left: '94%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Golbat', id: 42 },
            { name: 'Hariyama', id: 297 },
            { name: 'Lairon', id: 305 }
        ]
    },
    {
        name: '28 - Pueblo Oromar',
        style: { top: '63%', left: '63%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Wingull', id: 278 },
            { name: 'Pelipper', id: 279 },
            { name: 'Wailmer', id: 320 }
        ]
    },
    {
        name: '29 - Torre de Batalla',
        style: { top: '73%', left: '73%', width: '4.2%', height: '5.2%' },
        pokemon: [
            { name: 'Skarmory', id: 227 },
            { name: 'Aerodactyl', id: 142 },
            { name: 'Salamence', id: 373 }
        ]
    }
];

const zoneOverrides = {
    '1': { top: '71.88%', left: '14.91%' },
    '2': { top: '61.00%', left: '14.81%' },
    '3': { top: '61.16%', left: '4.56%' },
    '4': { top: '49.65%', left: '0.05%' },
    '5': { top: '36.57%', left: '1.28%' },
    '6': { top: '33.89%', left: '14.70%' },
    '7': { top: '87.33%', left: '8.15%' },
    '8': { top: '68.25%', left: '28.74%' },
    '9': { top: '51.55%', left: '29.35%' },
    '10': { top: '39.25%', left: '30.58%' },
    '11': { top: '29.00%', left: '30.28%' },
    '12': { top: '23.80%', left: '23.82%' },
    '13': { top: '8.51%', left: '11.63%' },
    '14': { top: '19.23%', left: '3.02%' },
    '15': { top: '40.04%', left: '14.70%' },
    '16': { top: '23.49%', left: '20.24%' },
    '17': { top: '29.63%', left: '18.90%' },
    '18': { top: '12.77%', left: '38.78%' },
    '19': { top: '8.20%', left: '42.37%' },
    '20': { top: '33.26%', left: '58.86%' },
    '21': { top: '18.44%', left: '54.76%' },
    '22': { top: '23.96%', left: '68.19%' },
    '23': { top: '18.60%', left: '73.62%' },
    '24': { top: '32.31%', left: '85.50%' },
    '25': { top: '52.18%', left: '75.05%' },
    '26': { top: '61.00%', left: '93.90%' },
    '27': { top: '50.13%', left: '93.90%' },
    '28': { top: '66.21%', left: '63.06%' },
    '29': { top: '77.24%', left: '78.43%' }
};

function applyZoneOverrides() {
    hoennZones.forEach((zone, index) => {
        const key = String(index + 1);
        if (!zoneOverrides[key]) return;

        const override = zoneOverrides[key];
        zone.style.top = override.top;
        zone.style.left = override.left;
    });
}

function initMapa() {
    const mapa = document.getElementById('mapa-interactivo');
    const info = document.getElementById('map-info');

    if (!mapa || !info) return;

    applyZoneOverrides();

    hoennZones.forEach((zone, index) => {
        const zoneDiv = document.createElement('div');
        zoneDiv.className = 'zone-hitbox';
        zoneDiv.dataset.zoneIndex = String(index);
        zoneDiv.style.top = zone.style.top;
        zoneDiv.style.left = zone.style.left;
        zoneDiv.style.width = zone.style.width;
        zoneDiv.style.height = zone.style.height;

        zoneDiv.addEventListener('mouseenter', () => {
            info.innerHTML = `
                <div>
                    <p class="text-yellow-400 font-black uppercase tracking-wider text-xs mb-2">${zone.name}</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        ${zone.pokemon.map((pokemon) => `
                            <div class="bg-slate-900/70 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" alt="${pokemon.name}" class="w-14 h-14 object-contain shrink-0">
                                <span class="text-slate-200 text-xs not-italic font-semibold">${pokemon.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        });

        zoneDiv.addEventListener('mouseleave', () => {
            info.innerHTML = 'Mueve el raton por el mapa para ver que Pokemon aparecen en cada zona.';
        });

        mapa.appendChild(zoneDiv);
    });
}

const frases = [
    'Crea tu equipo definitivo con avatar propio.',
    'Haz el test de personalidad estilo Mundo Misterioso.',
    'Explora Hoenn y descubre Pokemon por zona.',
    'Guarda tu perfil de entrenador en localStorage.'
];

let fraseIndex = 0;
const textElement = document.getElementById('changing-text');

function cambiarFrase() {
    if (!textElement) return;

    textElement.style.opacity = 0;

    setTimeout(() => {
        fraseIndex = (fraseIndex + 1) % frases.length;
        textElement.innerText = frases[fraseIndex];
        textElement.style.opacity = 1;
    }, 450);
}

function initStaggeredReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const children = entry.target.querySelectorAll('.reveal-child');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.classList.add('active-child');
                }, index * 180);
            });

            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.stagger-section').forEach((section) => {
        observer.observe(section);
    });
}

document.addEventListener('click', (event) => {
    if (!autocompleteList || !searchInput) return;
    if (!autocompleteList.contains(event.target) && event.target !== searchInput) {
        autocompleteList.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadPokemonList();
    updateTeamUI();
    initAvatar();
    initTrainerProfile();
    initMapa();
    initStaggeredReveal();

    if (avatarImg) avatarImg.src = trainerProfile.avatar;
    if (avatarName) avatarName.innerText = `Avatar actual: ${trainerProfile.avatarLabel}`;

    setInterval(cambiarFrase, 3500);
});
