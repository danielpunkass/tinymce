// Additional tests which may not be interesting to upstream TinyMCE project but which reassure me 
// for specific use cases of mine

module("redsweater.Quirks", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

// It's important to us that Cmd-Shift-A should perform its app-specific purpose and not 
// select all as it currently does in TinyMCE (http://www.tinymce.com/develop/bugtracker_view.php?id=7184)

test('Command-Shift-A Doesn\'t Select', function() {
	editor.setContent('test');

	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);
		
	// Command-Shift-A should not alter the collapsed range
	editor.dom.fire(editor.getBody(), 'keydown', {keyCode: 65, metaKey:true, shiftKey:true});
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(rng.collapsed);

	// Command-A i.e. Select All SHOULD
	editor.dom.fire(editor.getBody(), 'keydown', {keyCode: 65, metaKey:true});
	rng = Utils.normalizeRng(editor.selection.getRng(true));
	ok(!rng.collapsed);
});

