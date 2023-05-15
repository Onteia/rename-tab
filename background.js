
browser.menus.create({
		id: "tab-name",
		title: "Rename Tab",
		contexts: ["tab"],
	},
	console.log("created menu item")
);

function clicked(info, tab) {
	browser.tabs
		.sendMessage(tab.id, "");
};

browser.menus.onClicked.addListener(clicked);

