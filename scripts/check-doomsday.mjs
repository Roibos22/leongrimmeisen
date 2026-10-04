// Checks the site's Doomsday engine against Date for every day 1583–2599,
// plus the worked examples the pages quote. Run by scripts/build-doomsday.sh,
// so a wrong weekday fails the deploy.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../projects/DoomsdayMethod/assets/js/doomsday.js", import.meta.url), "utf8");
const dd = await import("data:text/javascript," + encodeURIComponent(src));

let failures = 0;
const fail = (msg) => { failures++; if (failures <= 20) console.error("✘ " + msg); };

let days = 0;
for (let y = 1583; y <= 2599; y++) {
	for (let m = 1; m <= 12; m++) {
		for (let d = 1; d <= dd.daysInMonth(y, m); d++) {
			const expected = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
			const s = dd.solve(y, m, d);
			if (dd.weekdayOf(y, m, d) !== expected) fail(`weekdayOf ${y}-${m}-${d}`);
			if (s.weekday !== expected) fail(`solve ${y}-${m}-${d}`);
			if (!s.steps.at(-1).text.endsWith(`${dd.WEEKDAYS[expected]}.`)) fail(`solve text ${y}-${m}-${d}: ${s.steps.at(-1).text}`);
			if (Math.abs(s.delta) > 6) fail(`delta ${s.delta} on ${y}-${m}-${d}`);
			days++;
		}
	}
	if (dd.isLeap(y) !== (new Date(Date.UTC(y, 1, 29)).getUTCDate() === 29)) fail(`isLeap ${y}`);
}

// Worked examples quoted on the pages.
const quoted = [
	[2031, 12, 25, "Thursday"],
	[1969, 7, 20, "Sunday"],
	[1776, 7, 4, "Thursday"],
	[2050, 1, 1, "Saturday"],
	[1989, 11, 9, "Thursday"],
	[2000, 1, 1, "Saturday"],
	[2024, 9, 18, "Wednesday"],
	[1944, 6, 6, "Tuesday"],
	[1912, 4, 15, "Monday"],
	[2007, 6, 29, "Friday"],
	[1937, 12, 26, "Sunday"],
	[2028, 2, 29, "Tuesday"],
];
for (const [y, m, d, name] of quoted) {
	const got = dd.WEEKDAYS[dd.weekdayOf(y, m, d)];
	if (got !== name) fail(`quoted example ${y}-${m}-${d}: page says ${name}, engine says ${got}`);
}

if (failures) {
	console.error(`check-doomsday: ${failures} failure(s)`);
	process.exit(1);
}
console.log(`check-doomsday: ${days} dates and ${quoted.length} quoted examples agree with Date`);
