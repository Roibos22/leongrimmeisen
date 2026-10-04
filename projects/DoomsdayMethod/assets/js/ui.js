// Small DOM helpers shared by the home page, the guide, the trainer and the day finder.
import { WEEKDAYS, WEEKDAYS_SHORT } from "./doomsday.js";

export function el(tag, attrs = {}, ...children) {
	const node = document.createElement(tag);
	for (const [key, value] of Object.entries(attrs)) {
		if (key === "class") node.className = value;
		else if (key === "text") node.textContent = value;
		else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
		else node.setAttribute(key, value);
	}
	node.append(...children.filter((c) => c != null));
	return node;
}

// Fills an <ol class="steps"> with a solution from solve().
export function renderSteps(list, steps, { answer } = {}) {
	list.replaceChildren(...steps.map((step, i) => el("li",
		{ class: answer && i === steps.length - 1 ? "answer-step" : "" },
		el("div", {}, el("strong", { text: step.title }), el("p", { text: step.text })),
	)));
}

// Seven weekday buttons in the app's order, Monday first and Sunday last.
// Each shows its number (Sunday = 0), which is also its keyboard shortcut.
const APP_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function weekdayButtons(container, onPick) {
	const buttons = APP_ORDER.map((i) => el("button",
		{ type: "button", class: "weekday", "aria-label": WEEKDAYS[i], "data-day": String(i), onclick: () => onPick(i) },
		WEEKDAYS_SHORT[i], el("kbd", { text: String(i) }),
	));
	container.replaceChildren(...buttons);
	return {
		reveal(picked, correct) {
			for (const b of buttons) {
				const d = Number(b.dataset.day);
				b.disabled = true;
				if (d === correct) b.classList.add("is-right");
				else if (d === picked) b.classList.add("is-wrong");
			}
		},
		reset() {
			for (const b of buttons) { b.disabled = false; b.classList.remove("is-right", "is-wrong"); }
		},
	};
}

export function storage(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw == null ? fallback : JSON.parse(raw);
	} catch {
		return fallback;
	}
}

export function store(key, value) {
	try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: keep going without */ }
}
