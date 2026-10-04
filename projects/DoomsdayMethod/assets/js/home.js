// Home page: one date from this year to solve, and the tap-through worked example.
import { WEEKDAYS, MONTHS, doomsdayOf, monthDoomsday, monthHook, isLeap, ordinal, solve, randomInt, daysInMonth } from "./doomsday.js";
import { renderSteps, weekdayButtons } from "./ui.js";

const quiz = document.querySelector("[data-try]");
if (quiz) {
	const year = new Date().getFullYear();
	const dd = doomsdayOf(year);
	const dateEl = quiz.querySelector(".quiz-date");
	const subEl = quiz.querySelector(".quiz-sub");
	const hintEl = quiz.querySelector(".hint");
	const hintBtn = quiz.querySelector("[data-hint]");
	const feedback = quiz.querySelector(".feedback");
	const solution = quiz.querySelector(".solution");
	const nextRow = quiz.querySelector(".next-row");
	let current;

	const buttons = weekdayButtons(quiz.querySelector(".weekdays"), (picked) => {
		if (!current) return;
		const s = solve(year, current.month, current.day, { knownDoomsday: true });
		buttons.reveal(picked, s.weekday);
		const right = picked === s.weekday;
		feedback.hidden = false;
		feedback.className = `feedback ${right ? "good" : "bad"}`;
		feedback.textContent = right
			? `Right: ${WEEKDAYS[s.weekday]}. That is the whole method for this year.`
			: `Not quite: it is ${WEEKDAYS[s.weekday]}. Here is the route.`;
		renderSteps(solution.querySelector("ol"), s.steps, { answer: true });
		solution.hidden = false;
		nextRow.hidden = false;
		hintBtn.hidden = true;
		current = null;
	});

	function next() {
		const month = randomInt(1, 12);
		current = { month, day: randomInt(1, daysInMonth(year, month)) };
		dateEl.textContent = `${current.day} ${MONTHS[month - 1]} ${year}`;
		subEl.textContent = `${year}'s doomsday is ${WEEKDAYS[dd]}. Which weekday is this?`;
		hintEl.hidden = true;
		hintBtn.hidden = false;
		feedback.hidden = true;
		solution.hidden = true;
		nextRow.hidden = true;
		buttons.reset();
	}

	hintBtn.addEventListener("click", () => {
		const base = monthDoomsday(current.month, isLeap(year));
		hintEl.textContent = `${MONTHS[current.month - 1]}'s doomsday date is the ${ordinal(base)} (${monthHook(current.month, isLeap(year))}), so ${base} ${MONTHS[current.month - 1]} is a ${WEEKDAYS[dd]}. Count from there in sevens.`;
		hintEl.hidden = false;
		hintBtn.hidden = true;
	});
	quiz.querySelector("[data-next]").addEventListener("click", next);
	next();
}

// Tap-through: reveal one step per click.
for (const walk of document.querySelectorAll("[data-walk]")) {
	const [y, m, d] = walk.dataset.walk.split("-").map(Number);
	const s = solve(y, m, d);
	const list = walk.querySelector("ol");
	const nextBtn = walk.querySelector("[data-step]");
	const answer = walk.querySelector(".walk-answer");
	renderSteps(list, s.steps, { answer: true });
	const items = [...list.children];
	let shown = 0;
	const show = () => {
		items.forEach((li, i) => li.classList.toggle("is-hidden", i >= shown));
		const done = shown >= items.length;
		nextBtn.textContent = done ? "Start again" : shown === 0 ? "Show step 1" : `Show step ${shown + 1}`;
		answer.hidden = !done;
	};
	nextBtn.addEventListener("click", () => {
		shown = shown >= items.length ? 0 : shown + 1;
		show();
	});
	answer.textContent = WEEKDAYS[s.weekday];
	show();
}
