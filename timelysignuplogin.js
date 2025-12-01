// SIGNUP PAGE CONSTANTS

const registerBtn = document.querySelector("#register-btn");
const username = document.getElementById("sign-up-username");
const email = document.getElementById("email");
const password = document.getElementById("signup-password");
const confirmPassword = document.getElementById("signup-confirm-password");
const loginFormMain = document.getElementById("login-form-main");
const progressMsg1 = document.getElementById("progress-message1");
const progressMsg2 = document.getElementById("progress-message2");
const progressMsg3 = document.getElementById("progress-message3");
const progressMsg4 = document.getElementById("progress-message4");
const progressMsg = document.getElementById("progress-message");
const signupMsg = document.getElementById("signup-message");

// LOGIN PAGE CONSTANTS

const LoginBtn = document.getElementById("login-btn");

document.addEventListener("DOMContentLoaded", () => {
	const hasVisited = localStorage.getItem("hasVisited");

	if (!hasVisited) {
		registerBtn.addEventListener("click", handleRegistration);
	} else {
		window.location.href = "timelylogin.html";
		LoginBtn.addEventListener("click", handleLogin);
	}
});

const handleRegistration = (e) => {
	e.preventDefault();

	let valid = true;

	if (!username.value || !email.value || !password.value || !confirmPassword.value) {
		progressMsg.textContent = "Please fill out all fields!";
		progressMsg.style.color = "red";
		valid = false;
	} else {
		progressMsg.textContent = "";
	}

	if (!username.value || username.value.length < 4) {
		progressMsg1.textContent = "username must be at least 4 characters long!";
		progressMsg1.style.color = "red";
		valid = false;
	} else {
		progressMsg1.textContent = "";
	}

	if (!email.value || !email.value.includes("@")) {
		progressMsg2.textContent = "Please enter a valid email!";
		progressMsg2.style.color = "red";
		valid = false;
	} else {
		progressMsg2.textContent = "";
	}

	if (!password.value) {
		progressMsg3.textContent = "Please enter a password!";
		progressMsg3.style.color = "red";
		valid = false;
	} else {
		progressMsg3.textContent = "";
	}

	if (password.value !== confirmPassword.value) {
		progressMsg4.textContent = "Passwords do not match.";
		progressMsg4.style.color = "red";
		valid = false;
	} else {
		progressMsg4.textContent = "";
	}

	if (password.value.length < 5) {
		progressMsg3.textContent = "Password must be at least 5 characters.";
		progressMsg3.style.color = "red";
		valid = false;
	}

	if (valid) {
		const userData = {
			username: username.value.trim(),
			email: email.value.trim(),
			password: password.value.trim(),
			hasVisited: true,
		};
		localStorage.setItem("user", JSON.stringify(userData));

		signupMsg.textContent = "Registration successful! ✔️ You can now log in.";
		signupMsg.style.color = "green";
		setTimeout(() => {
			window.location.href = "timelylogin.html";
		}, 1500);
	}

	if (!valid) {
		return;
	}
};

const handleLogin = () => {
	const enteredUsername = document.getElementById("login-username").value.trim();
	const enteredPassword = document.getElementById("login-password").value.trim();

	const registeredUser = JSON.parse(localStorage.getItem("user"));

	if (registeredUser && enteredUsername === registeredUser.username && enteredPassword === registeredUser.password) {
		setTimeout(() => {
			window.location.href = "timely.html";
		}, 1500);
		progressMsg.textContent = "Welcome User!";
		progressMsg.style.color = "green";
		return;
	} else {
		progressMsg.textContent = "Incorrect Username or password";
		progressMsg.style.color = "red";
		loginFormMain.classList.add("error");
		setTimeout(() => {
			loginFormMain.classList.remove("error");
		}, 400);
	}
};

LoginBtn.addEventListener("click", handleLogin);

