// Runs on every page: the mobile menu and any live "this year" card.
import { WEEKDAYS, WEEKDAYS_SHORT, MONTHS, doomsdayOf, solve } from "./doomsday.js";
import { el } from "./ui.js";

const header = document.querySelector(".site-header");
const toggle = header?.querySelector(".nav-toggle");
toggle?.addEventListener("click", () => {
	const open = header.classList.toggle("nav-open");
	toggle.setAttribute("aria-expanded", String(open));
});

const thisYear = new Date().getFullYear();
for (const node of document.querySelectorAll("[data-year]")) {
	node.textContent = String(thisYear);
}
for (const node of document.querySelectorAll("[data-this-doomsday]")) {
	node.textContent = WEEKDAYS[doomsdayOf(thisYear)];
}

const card = document.querySelector("[data-year-card]");
if (card) {
	const now = new Date();
	const year = now.getFullYear(), month = now.getMonth() + 1, day = now.getDate();
	const dd = doomsdayOf(year);
	const today = solve(year, month, day, { knownDoomsday: true });

	card.querySelector(".today").textContent =
		`Today is ${WEEKDAYS[today.weekday]}, ${day} ${MONTHS[month - 1]} ${year}.`;
	card.querySelector(".rule").textContent =
		`${year}'s doomsday is ${WEEKDAYS[dd]}. These five dates are all ${WEEKDAYS[dd]}s, this year and every year:`;
	card.querySelector(".tiles").replaceChildren(...[4, 6, 8, 10, 12].map((m, i) => el("div",
		{ class: i === 2 ? "tile tile-bomb" : "tile" },
		`${m}/${m}`, el("small", { text: WEEKDAYS_SHORT[dd] }),
	)));
	card.querySelector(".verdict").textContent = `So today: ${today.steps.at(-1).text}`;
}
