// Home page: the tap-through worked example. The hero trainer is trainer.js.
import { WEEKDAYS, solve } from "./doomsday.js";
import { renderSteps } from "./ui.js";

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
