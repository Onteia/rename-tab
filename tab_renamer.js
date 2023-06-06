const DELAY_IN_MS = 15; // every 15ms, update the title
let default_title = document.title;
let custom_title = undefined;
let intervalId = undefined;

browser.runtime.sendMessage({
	action: "ready"
});

browser.runtime.onMessage.addListener((response) => {
	switch(response.action) {
		case "rename":
			let newName = prompt("Set new tab title\nLeaving this blank to reset", document.title);
			// do nothing if user pressed cancel button
			if(newName === null) return;
			// if "Rename Tab" is left empty, reset title
			if(newName === "" || newName === undefined) {
				window.clearInterval(intervalId);
				custom_title = undefined;
				document.title = default_title;
				return Promise.resolve({
					title: custom_title,
					default: default_title
				});
			} 
			// otherwise, rename tab and save changes
			custom_title = newName;
			window.clearInterval(intervalId);
			intervalId = window.setInterval(update, DELAY_IN_MS);
			return Promise.resolve({ 
				title: custom_title,
				default: default_title
			});
		case "update":
			default_title = response.default;
			custom_title = response.title;
			window.clearInterval(intervalId);
			intervalId = window.setInterval(update, DELAY_IN_MS);
			break;
		case "reload":
			custom_title = response.title;
			default_title = response.default;
			window.clearInterval(intervalId);
			intervalId = window.setInterval(update, DELAY_IN_MS);
			break;
	}
});

function update() {
	document.title = custom_title;
}