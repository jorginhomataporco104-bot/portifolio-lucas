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
const portalVideos = [...portal.querySelectorAll('video')];
const portalGallery = portal.querySelector('.portal-gallery');
const lockedWorkGallery = document.querySelector('.work-gallery');
let portalScrollIntent = false;
let portalPlaybackTimer;

portalGallery.addEventListener('wheel', () => { portalScrollIntent = true; }, { passive: true });
portalGallery.addEventListener('touchmove', () => { portalScrollIntent = true; }, { passive: true });
portalGallery.addEventListener('keydown', (event) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
    portalScrollIntent = true;
  }
});

function playPortalVideo(index) {
  const video = portalVideos[index];
  if (!video || !portal.open) return;
  portalVideos.forEach((otherVideo) => {
    if (otherVideo !== video) otherVideo.pause();
  });
  video.play().catch(() => {});
}

document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach((otherVideo) => {
      if (otherVideo !== video) otherVideo.pause();
    });
  });
});

const portalVideoObserver = new IntersectionObserver((entries) => {
  const visibleVideo = entries
    .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)
    .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0]?.target;

  if (visibleVideo && portal.open && portalScrollIntent && visibleVideo.paused) {
    visibleVideo.play().catch(() => {});
  }
}, { root: portalGallery, threshold: [0, 0.5, 0.75] });

portalVideos.forEach((video) => {
  portalVideoObserver.observe(video);
});

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
  const firstVideo = portalVideos[0];
  firstVideo.muted = true;
  playPortalVideo(0);
  const startDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 4000;
  portalPlaybackTimer = window.setTimeout(() => {
    if (portal.open && !firstVideo.paused) firstVideo.muted = false;
  }, startDelay);
}

portalTrigger.addEventListener('click', openVideoPortal);

portalClose.addEventListener('click', () => portal.close());
portal.addEventListener('click', (event) => {
  if (event.target === portal) portal.close();
});

function waitForPageScroll() {
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(fallback);
      window.removeEventListener('scrollend', finish);
      resolve();
    };
    const fallback = window.setTimeout(finish, 1800);
    window.addEventListener('scrollend', finish, { once: true });
  });
}

portal.addEventListener('close', () => {
  window.clearTimeout(portalPlaybackTimer);
  portalScrollIntent = false;
  portalVideos.forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
  const wasLocked = lockedWorkGallery.classList.contains('is-locked');
  if (wasLocked) {
    lockedWorkGallery.classList.remove('is-locked');
    lockedWorkGallery.classList.add('is-unlocked');
    lockedWorkGallery.querySelector('.work-video-grid').removeAttribute('inert');
    lockedWorkGallery.querySelector('.work-video-grid').setAttribute('aria-hidden', 'false');
    lockedWorkGallery.querySelector('.work-video-lock').hidden = true;
  }
  const portfolioTitle = lockedWorkGallery.querySelector('#portfolio-title');
  portfolioTitle.focus({ preventScroll: true });
  const scrollFinished = waitForPageScroll();
  lockedWorkGallery.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  });
  if (wasLocked && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollFinished.then(() => {
      requestAnimationFrame(() => lockedWorkGallery.classList.add('show-lock-break'));
      window.setTimeout(() => lockedWorkGallery.classList.remove('show-lock-break'), 2800);
    });
  }
});

const chatLauncher = document.querySelector('.chat-launcher');
const chatPanel = document.querySelector('#chat-panel');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('#chat-input');
const chatMessages = document.querySelector('.chat-messages');
const chatAvatar = document.querySelector('.chat-avatar');
const chatWidget = document.querySelector('.portfolio-chat');

function setChatOpen(isOpen) {
  chatPanel.hidden = !isOpen;
  chatWidget.classList.toggle('is-open', isOpen);
  chatLauncher.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    chatAvatar.textContent = '👋';
    chatInput.focus();
  }
  else chatLauncher.focus();
}

function setChatEmotion(emoji) {
  chatAvatar.textContent = emoji;
  chatAvatar.classList.remove('is-changing');
  void chatAvatar.offsetWidth;
  chatAvatar.classList.add('is-changing');
}

function addChatMessage(text, sender) {
  const message = document.createElement('p');
  message.className = `chat-message chat-message-${sender}`;
  message.textContent = text;
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

function addChatLink(message, label, href, external = false) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;
  if (external) {
    link.target = '_blank';
    link.rel = 'noreferrer';
  }
  message.append(document.createElement('br'), link);
}

