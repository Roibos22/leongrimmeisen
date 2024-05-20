window.onload = function() {
	if (window.location.pathname.endsWith('/index.html')) {
	  window.history.replaceState({}, document.title, window.location.pathname.slice(0, -11));
	}
};

window.onload = function () {
	const menu_btn = document.querySelector('.hamburger')
	const mobile_menu = document.querySelector('.mobile-nav')
	const section_btn = document.querySelectorAll('.section-button')

	menu_btn.addEventListener('click', function () {
		menu_btn.classList.toggle('is-active');
		mobile_menu.classList.toggle('is-active');
	})

	section_btn.forEach(button => {
		button.addEventListener('click', function () {
			menu_btn.classList.toggle('is-active');
			mobile_menu.classList.toggle('is-active');
		});
	});
}

// RANDOM FACT GENERATOR

document.addEventListener('DOMContentLoaded', function() {
	const facts = [
		"My favorite sports team is VfB Stuttgart ⚪🔴",
		// "I love dancing to techno music 🎶",
		"My favorite book is ‘The subtle art of not giving a fuck’ by Mark Manson 📖",
		"I love cooking pizza in my stone oven 🍕",
		"I have 3 older brothers from whom I learned a lot 👨‍👨‍👦‍👦",
		"I have a Bachelor's degree in International Business 🧑‍🎓",
		"I lived in Cape Town for one year while volunteering in a children’s home 🇿🇦",
		"I am a coffee addict ☕",
		"My role model is Robert Marc Lehmann 🦏",
		"I ran my first Marathon in 4:20:23 (to be beaten) 🏃‍♂️"
	];

	let currentIndex = 0;
	shuffleFacts(facts); // Initial shuffle of the facts

	const factDisplay = document.getElementById('factDisplay');
	const factButton = document.getElementById('factButton');

	// Set initial text
	factDisplay.textContent = 'Press the button to generate random facts about me!';

	factButton.addEventListener('click', function() {
		factButton.disabled = true;
		if (currentIndex >= facts.length) {
			shuffleFacts(facts); // Reshuffle the facts after all have been shown
			currentIndex = 0;
		}
		displayFact(facts[currentIndex++]);
	});

	function displayFact(fact) {
		let i = 0;
		factDisplay.textContent = ''; // Clear previous fact.

		const typingInterval = setInterval(function() {
			if (i < fact.length) {
				factDisplay.textContent += fact[i];
				i++;
			} else {
				clearInterval(typingInterval);
				factButton.disabled = false;
			}
		}, 20); // Adjust typing speed by changing the interval time.
	}

	function shuffleFacts(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]]; // Swap elements
		}
	}
});

// NAV BAR SCROLLING

document.addEventListener("DOMContentLoaded", function() {
	// Select all anchor tags inside the .desktop-nav element
	document.querySelectorAll('.desktop-nav a').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault(); // Prevent default anchor click behavior
			const targetId = this.getAttribute("href");
			const targetElement = document.querySelector(targetId);
			if (targetElement) {
				smoothScrollTo(targetElement.offsetTop, 300); // Scroll over 600 milliseconds
			}
		});
	});
	
	function smoothScrollTo(target, duration) {
		const start = window.scrollY;
		const change = target - start;
		let currentTime = 0;
		const increment = 20;

		function animateScroll() {
			currentTime += increment;
			const val = Math.easeInOutQuad(currentTime, start, change, duration);
			window.scrollTo(0, val);
			if (currentTime < duration) {
				setTimeout(animateScroll, increment);
			}
		}
		animateScroll();
	}

	// Easing function - this can be customized
	Math.easeInOutQuad = function (t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t + b;
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	};
});