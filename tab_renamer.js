const INIT_TITLE = document.title;

browser.runtime.onMessage.addListener(() => {
	
	let newName = prompt("Set new tab title", document.title);
	
	if(newName == null) {
		document.title = INIT_TITLE;
	} else {
		document.title = newName;
	}
	//return Promise.resolve("done");
});

