const DELAY_IN_MS = 100;
let default_title = document.title;
let custom_title = undefined;
let intervalId = undefined;

browser.runtime.sendMessage({
	action: "ready"
});

browser.runtime.onMessage.addListener((response) => {
	switch(response.action) {
		case "rename":
			let newName = prompt("Set new tab title\nLeaving this blank resets tab name", document.title);
			if(newName === "" || newName === undefined) {
				window.clearInterval(intervalId);
				custom_title = undefined;
				document.title = default_title;
			} else if(newName === null) {
				// user pressed cancel button
				// do nothing
			} else {
				custom_title = document.title = newName;
				return Promise.resolve(document.title);
			}
			break;
		case "update":
			default_title = response.default;
			custom_title = response.title;
			intervalId = window.setInterval(update, DELAY_IN_MS);
			break;
	}
});

function update() {
	document.title = custom_title;
}