/**
 * plugin.js
 *
 * Copyright 2014, Red Sweater Software
 * Released under LGPL License.
 *
 * This plugin includes nuances for behavior of the TinyMCE framework which are not clearly 
 * bug fixes that should be submitted as pull requests, but which for Red Sweater's purposes
 * are desirable behaviors across the board.
 */

tinymce.PluginManager.add('redsweater', function(editor) {

	var each = tinymce.util.Tools.each;

	// Cribbed from the table plugin - they historically had behavior that would
	// do the honor of removing the bogus empty paragraph markup from the end of a document
	// as part of serialization. In TinyMCE4 this is strictly relegated when the paragraph
	// is directly preceded by a table, and obviously only effective if the table plugin is
	// actually installed. We want to have this "cleanup" take place in all instances.
	editor.on('PreProcess', function(o) {
		var last = o.node.lastChild;

		// If it's a standalone BR node, or if it's a paragraph with a break node or literal newline in it.
		if (last && (last.nodeName == "BR" || (last.childNodes.length == 1 &&
			(last.firstChild.nodeName == 'BR' || last.firstChild.nodeValue == '\u00a0'))))
		{
			editor.dom.remove(last);
		}
	});

	// The way TinyMCE handles Bold, Italic, Underline, Underscore, etc. is fundamentally wrong for the way
	// the Mac behaves in that it aggressively tries to stretch out and affect e.g. the whole word if you are
	// in the middle of a word like "te|st" where | is the collapsed caret. It would appear the easiest
	// way for us to overcome this behavior without mucking around literally in the TinyMCE sources as we
	// did previously with "sendToBrowser" intercepts in TinyMCE3, is to register ourselves as the
	// implementors of these commands, and pass them through to the browser on our own.

	var overrideCommands = ["Bold", "Italic", "Underline", "Underscore", "Superscript", "Subscript"];
	each(overrideCommands, function (commandName) {
		editor.addCommand(commandName, function(ui, val) {
			var browserSuccess = editor.getDoc().execCommand(commandName, ui, val);

			// The TinyMCE logic is backwards and expects to return false if it should return
			// true on our behalf...
			return (browserSuccess === false);
		});
	});

});