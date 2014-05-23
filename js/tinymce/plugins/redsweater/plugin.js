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

});