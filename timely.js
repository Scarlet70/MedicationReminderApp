// DOM CONSTANTS

// Dashboard
const totalMedicinesEl = document.getElementById("total-meds");
const upcomingDosesEl = document.getElementById("upcoming-doses-value");
const dailyCompletedDosesEl = document.getElementById("tag3");
const dosesToCompleteTodayEl = document.getElementById("dose-to-complete-daily");

// Form
const addDrugBtn = document.getElementById("add-drug-btn");
const formSection = document.getElementById("add-medications");
const inputs = formSection.querySelectorAll("input");
const medicationNameInput = document.getElementById("medication-name");
const dailyDoseInput = document.getElementById("daily-dosage");
const durationInput = document.getElementById("duration");
const startTimeInput = document.getElementById("start-time");
const totalDrugDoseInput = document.getElementById("total-drug-dose");

// Cards
const reminderSection = document.getElementById("reminders");
const draftPreview = document.getElementById("draft-preview");
const reminderUpdates = document.getElementById("reminder-update");

// Modals
const confirmDeleteDlg = document.getElementById("confirm-delete-reminder");
const confirmDeleteBtn = document.getElementById("delete-button");
const cancelDeleteBtn = document.getElementById("cancel-button");
const setReminderDlg = document.getElementById("set-reminder");
const setReminderCloseBtns = setReminderDlg.querySelectorAll("button");
const setReminderTimeEl = document.getElementById("reminder-time");
const medicationReminderDlg = document.getElementById("medication-reminder");
const medDialogDrugName = medicationReminderDlg.querySelector(".drug-medication-name");
const medDialogTime = medicationReminderDlg.querySelector(".time");
const medDialogFeedback = medicationReminderDlg.querySelector(".feedback-msg");
const medYesBtn = document.querySelector("#yes");
const medNoBtn = document.querySelector("#no");

// Sidebar / misc
const closeBtn = document.getElementById("close-btn");
const sideBar = document.getElementById("sidebar");
const activeBubble = document.getElementById("active");
const logoutBtn = document.getElementById("logout-button");

// Animations
const modalAnimation1 = document.querySelector(".modal-animation1");
const modalAnimation2 = document.querySelector(".modal-animation2");

// STATE - SOURCE OF TRUTH

let nextId = 1;
const state = {
	reminders: [],
	totalMedicines: 0,
	upcomingDoses: 0,
	dailyCompletedDoses: 0,
	dosesToCompleteToday: 0,
	deleteTargetId: null,
	activeReminderPrompt: null,
	tickerId: null,
};

// FUNCTIONAL COMPONENTS

//updates for username and email

const updateUsernameAndEmail = () => {
	const username = document.getElementById("username");
	const userEmail = document.getElementById("user-email");
	const user = JSON.parse(localStorage.getItem("user"));
	if (user) {
		username.textContent = user.username;
		userEmail.textContent = user.email;
		username.style.color = "orangered";
		userEmail.style.color = "#53131e";
	}
};

function timeStrToDateToday(timeStr, base = new Date()) {
	const [hh, mm] = timeStr.split(":").map(Number);
	const d = new Date(base);
	d.setHours(hh, mm, 0, 0);
	return d;
}

function build24hSchedule(startTimeStr, dailyDose, now = new Date()) {
	const slots = [];
	if (!dailyDose || dailyDose <= 0) return slots;
	const gapHours = 24 / dailyDose;

	let first = timeStrToDateToday(startTimeStr, now);
	if (first < now) {
		while (first < now) {
			first = new Date(first.getTime() + gapHours * 3600000);
		}
	}

	const endWindow = new Date(now.getTime() + 24 * 3600000);
	let cur = new Date(first);

	while (cur <= endWindow) {
		slots.push(new Date(cur));
		cur = new Date(cur.getTime() + gapHours * 3600000);
	}
	return slots;
}

function toHM(d) {
	return d.toTimeString().slice(0, 5);
}

function sameMinute(a, b) {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() && a.getHours() === b.getHours() && a.getMinutes() === b.getMinutes();
}

