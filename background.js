let tab_list = load_map();

// create "Rename Tab" context menu item
browser.menus.create({
		id: "tab-name",
		title: "Rename Tab",
		contexts: ["tab"],
	},
	console.info("\"Rename Tab\" menu item successfully created.")
);


// notify tab to pop up renaming menu
function rename(_info, tab) {
	browser.tabs.sendMessage(tab.id, { action: "rename" })
		.then((newName) => {
			if(newName == undefined) {
				tab_list.delete(tab.id+"");
			} else {
				tab_list.set(tab.id+"", newName);
			}
			update_map();
		});
};

// send tab's info to content script when tab is 
// refreshed or is finished loading
function update_on_refresh(_request, sender, _sendResponse) {
	if(!tab_list.has(sender.tab.id+"")) return;
	let custom_title = tab_list.get(sender.tab.id+"");
	let default_title = sender.tab.title;

	browser.tabs
		.sendMessage(sender.tab.id,{ action: "update", title: custom_title, default: default_title });
}

// remove closed tab from the list & storage
function close(tab_id, _info) {
	if(!tab_list.has(tab_id+"")) return;
	tab_list.delete(tab_id+"");
	update_map();
}

// update the local map in storage
// so renamed tabs persist
function update_map() {
	let obj = Object.fromEntries(tab_list);
	browser.storage.local.set({ map: obj });
}

// load the map from storage
async function load_map() {
	let map = (await browser.storage.local.get()).map;
	if(map == undefined) return new Map();
	tab_list = new Map(Object.entries(map));
	console.info("Successfully loaded stored map.");
}

browser.menus.onClicked.addListener(rename);
browser.runtime.onMessage.addListener(update_on_refresh);
browser.tabs.onRemoved.addListener(close);

