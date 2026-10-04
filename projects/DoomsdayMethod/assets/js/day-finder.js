// "What day was it?": any Gregorian date to its weekday, with the Doomsday working.
// Mounted on the day finder page (which keeps ?date= in the URL) and in the guide.
import { WEEKDAYS, MONTHS, MIN_YEAR, MAX_YEAR, isValidDate, daysInMonth, formatDate, solve } from "./doomsday.js";
import { renderSteps } from "./ui.js";

function parseParams() {
	const params = new URLSearchParams(location.search);
	const iso = params.get("date");
	if (iso && /^\d{4}-\d{1,2}-\d{1,2}$/.test(iso)) {
		const [year, month, day] = iso.split("-").map(Number);
		return { year, month, day };
	}
	if (params.has("year")) {
		return { year: Number(params.get("year")), month: Number(params.get("month")), day: Number(params.get("day")) };
	}
	return null;
}

function tense(year, month, day) {
	const now = new Date();
	const a = year * 10000 + month * 100 + day;
	const b = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
	return a < b ? "was" : a > b ? "will be" : "is";
}

export function mountFinder(root, { syncUrl = false } = {}) {
	const form = root.querySelector("form");
	const dayIn = form.elements.day, monthIn = form.elements.month, yearIn = form.elements.year;
	const error = root.querySelector(".form-error");
	const result = root.querySelector(".finder-result");
	const copyBtn = root.querySelector("[data-copy]");

	function show({ year, month, day }, { push = false, sync = true } = {}) {
		dayIn.value = day; monthIn.value = month; yearIn.value = year;
		if (!isValidDate(year, month, day)) {
			const why = !(year >= MIN_YEAR && year <= MAX_YEAR)
				? `Pick a year between ${MIN_YEAR} and ${MAX_YEAR}. Earlier dates belong to the Julian calendar in most places.`
				: `${MONTHS[month - 1] || "That month"} ${year} has ${daysInMonth(year, month) || "fewer"} days.`;
			error.textContent = why;
			error.hidden = false;
			result.hidden = true;
			return;
		}
		error.hidden = true;
		const s = solve(year, month, day);
		const verb = tense(year, month, day);
		const name = WEEKDAYS[s.weekday];
		result.querySelector(".result-date").textContent = `${formatDate(year, month, day)} ${verb} a`;
		result.querySelector(".result-day span").textContent = name;
		renderSteps(result.querySelector("ol"), s.steps, { answer: true });
		result.hidden = false;

		if (syncUrl && sync) {
			const url = new URL(location.href);
			url.search = `?date=${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
			history[push ? "pushState" : "replaceState"](null, "", url);
			document.title = `${formatDate(year, month, day)} ${verb} a ${name} · Doomsday Method`;
		}
	}

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		show({ year: Number(yearIn.value), month: Number(monthIn.value), day: Number(dayIn.value) }, { push: true });
	});

	copyBtn?.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(location.href);
			copyBtn.textContent = "Link copied";
		} catch {
			copyBtn.textContent = "Copy the address bar";
		}
		setTimeout(() => { copyBtn.textContent = "Copy link"; }, 2000);
	});

	if (syncUrl) {
		window.addEventListener("popstate", () => { const p = parseParams(); if (p) show(p); });
	}

	const now = new Date();
	const fromUrl = syncUrl && parseParams();
	const start = fromUrl || {
		year: Number(root.dataset.year) || now.getFullYear(),
		month: Number(root.dataset.month) || now.getMonth() + 1,
		day: Number(root.dataset.day) || now.getDate(),
	};
	// A plain visit keeps the page's own title and URL; only a chosen date rewrites them.
	show(start, { sync: Boolean(fromUrl) });
}

for (const root of document.querySelectorAll("[data-finder]")) {
	mountFinder(root, { syncUrl: root.hasAttribute("data-sync-url") });
}
