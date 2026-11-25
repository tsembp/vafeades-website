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
    ['apartment-living.jpg', 'Cream sectional and low rounded table in the apartment living room'],
    ['apartment-kitchen.jpg', 'Oak cabinetry and a long island in the apartment kitchen'],
    ['apartment-dining.jpg', 'Oak dining chairs beside floor-to-ceiling windows'],
  ],
  bath: [
    ['bath-vanity.jpg', 'Floating timber vanity and backlit mirror in a stone bathroom'],
    ['bath-detail.jpg', 'Close-up of the basin, polished tap and illuminated stone backsplash'],
    ['bath-shower.jpg', 'Walk-in shower with a glass screen, large-format stone and a rainfall showerhead'],
  ],
  clinic: [
    ['clinic-lounge.jpg', 'Daylit clinic lounge with pale sofas, a white table and green accents'],
    ['clinic-desk.jpg', 'Stone reception desk in the dental clinic'],
    ['clinic-seating.jpg', 'Waiting area with timber-framed seats and a daylit view'],
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
