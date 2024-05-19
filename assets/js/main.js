window.onload = function() {
	// Check for URLs ending with /index.html
	if (window.location.pathname.endsWith('/index.html')) {
	  window.history.replaceState({}, document.title, window.location.pathname.slice(0, -11));
	}
  };

  document.addEventListener('DOMContentLoaded', function() {
	const facts = [
		"I was born on a rainy day in April.",
		"I can play three musical instruments.",
		"I have a pet turtle named Speedy.",
		"My favorite book is 'To Kill a Mockingbird'.",
		"I've visited 12 different countries so far."
	];

	const factDisplay = document.getElementById('factDisplay');
	const factButton = document.getElementById('factButton');

	// Set initial text
	factDisplay.textContent = 'Press the button to see a fact!';

	factButton.addEventListener('click', function() {
		const randomFact = facts[Math.floor(Math.random() * facts.length)];
		displayFact(randomFact);
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
			}
		}, 20); // Adjust typing speed by changing the interval time.
	}
});