const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  navLinks.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  navLinks.classList.toggle('is-open', !isOpen);
});

navLinks.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

document.querySelector('#year').textContent = new Date().getFullYear();

const portal = document.querySelector('#video-portal');
const portalTrigger = document.querySelector('[data-open-portal]');
const portalClose = document.querySelector('.portal-close');

const portalDevice = document.querySelector('.portal-device');
const portalScene = document.querySelector('.portal-scene');

function openVideoPortal(event) {
  if (event) event.preventDefault();
  if (portal.open) return;

  const portrait = document.querySelector('.portrait-card').getBoundingClientRect();
  const portraitIsVisible = portrait.bottom > 0 && portrait.top < window.innerHeight;
  const startX = portraitIsVisible ? portrait.left + portrait.width / 2 - window.innerWidth / 2 : 0;
  const startY = portraitIsVisible ? portrait.top + portrait.height / 2 - window.innerHeight / 2 : 0;
  portalDevice.style.setProperty('--start-x', `${startX}px`);
  portalDevice.style.setProperty('--start-y', `${startY}px`);
  portalScene.style.setProperty('--start-x', `${startX}px`);
  portalScene.style.setProperty('--start-y', `${startY}px`);
  portal.showModal();
}

portalTrigger.addEventListener('click', openVideoPortal);

portalClose.addEventListener('click', () => portal.close());
portal.addEventListener('click', (event) => {
  if (event.target === portal) portal.close();
});
portal.addEventListener('close', () => portalTrigger.focus());




