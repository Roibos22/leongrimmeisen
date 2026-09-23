/* ===================================================================
   leongrimmeisen.de — main page

   One DOMContentLoaded handler per concern. (There used to be two
   `window.onload = …` assignments here; the second overwrote the
   first, so the URL cleanup never ran.)
   =================================================================== */

if ('scrollRestoration' in history) {
	history.scrollRestoration = 'manual';
}

/* --------------- TRIM /index.html FROM THE URL --------------- */

document.addEventListener('DOMContentLoaded', function () {
	if (window.location.pathname.endsWith('/index.html')) {
		const clean = window.location.pathname.slice(0, -'index.html'.length);
		window.history.replaceState({}, document.title, clean);
	}
});

/* --------------- MOBILE NAV --------------- */

document.addEventListener('DOMContentLoaded', function () {
	const menuBtn = document.querySelector('.hamburger');
	const mobileMenu = document.querySelector('.mobile-nav');
	if (!menuBtn || !mobileMenu) return;

	function toggleMenu(open) {
		const next = open !== undefined ? open : !menuBtn.classList.contains('is-active');
		menuBtn.classList.toggle('is-active', next);
		mobileMenu.classList.toggle('is-active', next);
		menuBtn.setAttribute('aria-expanded', String(next));
		document.body.style.overflow = next ? 'hidden' : '';
	}

	menuBtn.setAttribute('aria-expanded', 'false');
	menuBtn.setAttribute('aria-label', 'Toggle navigation menu');
	menuBtn.addEventListener('click', () => toggleMenu());

	// Close when a section link is tapped, and when Escape is pressed.
	mobileMenu.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', () => toggleMenu(false));
	});
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && menuBtn.classList.contains('is-active')) toggleMenu(false);
	});
});

/* --------------- RANDOM FACT GENERATOR --------------- */

document.addEventListener('DOMContentLoaded', function () {
	const facts = [
		"My favorite sports team is VfB Stuttgart ⚪🔴",
		"My favorite book is ‘The subtle art of not giving a fuck’ by Mark Manson 📖",
		"I love cooking pizza in my stone oven 🍕",
		"I have 3 older brothers from whom I learned a lot 👨‍👨‍👦‍👦",
		"I have a Bachelor's degree in International Business 🧑‍🎓",
		"I lived in Cape Town for one year while volunteering in a children’s home 🇿🇦",
		"I am a coffee addict ☕",
		"My role model is Robert Marc Lehmann 🦏",
		"I ran my first Marathon in 4:20:23 (to be beaten) 🏃‍♂️"
	];

	const factDisplay = document.getElementById('factDisplay');
	const factButton = document.getElementById('factButton');
	if (!factDisplay || !factButton) return;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let currentIndex = 0;
	let typingInterval = null;

	shuffle(facts);
	factDisplay.textContent = 'Press the button to generate random facts about me!';

	factButton.addEventListener('click', function () {
		if (currentIndex >= facts.length) {
			shuffle(facts);
			currentIndex = 0;
		}
		displayFact(facts[currentIndex++]);
	});

	function displayFact(fact) {
		clearInterval(typingInterval);
		factDisplay.textContent = '';

		// Respect reduced-motion: show the whole line at once.
		if (reduceMotion) {
			factDisplay.textContent = fact;
			return;
		}

		factButton.disabled = true;
		const chars = Array.from(fact); // split by code point, not UTF-16 unit
		let i = 0;
		typingInterval = setInterval(function () {
			if (i < chars.length) {
				factDisplay.textContent += chars[i++];
			} else {
				clearInterval(typingInterval);
				factButton.disabled = false;
			}
		}, 20);
	}

	function shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
});

/* --------------- SCROLL REVEAL --------------- */

document.addEventListener('DOMContentLoaded', function () {
	const targets = document.querySelectorAll('[data-reveal]');
	if (!targets.length) return;

	// No IntersectionObserver, or the user asked for less motion: show everything.
	if (!('IntersectionObserver' in window) ||
		window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		targets.forEach(el => el.classList.add('is-visible'));
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

	targets.forEach(el => observer.observe(el));
});

/* --------------- NAV: SMOOTH SCROLL + ACTIVE SECTION --------------- */

document.addEventListener('DOMContentLoaded', function () {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			const target = document.querySelector(this.getAttribute('href'));
			if (!target) return;
			e.preventDefault();
			target.scrollIntoView({
				behavior: reduceMotion ? 'auto' : 'smooth',
				block: 'start'
			});
		});
	});

	// Highlight the nav entry for whichever section is currently in view.
	const sections = document.querySelectorAll('main section[id]');
	const navLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');
	if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

	const spy = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;
			navLinks.forEach(link => {
				link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
			});
		});
	}, { rootMargin: '-45% 0px -50% 0px' });

	sections.forEach(section => spy.observe(section));
});
