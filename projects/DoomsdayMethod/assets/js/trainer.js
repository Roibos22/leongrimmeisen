// The free web trainer: five levels, from the twelve month dates to any date 1600–2399.
import {
	WEEKDAYS, MONTHS, doomsdayOf, monthDoomsday, monthHook, ordinal, formatDate,
	solve, randomInt, randomDate, isLeap,
} from "./doomsday.js";
import { el, renderSteps, weekdayButtons, storage, store } from "./ui.js";

const THIS_YEAR = new Date().getFullYear();
const LEVELS = {
	months:   { kind: "month" },
	year:     { kind: "date", from: THIS_YEAR, to: THIS_YEAR, known: true },
	doomsday: { kind: "doomsday", from: 1900, to: 2099 },
	any:      { kind: "date", from: 1900, to: 2099 },
	expert:   { kind: "date", from: 1600, to: 2399 },
};
const MONTH_CHOICES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 28, 29];
const NUDGE_EVERY = 10;

const root = document.querySelector("[data-trainer]");
const q = (sel) => root.querySelector(sel);
const promptEl = q(".quiz-date"), subEl = q(".quiz-sub"), timerEl = q(".timer");
const weekdaysEl = q(".weekdays"), numbersEl = q(".choices-num");
const feedback = q(".feedback"), solution = q(".solution"), nextRow = q(".next-row");
const showWorking = q("[data-working]"), nudge = q(".nudge");

let level = new URLSearchParams(location.search).get("level");
if (!LEVELS[level]) level = storage("dm.level", "year");
if (!LEVELS[level]) level = "year";

const best = storage("dm.best", {});
const session = { answered: 0, correct: 0, streak: 0, time: 0 };
let current = null, startedAt = 0, tick = 0;

const weekdayPad = weekdayButtons(weekdaysEl, (d) => answer(d));
const numberButtons = MONTH_CHOICES.map((n) => el("button",
	{ type: "button", class: "weekday", "data-n": String(n), onclick: () => answer(n) }, String(n)));
numbersEl.replaceChildren(...numberButtons);

function makeQuestion() {
	const cfg = LEVELS[level];
	if (cfg.kind === "month") {
		const month = randomInt(1, 12);
		const leap = month <= 2 ? Math.random() < 0.5 : false;
		const n = monthDoomsday(month, leap);
		return {
			prompt: MONTHS[month - 1] + (month <= 2 ? (leap ? ", leap year" : ", common year") : ""),
			sub: "Which date in this month is always a doomsday?",
			correct: n,
			label: `the ${ordinal(n)}`,
			steps: [{ title: "Month doomsday", text: `${MONTHS[month - 1]}'s doomsday date is the ${ordinal(n)}: ${monthHook(month, leap)}.` }],
		};
	}
	if (cfg.kind === "doomsday") {
		const year = randomInt(cfg.from, cfg.to);
		const s = solve(year, 1, 1);
		return {
			prompt: String(year),
			sub: `What is ${year}'s doomsday?`,
			correct: s.doomsday,
			label: WEEKDAYS[s.doomsday],
			steps: s.steps.slice(0, 2),
		};
	}
	const { year, month, day } = randomDate(cfg.from, cfg.to);
	const s = solve(year, month, day, { knownDoomsday: cfg.known });
	return {
		prompt: formatDate(year, month, day),
		sub: cfg.known ? `${year}'s doomsday is ${WEEKDAYS[doomsdayOf(year)]}. Which weekday is this?` : "Which weekday is this?",
		correct: s.weekday,
		label: WEEKDAYS[s.weekday],
		steps: s.steps,
	};
}

function next() {
	current = makeQuestion();
	const month = LEVELS[level].kind === "month";
	weekdaysEl.hidden = month;
	numbersEl.hidden = !month;
	weekdayPad.reset();
	for (const b of numberButtons) { b.disabled = false; b.classList.remove("is-right", "is-wrong"); }
	promptEl.textContent = current.prompt;
	subEl.textContent = current.sub;
	feedback.hidden = true;
	solution.hidden = true;
	nextRow.hidden = true;
	nudge.hidden = true;
	startedAt = performance.now();
	clearInterval(tick);
	tick = setInterval(() => { timerEl.textContent = `${((performance.now() - startedAt) / 1000).toFixed(1)} s`; }, 100);
	timerEl.textContent = "0.0 s";
}