async function sendMascotToPortfolio() {
  const target = portalTrigger;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = chatLauncher.getBoundingClientRect();

  setChatOpen(false);
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  await new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 0 : 650));

  if (reduceMotion) {
    target.click();
    return;
  }

  const end = target.getBoundingClientRect();
  const mascot = document.createElement('span');
  mascot.className = 'chat-mascot-traveler';
  mascot.setAttribute('aria-hidden', 'true');
  mascot.textContent = '🤩';
  Object.assign(mascot.style, {
    position: 'fixed',
    zIndex: '1000',
    left: `${start.left + start.width / 2}px`,
    top: `${start.top + start.height / 2}px`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    fontSize: '42px',
    filter: 'drop-shadow(0 5px 8px rgba(0,0,0,.45))'
  });
  document.body.append(mascot);
  const travel = mascot.animate([
    { left: `${start.left + start.width / 2}px`, top: `${start.top + start.height / 2}px`, transform: 'translate(-50%, -50%) scale(1) rotate(0)' },
    { left: `${end.left + end.width / 2}px`, top: `${end.top + end.height / 2}px`, transform: 'translate(-50%, -50%) scale(.78) rotate(720deg)' }
  ], { duration: 950, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' });

  await travel.finished.catch(() => {});
  mascot.remove();
  target.click();
}

function replyToChat(text) {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/quem|o que voce faz|servico|edita|videomaker/.test(normalized)) {
    setChatEmotion('😎');
    addChatMessage('Sou o assistente do Lucas! Ele é videomaker e editor de vídeos para redes sociais.', 'bot');
    return;
  }
  if (/video|portfolio|trabalho|feira|assistir|ver/.test(normalized)) {
    setChatEmotion('🤩');
    addChatMessage('Oba! Vou abrir o portfólio para você. ✨', 'bot');
    window.setTimeout(sendMascotToPortfolio, 650);
    return;
  }
  if (/onde|tiktok|youtube|publica/.test(normalized)) {
    setChatEmotion('🤩');
    addChatMessage('O Lucas já produziu conteúdos para TikTok e YouTube. No portfólio, você pode conferir os vídeos disponíveis.', 'bot');
    return;
  }
  if (/orcamento|preco|valor|contratar|projeto|contato|whatsapp|falar/.test(normalized)) {
    setChatEmotion('😊');
    const message = addChatMessage('Que legal! Para conversar sobre seu projeto e pedir um orçamento, fale direto com o Lucas.', 'bot');
    addChatLink(message, 'Chamar no WhatsApp', 'https://wa.me/5538997370207?text=Ol%C3%A1%21%20Quero%20conversar%20sobre%20um%20projeto%20de%20v%C3%ADdeo.', true);
    return;
  }
  if (/oi|ola|bom dia|boa tarde|boa noite/.test(normalized)) {
    setChatEmotion('🥰');
    addChatMessage('Oii! 🥰 Escolha uma pergunta aqui em cima ou me escreva o que você quer saber.', 'bot');
    return;
  }
  setChatEmotion('🤔');
  addChatMessage('Hmm, ainda não sei responder isso. Escolha uma das perguntas ou fale com o Lucas pelo WhatsApp!', 'bot');
}

chatLauncher.addEventListener('click', () => setChatOpen(chatPanel.hidden));
chatClose.addEventListener('click', () => setChatOpen(false));
document.querySelectorAll('[data-chat-question]').forEach((button) => {
  button.addEventListener('click', () => {
    const question = button.dataset.chatQuestion;
    const action = button.dataset.chatAction;
    addChatMessage(question, 'user');

    if (action === 'portfolio') {
      setChatEmotion('🤩');
      addChatMessage('Vou abrir o portfólio para você. ✨', 'bot');
      window.setTimeout(sendMascotToPortfolio, 650);
      return;
    }

    if (action === 'whatsapp') {
      setChatEmotion('😊');
      addChatMessage('Vou abrir o WhatsApp para você pedir seu orçamento.', 'bot');
      window.open('https://wa.me/5538997370207?text=Ol%C3%A1%21%20Quero%20conversar%20sobre%20um%20projeto%20de%20v%C3%ADdeo.', '_blank', 'noopener,noreferrer');
      return;
    }

    if (action === 'services') {
      setChatEmotion('😎');
      const message = addChatMessage('O Lucas é videomaker e editor de vídeos para redes sociais. Ele cria conteúdos criativos e cuida da edição.', 'bot');
      addChatLink(message, 'Ver trabalhos no portfólio', '#portfolio');
      return;
    }

    replyToChat(question);
  });
});
chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  addChatMessage(text, 'user');
  chatInput.value = '';
  setChatEmotion('🤔');
  replyToChat(text);
  chatInput.focus();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !chatPanel.hidden) setChatOpen(false);
});