function createCard(reminder) {
	const el = draftPreview.cloneNode(true);
	el.id = "";
	el.classList.remove("draft");
	el.classList.add("drugs");

	el.querySelector(".drug-name").textContent = reminder.name;
	el.querySelector(".dose-value").textContent = reminder.dailyDose;
	el.querySelector(".time-value").textContent = reminder.durationDays;
	el.querySelector(".next-dose-value").textContent = "-";
	el.querySelector(".remainder-value").textContent = "-";
	el.querySelector(".delete-btn").classList.remove("hidden");

	reminderSection.appendChild(el);
	return el;
}

function updateCard(reminder) {
	const card = reminder.cardEl;
	if (!card) return;

	const now = new Date();
	const endOfToday = new Date(now);
	endOfToday.setHours(23, 59, 59, 999);

	const remainingToday = reminder.schedule.map((t, idx) => ({ t, idx })).filter(({ t, idx }) => t <= endOfToday && !reminder.completedToday.has(idx)).length;

	const nextIdx = reminder.schedule.findIndex((t, idx) => !reminder.completedToday.has(idx) && t >= now);
	const nextDue = nextIdx >= 0 ? reminder.schedule[nextIdx] : null;

	card.querySelector(".next-dose-value").textContent = nextDue ? toHM(nextDue) : "-";
	card.querySelector(".remainder-value").textContent = remainingToday;
}

function updateDashboard() {
	const now = new Date();
	const twoHoursFromNow = new Date(now.getTime() + 2 * 3600000);
	const endOfToday = new Date(now);
	endOfToday.setHours(23, 59, 59, 999);

	let upcoming = 0,
		completedToday = 0,
		remainingToday = 0;

	state.reminders.forEach((r) => {
		r.schedule.forEach((t, idx) => {
			const isCompleted = r.completedToday.has(idx);
			const isToday = t <= endOfToday;
			if (!isCompleted && t >= now && t <= twoHoursFromNow) upcoming++;
			if (isCompleted && t.toDateString() === now.toDateString()) completedToday++;
			if (!isCompleted && isToday) remainingToday++;
		});
	});

	state.totalMedicines = state.reminders.length;
	state.upcomingDoses = upcoming;
	state.dailyCompletedDoses = completedToday;
	state.dosesToCompleteToday = remainingToday;

	totalMedicinesEl.textContent = state.totalMedicines;
	upcomingDosesEl.textContent = state.upcomingDoses;
	dailyCompletedDosesEl.textContent = state.dailyCompletedDoses;
	dosesToCompleteTodayEl.textContent = state.dosesToCompleteToday;

	reminderUpdates.innerHTML = state.totalMedicines > 0 ? `Active Reminders <i class="fa-solid fa-bell"></i>` : `No New Reminders! <i class="fa-solid fa-bell-slash"></i>`;

	activeBubble.textContent = state.totalMedicines;
	activeBubble.style.display = state.totalMedicines > 0 ? "grid" : "none";
	activeBubble.style.background = "limegreen";
}

function updateUI() {
	state.reminders.forEach(updateCard);
	updateDashboard();
}

// STORAGE

function saveRemindersToStorage() {
	const serialized = state.reminders.map((r) => ({
		id: r.id,
		name: r.name,
		dailyDose: r.dailyDose,
		durationDays: r.durationDays,
		startTimeStr: r.startTimeStr,
		schedule: r.schedule.map((t) => t.toISOString()),
		completedToday: Array.from(r.completedToday),
		lastPromptedIndex: r.lastPromptedIndex,
	}));
	localStorage.setItem("timely_reminders", JSON.stringify(serialized));
}

function loadRemindersFromStorage() {
	const data = localStorage.getItem("timely_reminders");
	if (!data) return;

	try {
		const parsed = JSON.parse(data);
		parsed.forEach((rem) => {
			const schedule = rem.schedule.map((t) => new Date(t));
			const reminder = {
				...rem,
				schedule,
				completedToday: new Set(rem.completedToday || []),
				cardEl: null,
			};
			reminder.cardEl = createCard(reminder);
			state.reminders.push(reminder);
			if (rem.id >= nextId) nextId = rem.id + 1;
		});
		updateUI();
	} catch (e) {
		console.error("Failed to load reminders:", e);
	}
}

