const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
const mobile = window.matchMedia('(max-width: 42rem)');

function closeMenu(returnFocus = false) {
  menu.setAttribute('aria-expanded', 'false');
  if (returnFocus) menu.focus();
}

menu.classList.add('ready');
menu.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') === 'false'));
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
mobile.addEventListener('change', () => closeMenu());

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('has-reveal');
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('waiting');
        observer.unobserve(entry.target);
      }
    }
  });

  for (const element of document.querySelectorAll('[data-reveal]')) {
    if (element.getBoundingClientRect().top >= window.innerHeight) {
      element.classList.add('waiting');
      reveal.observe(element);
    }
  }
}

const photographs = {
  apartment: [
    ['conversation.jpg', 'Sculptural seating in a sunken living room'],
    ['conversation-detail.jpg', 'Red travertine, walnut and ivory upholstery in detail'],
  ],
  bath: [
    ['stone.jpg', 'Veined marble and bronze fittings in a bathing room'],
    ['stone-detail.jpg', 'A bronze tap over a carved marble basin'],
  ],
  clinic: [
    ['arrival.jpg', 'Timber and stone in a boutique reception lounge'],
    ['arrival-detail.jpg', 'A leather lounge chair against warm timber paneling'],
  ],
};

const gallery = document.querySelector('.gallery');
const galleryTitle = gallery.querySelector('h2');
const galleryPhoto = gallery.querySelector('.gallery-photo');
const galleryCount = gallery.querySelector('.gallery-count');
const closeGallery = gallery.querySelector('.gallery-close');
const previous = gallery.querySelector('.gallery-prev');
const next = gallery.querySelector('.gallery-next');
let slides = [];
let slide = 0;
let opener;

function showPhoto(index) {
  slide = (index + slides.length) % slides.length;
  const [file, description] = slides[slide];
  galleryPhoto.src = `assets/${file}`;
  galleryPhoto.alt = description;
  galleryCount.textContent = `${slide + 1} / ${slides.length}`;
}

if (typeof gallery.showModal === 'function') {
  for (const link of document.querySelectorAll('[data-gallery]')) {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      slides = photographs[link.dataset.gallery];
      galleryTitle.textContent = link.querySelector('h3').textContent;
      showPhoto(0);
      gallery.showModal();
      closeGallery.focus();
    });
  }

  previous.addEventListener('click', () => showPhoto(slide - 1));
  next.addEventListener('click', () => showPhoto(slide + 1));
  closeGallery.addEventListener('click', () => gallery.close());
  gallery.addEventListener('close', () => opener?.focus());
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(slide + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
}
