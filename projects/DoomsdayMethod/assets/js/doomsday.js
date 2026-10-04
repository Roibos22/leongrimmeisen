// Conway's Doomsday rule for Gregorian dates, written to explain itself.
// Every page that shows a weekday or a worked solution goes through solve(),
// and scripts/check-doomsday.mjs checks it against Date for every day 1583–2399.

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];

export const MIN_YEAR = 1583;  // first full Gregorian year
export const MAX_YEAR = 9999;
export const TRAINER_YEARS = [1583, 2599];  // the app's "Gregorian" range: the whole calendar

const mod7 = (n) => ((n % 7) + 7) % 7;

export function isLeap(year) {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month) {
	return [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function isValidDate(year, month, day) {
	return Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day)
		&& year >= MIN_YEAR && year <= MAX_YEAR
		&& month >= 1 && month <= 12
		&& day >= 1 && day <= daysInMonth(year, month);
}

// Tuesday, Sunday, Friday, Wednesday, repeating every 400 years.
export function centuryAnchor(year) {
	return mod7(5 * (Math.floor(year / 100) % 4) + 2);
}

// The classic year offset: y + ⌊y/4⌋, mod 7.
export function yearOffset(year) {
	const y = year % 100;
	const leaps = Math.floor(y / 4);
	const sum = y + leaps;
	return { y, leaps, sum, offset: sum % 7 };
}

export function doomsdayOf(year) {
	return mod7(centuryAnchor(year) + yearOffset(year).offset);
}

const MONTH_DOOMSDAYS = [3, 28, 14, 4, 9, 6, 11, 8, 5, 10, 7, 12];

export function monthDoomsday(month, leap) {
	if (leap && month === 1) return 4;
	if (leap && month === 2) return 29;
	return MONTH_DOOMSDAYS[month - 1];
}

export function monthHook(month, leap) {
	switch (month) {
		case 1: return leap ? "the 4th in a leap year, the 3rd otherwise" : "the 3rd, or the 4th in a leap year";
		case 2: return leap ? "the last day of February, the 29th in a leap year" : "the last day of February";
		case 3: return "Pi Day, 3/14";
		case 5: return "9-to-5 at the 7-Eleven: 5/9";
		case 7: return "9-to-5 at the 7-Eleven: 7/11";
		case 9: return "9-to-5 at the 7-Eleven: 9/5";
		case 11: return "9-to-5 at the 7-Eleven: 11/7";
		default: return `the even months double up: ${month}/${month}`;
	}
}

export function weekdayOf(year, month, day) {
	const leap = isLeap(year);
	return mod7(doomsdayOf(year) + day - monthDoomsday(month, leap));
}

export function ordinal(n) {
	const tens = n % 100;
	if (tens >= 11 && tens <= 13) return `${n}th`;
	return `${n}${["th", "st", "nd", "rd"][n % 10] || "th"}`;
}

export function formatDate(year, month, day) {
	return `${day} ${MONTHS[month - 1]} ${year}`;
}

function plural(n, word) {
	return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// The nearest date in the month that is a doomsday (a multiple of 7 away from
// the month's doomsday date), and how far the asked-for day is from it.
function nearestDoomsdayDate(year, month, day) {
	const leap = isLeap(year);
	const first = monthDoomsday(month, leap);
	const last = daysInMonth(year, month);
	let best = first;
	for (let d = first - 35; d <= first + 35; d += 7) {
		if (d < 1 || d > last) continue;
		if (Math.abs(day - d) < Math.abs(day - best)) best = d;
	}
	return { base: first, nearest: best, delta: day - best };
}

// Full solution, step by step. `knownDoomsday` skips steps 1–2, as for a date
// in the current year.
export function solve(year, month, day, { knownDoomsday = false } = {}) {
	const leap = isLeap(year);
	const anchor = centuryAnchor(year);
	const off = yearOffset(year);
	const doomsday = doomsdayOf(year);
	const { base, nearest, delta } = nearestDoomsdayDate(year, month, day);
	const weekday = weekdayOf(year, month, day);
	const century = Math.floor(year / 100) * 100;
	const monthName = MONTHS[month - 1];
	const steps = [];

	if (knownDoomsday) {
		steps.push({
			title: "Doomsday",
			text: `${year}'s doomsday is ${WEEKDAYS[doomsday]}.`,
		});
	} else {
		// Only four anchors are worth memorising; any other century repeats one of them.
		const known = ((century - 1800) % 400 + 400) % 400 + 1800;
		const like = known === century ? "" : ` (anchors repeat every 400 years, so it matches the ${known}s)`;
		steps.push({
			title: "Century anchor",
			text: `The ${century}s start from ${WEEKDAYS[anchor]}${like}.`,
			value: WEEKDAYS[anchor],
		});
		const yy = String(off.y).padStart(2, "0");
		const reduce = off.sum < 7 ? "That is already under 7."
			: off.offset === 0 ? `${off.sum} is exactly ${off.sum / 7} weeks, which leaves 0.`
			: `Take away whole weeks: ${off.sum} − ${off.sum - off.offset} = ${off.offset}.`;
		steps.push({
			title: "Year offset",
			text: `${yy} ÷ 4 = ${off.leaps}, dropping the remainder. ${yy} + ${off.leaps} = ${off.sum}. ${reduce} ${WEEKDAYS[anchor]} + ${off.offset} = ${WEEKDAYS[doomsday]}, so ${year}'s doomsday is ${WEEKDAYS[doomsday]}.`,
			value: `+${off.offset}`,
		});
	}

	steps.push({
		title: "Month doomsday",
		text: `${monthName}'s doomsday date is the ${ordinal(base)} (${monthHook(month, leap)}), so ${base} ${monthName} ${year} is a ${WEEKDAYS[doomsday]}.`,
		value: `${ordinal(base)}`,
	});

	let count;
	if (delta === 0 && nearest === base) {
		count = `${day} ${monthName} is the doomsday date itself: ${WEEKDAYS[weekday]}.`;
	} else {
		const hop = nearest === base ? "" : `${nearest} ${monthName} is also a ${WEEKDAYS[doomsday]} (${base} ${nearest > base ? "+" : "−"} ${Math.abs(nearest - base)}). `;
		const way = (n) => `${plural(Math.abs(n), "day")} ${n > 0 ? "later" : "earlier"}`;
		const shortcut = Math.abs(delta) >= 4 ? ` (the same as ${way(delta > 0 ? delta - 7 : delta + 7)})` : "";
		const move = delta === 0
			? `That is your date: ${WEEKDAYS[weekday]}.`
			: `The ${ordinal(day)} is ${way(delta)}${shortcut}: ${WEEKDAYS[weekday]}.`;
		count = hop + move;
	}
	steps.push({ title: "Count", text: count, value: WEEKDAYS[weekday] });

	return { year, month, day, leap, anchor, offset: off, doomsday, base, nearest, delta, weekday, steps };
}

export function randomInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

export function randomDate(fromYear, toYear) {
	const year = randomInt(fromYear, toYear);
	const month = randomInt(1, 12);
	const day = randomInt(1, daysInMonth(year, month));
	return { year, month, day };
}