//MAIN LOGIC

function addReminder() {
	const name = medicationNameInput.value.trim();
	const dailyDose = parseInt(dailyDoseInput.value, 10);
	const durationDays = parseInt(durationInput.value, 10);
	const startTimeStr = startTimeInput.value.trim();

	if (!name || !dailyDose || dailyDose < 1 || !durationDays || durationDays < 1 || !startTimeStr) {
		formSection.classList.add("error");
		setTimeout(() => formSection.classList.remove("error"), 500);
		return;
	}

	totalDrugDoseInput.value = dailyDose * durationDays;

	const schedule = build24hSchedule(startTimeStr, dailyDose);

	const reminder = {
		id: nextId++,
		name,
		dailyDose,
		durationDays,
		startTimeStr,
		schedule,
		completedToday: new Set(),
		lastPromptedIndex: null,
		cardEl: null,
	};

	reminder.cardEl = createCard(reminder);
	state.reminders.push(reminder);
	saveRemindersToStorage();

	setReminderTimeEl.textContent = startTimeStr;
	openSetReminderModal();
	setReminderCloseBtns.forEach((button) => {
		button.addEventListener("click", () => {
			closeSetReminderModal();
		});
	});

	inputs.forEach((inp) => (inp.value = ""));
	draftPreview.querySelectorAll(".user-preview").forEach((preview) => (preview.textContent = "-"));

	updateUI();
}

function removeReminderById(id) {
	const idx = state.reminders.findIndex((r) => r.id === id);
	if (idx === -1) return;
	const r = state.reminders[idx];
	r.cardEl?.remove();
	state.reminders.splice(idx, 1);
	saveRemindersToStorage();
	updateUI();
}

function openSetReminderModal() {
	setReminderDlg.showModal();
}

function closeSetReminderModal() {
	setReminderDlg.classList.add("close-dialog");
	modalAnimation1.classList.add("close-modal");
	setTimeout(() => {
		setReminderDlg.close();
		setReminderDlg.classList.remove("close-dialog");
		modalAnimation1.classList.remove("close-modal");
	}, 1500);
}

function openMedicationModal(reminder, scheduleIndex) {
	const dueTime = reminder.schedule[scheduleIndex];
	state.activeReminderPrompt = { reminderId: reminder.id, scheduleIndex };
	medDialogFeedback.textContent = "";
	medDialogDrugName.textContent = reminder.name;
	medDialogTime.textContent = toHM(dueTime);
	medicationReminderDlg.showModal();
}

function closeMedicationModal(callback) {
	state.activeReminderPrompt = false;
	if (typeof callback === "function") callback();

	medicationReminderDlg.classList.add("close-dialog");
	modalAnimation2.classList.add("close-modal");
	setTimeout(() => {
		medicationReminderDlg.close();
		medicationReminderDlg.classList.remove("close-dialog");
		modalAnimation2.classList.remove("close-modal");
	}, 1500);
}

let dueReminders = [];

function onTick() {
	const now = new Date();
	updateUI();

	if (state.activeReminderPrompt) return;

	dueReminders = [];

	for (const r of state.reminders) {
		for (let idx = 0; idx < r.schedule.length; idx++) {
			const t = r.schedule[idx];
			if (!r.completedToday.has(idx) && r.lastPromptedIndex !== idx && sameMinute(t, now)) {
				r.lastPromptedIndex = idx;
				dueReminders.push({ reminder: r, index: idx });
			}
		}
	}

	if (dueReminders.length > 0) {
		showNextReminder();
	}
}

function showNextReminder() {
	if (dueReminders.length === 0) {
		state.activeReminderPrompt = false;
		return;
	}

	const { reminder, index } = dueReminders.shift();
	state.activeReminderPrompt = true;

	openMedicationModal(reminder, index);

	medYesBtn.addEventListener("click", () => {
		reminder.completedToday.add(index);
		medDialogFeedback.textContent = "Very Good!! 👍";
		saveRemindersToStorage();
		updateUI();
		closeMedicationModal(() =>
			setTimeout(() => {
				showNextReminder();
			}, 2500)
		);
	});

	medNoBtn.onclick = () => {
		medDialogFeedback.textContent = "Please take your medications immediately!";
		closeMedicationModal();
		setTimeout(() => {
			showNextReminder();
		}, 2500);
	};
}

