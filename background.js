let tab_list = new Map();

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
	// switch to tab
	browser.tabs.update(tab.id, { active: true });

	// notify tab to prompt user
	browser.tabs.sendMessage(tab.id, { action: "rename" })
		.then((response) => {
			// user pressed cancel button; do nothing
			if(response == undefined) return;

			// if rename field is empty remove from map
			if(response.title == undefined) {
				tab_list.delete(tab.id+"");
				update_map();
				return;
			} 
			// save new and default tab name
			tab_list.set(tab.id+"", { 
				title: response.title,
				default: response.default
			});
			update_map();
		});
};

// send tab's info to content script when tab is 
// refreshed or is finished loading
function update_on_refresh(_request, sender, _sendResponse) {
	if(!tab_list.has(sender.tab.id+"")) return;
	let map = tab_list.get(sender.tab.id+"");
	let custom_title = map.title;

	// set default title to refreshed page's initial title
	map.default = sender.tab.title;
	update_map();

	// notify tab of these changes
	browser.tabs.sendMessage(sender.tab.id,{ 
		action: "update", 
		title: custom_title, 
		default: map.default
	});
}

// sync tab information on extension reload
async function on_reload() {
	await load_map();
	// send stored information to each saved tab
	tab_list.forEach((value, key) => {
		let tab_id = parseInt(key);
		browser.tabs.sendMessage(tab_id, { 
			action: "update", 
			title: value.title,
			default: value.default
		});
	});
}

// remove closed tab from the list & storage
function close(tab_id, _info) {
	if(!tab_list.has(tab_id+"")) return;
	tab_list.delete(tab_id+"");
	update_map();
}

// update the title according to the hashmap
// when title changes
function title_changed(tab_id, changed, _tab) {
	if(!tab_list.has(tab_id+"")) return;
	if(changed.title == undefined) return;
	let map = tab_list.get(tab_id+"");
	if(changed.title == map.title) return;

	browser.tabs.sendMessage(tab_id,{ 
		action: "update", 
		title: map.title, 
		default: map.default
	}).catch(_ => { /* tab hasn't loaded yet */ });
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
	if(map == undefined) {
		tab_list = new Map();
		return;
	}
	tab_list = new Map(Object.entries(map));
	console.info("Successfully loaded stored map.");
}

browser.menus.onClicked.addListener(rename);
browser.runtime.onMessage.addListener(update_on_refresh);
browser.runtime.onInstalled.addListener(on_reload);
browser.tabs.onRemoved.addListener(close);
browser.tabs.onUpdated.addListener(title_changed);