window.onload = function() {
	// Check for URLs ending with /index.html
	if (window.location.pathname.endsWith('/index.html')) {
	  window.history.replaceState({}, document.title, window.location.pathname.slice(0, -11));
	}
  };

document.addEventListener('DOMContentLoaded', function() {
	const facts = [
		"My favorite sports team is VfB Stuttgart ⚪🔴",
		"I love dancing to techno music 🎶",
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