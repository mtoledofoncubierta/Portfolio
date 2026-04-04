// ============================================================
// FUNCIONALIDAD 5 (BACKEND) — EmailJS
// Envío real de emails desde el navegador usando la API de EmailJS
//
// CONFIGURACIÓN (pasos):
//   1. Crea una cuenta gratuita en https://www.emailjs.com
//   2. Crea un "Email Service" (elige Gmail, Outlook, etc.)
//   3. Crea un "Email Template" con estas variables:
//        {{nombre}}  {{email}}  {{mensaje}}
//   4. Ve a "Account > API Keys" y copia tu Public Key
//   5. Sustituye las tres constantes de abajo con tus propios valores
// ============================================================
const EMAILJS_PUBLIC_KEY  = "j7mNqiWiNtcaaOWmg";   // Account > API Keys
const EMAILJS_SERVICE_ID  = "service_ut228kj";   // Email Services
const EMAILJS_TEMPLATE_ID = "template_unt62ak";  // Email Templates

emailjs.init(EMAILJS_PUBLIC_KEY);

// ============================================================
// FUNCIONALIDAD 1 (FRONTEND) — Efecto Typewriter en el hero
// ============================================================
const frases = [
  "Desarrolladora Web Junior",
  "Apasionada del diseño web",
  "Estudiante de DAM",
  "Creadora de experiencias digitales ✨",
];

let fraseIndex = 0;
let charIndex  = 0;
let borrando   = false;
const typeEl   = document.getElementById("typewriter");

function typewriter() {
  const frase = frases[fraseIndex];

  if (borrando) {
    charIndex--;
    typeEl.textContent = frase.slice(0, charIndex);
  } else {
    charIndex++;
    typeEl.textContent = frase.slice(0, charIndex);
  }

  let velocidad = borrando ? 45 : 85;

  if (!borrando && charIndex === frase.length) {
    velocidad  = 1800;
    borrando   = true;
  } else if (borrando && charIndex === 0) {
    borrando    = false;
    fraseIndex  = (fraseIndex + 1) % frases.length;
    velocidad   = 350;
  }

  setTimeout(typewriter, velocidad);
}

typewriter();

// ============================================================
// FUNCIONALIDAD 2 (FRONTEND) — Scroll Reveal
// Los elementos con clase .reveal aparecen al entrar en el viewport
// ============================================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

// ============================================================
// FUNCIONALIDAD 3 (FRONTEND) — Dark / Light Mode
// Guarda la preferencia del usuario en localStorage
// ============================================================
const themeBtn  = document.getElementById("theme-toggle");
const htmlEl    = document.documentElement;
const savedTheme = localStorage.getItem("theme") || "dark";

htmlEl.setAttribute("data-theme", savedTheme);
themeBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeBtn.addEventListener("click", () => {
  const actual  = htmlEl.getAttribute("data-theme");
  const nuevo   = actual === "dark" ? "light" : "dark";
  htmlEl.setAttribute("data-theme", nuevo);
  localStorage.setItem("theme", nuevo);
  themeBtn.textContent = nuevo === "dark" ? "☀️" : "🌙";
});

// ============================================================
// FUNCIONALIDAD 4 (FRONTEND) — Flip 3D de cards
// Clic para girar la card y ver detalles al reverso;
// clic de nuevo para volver al frente.
// ============================================================
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (e) => {
    // Si el clic fue sobre el enlace del reverso, dejar que navegue
    if (e.target.closest("a")) return;
    card.classList.toggle("flipped");
  });
});

// ============================================================
// NAVBAR — sombra al hacer scroll
// ============================================================
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

// ============================================================
// FUNCIONALIDAD 5 (BACKEND) — Formulario de contacto con EmailJS
// ============================================================
const form       = document.getElementById("contact-form");
const statusEl   = document.getElementById("form-status");
const btnText    = form.querySelector(".btn-text");
const btnLoading = form.querySelector(".btn-loading");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validación básica del lado cliente
  const nombre  = form.nombre.value.trim();
  const email   = form.email.value.trim();
  const mensaje = form.mensaje.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nombre || !email || !mensaje) {
    mostrarEstado("Por favor, rellena todos los campos.", "error");
    return;
  }

  if (!emailRegex.test(email)) {
    mostrarEstado("Introduce un email válido.", "error");
    return;
  }

  // Estado de carga
  btnText.hidden    = true;
  btnLoading.hidden = false;
  statusEl.className = "form-status";
  statusEl.style.display = "none";

  // Enviar email via EmailJS (Backend)
  emailjs
    .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
    .then(() => {
      mostrarEstado("✅ ¡Mensaje enviado! Te responderé lo antes posible.", "success");
      form.reset();
    })
    .catch(() => {
      mostrarEstado("❌ Hubo un error al enviar. Inténtalo de nuevo.", "error");
    })
    .finally(() => {
      btnText.hidden    = false;
      btnLoading.hidden = true;
    });
});

function mostrarEstado(mensaje, tipo) {
  statusEl.textContent = mensaje;
  statusEl.className   = "form-status " + tipo;
}

// ============================================================
// Año actual en el footer
// ============================================================
document.getElementById("year").textContent = new Date().getFullYear();
