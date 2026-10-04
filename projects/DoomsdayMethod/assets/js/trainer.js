// The trainer: one date at a time from the whole Gregorian calendar (the app's
// widest range). Mounted below the home page hero and on /trainer/, whose page
// section adds session stats, the timer toggle and the cheat sheet.
import { WEEKDAYS, TRAINER_YEARS, formatDate, solve, randomDate } from "./doomsday.js";
import { renderSteps, weekdayButtons, storage, store } from "./ui.js";

const NUDGE_EVERY = 10;

function mount(root) {
	const q = (sel) => root.querySelector(sel);
	// Stats and the timer toggle can sit outside the card, elsewhere on the trainer page.
	const scope = root.closest("[data-trainer-page]") || root;
	const dateEl = q(".quiz-date");
	const feedback = q(".feedback"), solution = q(".solution"), nextRow = q(".next-row");
	const nextBtn = q("[data-next]"), workingBtn = q("[data-working]");
	const nudge = q(".nudge"), timerEl = q(".timer");


	const session = { answered: 0, correct: 0, streak: 0, time: 0 };
	let best = Number(storage("dm.best", 0)) || 0;
	let current = null, startedAt = 0, tick = 0;

	const pad = weekdayButtons(q(".weekdays"), (d) => answer(d));

	function next() {
		const date = randomDate(TRAINER_YEARS[0], TRAINER_YEARS[1]);
		current = { ...date, solution: solve(date.year, date.month, date.day) };
		dateEl.textContent = formatDate(date.year, date.month, date.day);
		pad.reset();
		feedback.hidden = true;
		solution.hidden = true;
		nextRow.hidden = true;
		if (nudge) nudge.hidden = true;
		startedAt = performance.now();
		clearInterval(tick);
		if (timerEl) {
			timerEl.textContent = "0.0 s";
			tick = setInterval(() => { timerEl.textContent = `${((performance.now() - startedAt) / 1000).toFixed(1)} s`; }, 100);
		}
	}

	function answer(picked) {
		if (!current) return;
		const seconds = (performance.now() - startedAt) / 1000;
		clearInterval(tick);
		if (timerEl) timerEl.textContent = `${seconds.toFixed(1)} s`;
		const s = current.solution;
		const right = picked === s.weekday;
		pad.reveal(picked, s.weekday);

		session.answered++;
		if (right) {
			session.correct++;
			session.streak++;
			session.time += seconds;
			if (session.streak > best) { best = session.streak; store("dm.best", best); }
		} else {
			session.streak = 0;
		}

		feedback.hidden = false;
		feedback.className = `feedback ${right ? "good" : "bad"}`;
		feedback.textContent = right
			? `Right, in ${seconds.toFixed(1)} seconds.${session.streak > 1 ? ` ${session.streak} in a row.` : ""}`
			: `Not this time: it was a ${WEEKDAYS[s.weekday]}, not a ${WEEKDAYS[picked]}.`;
		renderSteps(solution.querySelector("ol"), s.steps, { answer: true });
		solution.hidden = right;
		workingBtn.hidden = !right;
		nextRow.hidden = false;
		if (nudge) {
			nudge.hidden = session.answered % NUDGE_EVERY !== 0;
			const count = nudge.querySelector("[data-count]");
			if (count) count.textContent = String(session.answered);
		}
		current = null;
		renderStats();
		nextBtn.focus({ preventScroll: true });
	}

	function renderStats() {
		const set = (key, value) => { for (const node of scope.querySelectorAll(`[data-stat="${key}"]`)) node.textContent = value; };
		set("streak", String(session.streak));
		set("best", String(best));
		set("accuracy", session.answered ? `${Math.round((100 * session.correct) / session.answered)}%` : "–");
		set("time", session.correct ? `${(session.time / session.correct).toFixed(1)} s` : "–");
	}

	nextBtn.addEventListener("click", next);
	workingBtn.addEventListener("click", () => { solution.hidden = false; workingBtn.hidden = true; });

	const timerToggle = scope.querySelector("[data-timer-toggle]");
	if (timerToggle && timerEl) {
		const apply = () => { timerEl.hidden = !timerToggle.checked; store("dm.timer", timerToggle.checked); };
		timerToggle.checked = storage("dm.timer", true);
		timerToggle.addEventListener("change", apply);
		apply();
	}

	// Keys 0–6 answer (Sunday is 0), Enter gives the next date. Only while the
	// trainer is on screen, so typing elsewhere on a long page is left alone.
	let visible = true;
	new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(root);
	document.addEventListener("keydown", (event) => {
		if (!visible || event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.target.closest("input, select, textarea")) return;
		if (current && /^[0-6]$/.test(event.key)) {
			event.preventDefault();
			answer(Number(event.key));
		} else if (!current && event.key === "Enter" && !event.target.closest("a, summary")) {
			event.preventDefault();
			next();
		}
	});

	renderStats();
	next();
}

for (const root of document.querySelectorAll("[data-trainer]")) mount(root);