function answer(picked) {
	if (!current) return;
	const seconds = (performance.now() - startedAt) / 1000;
	clearInterval(tick);
	timerEl.textContent = `${seconds.toFixed(1)} s`;
	const right = picked === current.correct;

	if (LEVELS[level].kind === "month") {
		for (const b of numberButtons) {
			const n = Number(b.dataset.n);
			b.disabled = true;
			if (n === current.correct) b.classList.add("is-right");
			else if (n === picked) b.classList.add("is-wrong");
		}
	} else {
		weekdayPad.reveal(picked, current.correct);
	}

	session.answered++;
	if (right) {
		session.correct++;
		session.streak++;
		session.time += seconds;
		if (session.streak > (best[level] || 0)) { best[level] = session.streak; store("dm.best", best); }
	} else {
		session.streak = 0;
	}

	feedback.hidden = false;
	feedback.className = `feedback ${right ? "good" : "bad"}`;
	feedback.textContent = right
		? `Right: ${current.label}, in ${seconds.toFixed(1)} seconds.`
		: `Not this time: it is ${current.label}.`;
	renderSteps(solution.querySelector("ol"), current.steps, { answer: true });
	solution.hidden = right;
	showWorking.hidden = !right;
	nextRow.hidden = false;
	nudge.hidden = session.answered % NUDGE_EVERY !== 0;
	if (!nudge.hidden) nudge.querySelector("[data-count]").textContent = String(session.answered);
	current = null;
	renderStats();
	q("[data-next]").focus({ preventScroll: true });
}

function renderStats() {
	const set = (key, value) => { q(`[data-stat="${key}"]`).textContent = value; };
	set("streak", String(session.streak));
	set("best", String(best[level] || 0));
	set("accuracy", session.answered ? `${Math.round((100 * session.correct) / session.answered)}%` : "–");
	set("time", session.correct ? `${(session.time / session.correct).toFixed(1)} s` : "–");
}

function selectLevel(name) {
	if (name !== level) { session.answered = session.correct = session.streak = session.time = 0; }
	level = name;
	store("dm.level", level);
	for (const b of root.querySelectorAll("[data-level]")) b.setAttribute("aria-pressed", String(b.dataset.level === level));
	const url = new URL(location.href);
	url.searchParams.set("level", level);
	history.replaceState(null, "", url);
	renderStats();
	next();
}

for (const b of root.querySelectorAll("[data-level]")) b.addEventListener("click", () => selectLevel(b.dataset.level));
q("[data-next]").addEventListener("click", next);
showWorking.addEventListener("click", () => { solution.hidden = false; showWorking.hidden = true; });

const timerToggle = document.querySelector("[data-timer-toggle]");
const applyTimer = () => { timerEl.hidden = !timerToggle.checked; store("dm.timer", timerToggle.checked); };
timerToggle.checked = storage("dm.timer", true);
timerToggle.addEventListener("change", applyTimer);
applyTimer();

document.addEventListener("keydown", (event) => {
	if (event.metaKey || event.ctrlKey || event.altKey) return;
	if (event.target.closest("input, select, textarea")) return;
	if (current && LEVELS[level].kind !== "month" && /^[0-6]$/.test(event.key)) {
		event.preventDefault();
		answer(Number(event.key));
	} else if (!current && event.key === "Enter" && !event.target.closest("a, summary, .level")) {
		event.preventDefault();
		next();
	}
});

// Cheat sheet: site.js fills in this year's doomsday; the leap note lives here.
for (const node of document.querySelectorAll("[data-this-leap]")) {
	node.textContent = isLeap(THIS_YEAR) ? "a leap year" : "not a leap year";
}

selectLevel(level);
