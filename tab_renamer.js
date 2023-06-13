let default_title = document.title;
let custom_title = undefined;

// tell the extension that the current 
// tab is finished loading
browser.runtime.sendMessage({
	action: "ready"
});

browser.runtime.onMessage.addListener((response) => {
	switch(response.action) {
		case "rename":
			return rename_tab();
		case "update":
			update_tab(response);
			break;
	}
});

// prompt the user to change the tab's name
function rename_tab() {
	let newName = prompt("Set new tab title\nLeave this blank to reset", document.title);
	// do nothing if user pressed cancel button
	if(newName === null) return;
	// if "Rename Tab" is left empty, reset title
	if(newName === "" || newName === undefined) {
		custom_title = undefined;
		document.title = default_title;
		return Promise.resolve({
			title: custom_title,
			default: default_title
		});
	} 
	// otherwise, rename tab and save changes
	custom_title = newName;
	update();
	return Promise.resolve({ 
		title: custom_title,
		default: default_title
	});
}

// handle when tab refreshes or changes pages
function update_tab(response) {
	default_title = response.default;
	custom_title = response.title;
	update();
}

// set the tab name
function update() {
	document.title = custom_title;
}