/* //SCRIPT FOR THE SIGN UP PAGE
const LoginBtn = document.getElementById("login-btn");
const signupSection = document.querySelector(".sign-up-section");
const loginSection = document.querySelector(".login-form-section");

document.addEventListener("DOMContentLoaded", () => {
	const signupSection = document.querySelector(".sign-up-section");
	const loginSection = document.querySelector(".login-form-section");

	const hasVisited = localStorage.getItem("hasVisited");

	if (!hasVisited) {
		signupSection.style.display = "block";
		loginSection.style.display = "none";
	} else {
		signupSection.style.display = "none";
		loginSection.style.display = "block";
	}
});

const registerBtn = document.querySelector("#register-btn");
const username = document.getElementById("sign-up-username");
const email = document.getElementById("email");
const password = document.getElementById("signup-password");
const confirmPassword = document.getElementById("signup-confirm-password");
const main = document.getElementsByTagName("main");
const progressMsg1 = document.getElementById("progress-message1");
const progressMsg2 = document.getElementById("progress-message2");
const progressMsg3 = document.getElementById("progress-message3");
const progressMsg4 = document.getElementById("progress-message4");
const progressMsg = document.getElementById("progress-message");
const signupMsg = document.getElementById("signup-message");

const handleRegistration = (e) => {
	e.preventDefault();

	let valid = true;

	if (!username.value || !email.value || !password.value || !confirmPassword.value) {
		progressMsg.textContent = "Please fil out all fields!";
		progressMsg.style.color = "red";
		valid = false;
	} else {
		progressMsg.textContent = "";
	}

	if (!username.value || username.value.length < 4) {
		progressMsg1.textContent = "username must be at least 4 characters long!";
		progressMsg1.style.color = "red";
		valid = false;
	} else {
		progressMsg1.textContent = "";
	}

	if (!email.value || !email.value.includes("@")) {
		progressMsg2.textContent = "Please enter a valid email!";
		progressMsg2.style.color = "red";
		valid = false;
	} else {
		progressMsg2.textContent = "";
	}

	if (!password.value) {
		progressMsg3.textContent = "Please enter a password!";
		progressMsg3.style.color = "red";
		valid = false;
	} else {
		progressMsg3.textContent = "";
	}

	if (password.value !== confirmPassword.value) {
		progressMsg4.textContent = "Passwords do not match.";
		progressMsg4.style.color = "red";
		valid = false;
	} else {
		progressMsg4.textContent = "";
	}

	if (password.value.length < 5) {
		progressMsg3.textContent = "Password must be at least 5 characters.";
		progressMsg3.style.color = "red";
		valid = false;
	}

	if (valid) {
		const userData = {
			username: username.value.trim(),
			email: email.value.trim(),
			password: password.value.trim(),
			hasVisited: true,
		};
		localStorage.setItem("user", JSON.stringify(userData));

		signupMsg.textContent = "Registration successful! ✔️ You can now log in.";
		signupMsg.style.color = "green";
		setTimeout(() => {
			signupSection.style.display = "none";
			loginSection.style.display = "block";
		}, 1500);
	}

	if (!valid) {
		return;
	}
};

const handleLogin = () => {
	const enteredUsername = document.getElementById("login-username").value.trim();
	const enteredPassword = document.getElementById("login-password").value.trim();

	const registeredUser = JSON.parse(localStorage.getItem("user"));

	if (registeredUser && enteredUsername === registeredUser.username && enteredPassword === registeredUser.password) {
		setTimeout(() => {
			window.location.href = "timely.html";
		}, 1500);
		progressMsg.textContent = "Welcome User!";
		progressMsg.style.color = "green";
		return;
	} else {
		progressMsg.textContent = "Incorrect Username or password";
		progressMsg.style.color = "red";
	}
	localStorage.setItem("hasVisited", "hasVisited");
};

registerBtn.addEventListener("click", handleRegistration);
LoginBtn.addEventListener("click", handleLogin);
 */
