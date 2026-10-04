// Runs on every page: the mobile menu and any live "this year" card.
import { WEEKDAYS, WEEKDAYS_SHORT, MONTHS, doomsdayOf, ordinal, solve } from "./doomsday.js";
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
		`Every year, 4/4, 6/6, 8/8, 10/10 and 12/12 share one weekday: the year's doomsday. In ${year} it is ${WEEKDAYS[dd]}.`;
	card.querySelector(".tiles").replaceChildren(...[4, 6, 8, 10, 12].map((m, i) => el("div",
		{ class: i === 2 ? "tile tile-bomb" : "tile" },
		`${m}/${m}`, el("small", { text: WEEKDAYS_SHORT[dd] }),
	)));
	card.querySelector(".verdict").textContent = todayWorking(today);
}

// Today's weekday, worked out from this month's doomsday date in words.
function todayWorking({ month, day, base, nearest, delta, doomsday, weekday }) {
	const words = ["no", "one", "two", "three", "four", "five", "six"];
	const days = (n) => `${words[n]} day${n === 1 ? "" : "s"}`;
	const name = MONTHS[month - 1];
	let text = `${name}'s doomsday date is the ${ordinal(base)}, so ${base} ${name} is a ${WEEKDAYS[doomsday]}`;
	if (nearest !== base) {
		const weeks = Math.abs(nearest - base) / 7;
		const gap = weeks === 1 ? "a week" : `${words[weeks]} weeks`;
		text += `, and so is ${nearest} ${name}, ${gap} ${nearest < base ? "earlier" : "later"}`;
	}
	if (delta === 0) return `${text}. That is today: ${WEEKDAYS[weekday]}.`;
	const n = Math.abs(delta);
	const way = delta > 0 ? "later" : "earlier";
	const back = delta > 0 ? "earlier" : "later";
	const same = n >= 4 ? ` (the same as ${days(7 - n)} ${back})` : "";
	return `${text}. Today, the ${ordinal(day)}, is ${days(n)} ${way}${same}: ${WEEKDAYS[weekday]}.`;
}