// EVENT LISTENERS

formSection.addEventListener("input", (e) => {
	if (e.target.classList.contains("user-input")) {
		const key = e.target.dataset.number;
		draftPreview.querySelectorAll(`.user-preview[data-key="${key}"]`).forEach((preview) => (preview.textContent = e.target.value));
	}

	const dd = parseInt(dailyDoseInput.value, 10);
	const dur = parseInt(durationInput.value, 10);
	if (dd > 0 && dur > 0) totalDrugDoseInput.value = dd * dur;
});

addDrugBtn.addEventListener("click", addReminder);

reminderSection.addEventListener("click", (e) => {
	const btn = e.target.closest(".delete-btn");
	if (!btn) return;
	const card = e.target.closest(".drugs");
	const name = card.querySelector(".drug-name")?.textContent.trim();
	const reminder = state.reminders.find((r) => r.name === name && r.cardEl === card);
	if (!reminder) return;
	state.deleteTargetId = reminder.id;
	confirmDeleteDlg.showModal();
});

confirmDeleteBtn.addEventListener("click", () => {
	if (state.deleteTargetId != null) removeReminderById(state.deleteTargetId);
	state.deleteTargetId = null;
	confirmDeleteDlg.close();
});

cancelDeleteBtn.addEventListener("click", () => {
	state.deleteTargetId = null;
	confirmDeleteDlg.close();
});

medYesBtn.addEventListener("click", () => {
	const prompt = state.activeReminderPrompt;
	if (!prompt) return;
	const r = state.reminders.find((x) => x.id === prompt.reminderId);
	if (!r) return;
	r.completedToday.add(prompt.scheduleIndex);
	medDialogFeedback.textContent = "Very Good!! 👍";
	saveRemindersToStorage();
	updateUI();

	closeMedicationModal();
});

medNoBtn.addEventListener("click", () => {
	medDialogFeedback.textContent = "Please take your medications immediately!";

	closeMedicationModal();
});

setReminderDlg.addEventListener("click", (e) => {
	if (e.target.classList.contains("close") || e.target.classList.contains("closedialog-btn")) {
		closeSetReminderModal();
	}
});

closeBtn.addEventListener("click", () => {
	sideBar.classList.toggle("open");
	closeBtn.innerHTML = sideBar.classList.contains("open") ? `<i class="fa-solid fa-xmark"></i>` : `<i class="fa-solid fa-bars"></i>`;
	if (sideBar.classList.contains("open")) updateDashboard();
});

logoutBtn.addEventListener("click", () => {
	window.location.href = "timelylogin.html";
});

//MIDNIGHT RESET

function scheduleMidnightReset() {
	const now = new Date();
	const nextMidnight = new Date(now);
	nextMidnight.setHours(24, 0, 0, 0);
	const ms = nextMidnight - now;

	setTimeout(() => {
		resetDailySchedules();
		scheduleMidnightReset();
	}, ms);
}

function resetDailySchedules() {
	const todayStr = new Date().toDateString();
	state.reminders.forEach((r) => {
		r.completedToday.clear();
		r.schedule = build24hSchedule(r.startTimeStr, r.dailyDose);
	});
	localStorage.setItem("last_reset_date", todayStr);
	saveRemindersToStorage();
	updateUI();
}

function checkAndRebuildIfStale() {
	const todayStr = new Date().toDateString();
	const lastReset = localStorage.getItem("last_reset_date");

	if (lastReset !== todayStr) {
		resetDailySchedules();
	}
}

//INIT APP

window.addEventListener("DOMContentLoaded", updateUsernameAndEmail);

loadRemindersFromStorage();
checkAndRebuildIfStale();
scheduleMidnightReset();

if (state.tickerId) clearInterval(state.tickerId);
state.tickerId = setInterval(onTick, 30000);
onTick();
scheduleMidnightReset();
upcomingDosesEl.style.color = "gold";

//other codes
