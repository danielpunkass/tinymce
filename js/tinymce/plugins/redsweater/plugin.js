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

/*global tinymce:true, CustomEvent */

tinymce.PluginManager.add('redsweater', function(editor) {

	var each = tinymce.util.Tools.each;

	// Cribbed from the table plugin - they historically had behavior that would
	// do the honor of removing the bogus empty paragraph markup from the end of a document
	// as part of serialization. In TinyMCE4 this is strictly relegated when the paragraph
	// is directly preceded by a table, and obviously only effective if the table plugin is
	// actually installed. We want to have this "cleanup" take place in all instances.
	editor.on('PreProcess', function(o) {
		var last = o.node.lastChild;

		// Various situations end up being reached that should all be treated for our
		// purposes as "empty" last paragraphs. They can all be summarized as having
		// the node's innerHTML be comprised entirely of whitespace, <br> tags, and &nbsp;
		// entities. So to see if this is a node that should be ejected, get the innerHTML
		// and replace all of those. If we're left with nothing? It's an empty node.
		if (last) {
			var thisHTML = last.innerHTML;
			if (thisHTML && (thisHTML.replace(/\s|<br.*>|&nbsp;/g, "").length == 0)) {
				editor.dom.remove(last);
			}
		}
	});

	// After TinyMCE sets the content on the editor, we want to patch up
	// certain HTML quirks that are ill-suited to a good editing experience
	editor.on("SetContent", function(/* unused event */) {
		// Handle situation where blockquotes may have originated without p tags within
		each(editor.dom.select('blockquote'), function(thisBlockquote) {
			// WE don't worry about case of no children at all because the node would be culled
			// by standard setContent deserialization. Just, for each of the children of
			// a blockquote, if it's not a block node itself, put it in a P block. Bam!
			each(thisBlockquote.childNodes, function(thisChildNode) {
				if (editor.dom.isBlock(thisChildNode) == false) {
					var newParagraph = editor.dom.create("P");
					thisBlockquote.insertBefore(newParagraph, thisChildNode);
					newParagraph.appendChild(thisChildNode);
				}
			});
		});
	});

	// The way TinyMCE handles Bold, Italic, Underline, Underscore, etc. is fundamentally wrong for the way
	// the Mac behaves in that it aggressively tries to stretch out and affect e.g. the whole word if you are
	// in the middle of a word like "te|st" where | is the collapsed caret. It would appear the easiest
	// way for us to overcome this behavior without mucking around literally in the TinyMCE sources as we
	// did previously with "sendToBrowser" intercepts in TinyMCE3, is to register ourselves as the
	// implementors of these commands, and pass them through to the browser on our own.

	var overrideCommands = ["Bold", "Italic", "Underline", "Underscore", "Superscript", "Subscript"];
	each(overrideCommands, function(commandName) {
		editor.addCommand(commandName, function(ui, val) {
			var browserSuccess = editor.getDoc().execCommand(commandName, ui, val);

			// The TinyMCE logic is backwards and expects to return false if it should return
			// true on our behalf...
			return (browserSuccess === false);
		});
	});

	// In TinyMCE3 we suffered the terrible behavior of PRE blocks that return would add a new PRE block so that
	// there was a long string of them. They've fixed that in TinyMCE4 however the behavior is now such that
	// carriage returns map to <br /> by default, making it impossible to get out intuititively. Until we support
	// a more obvious way to get out of a pre block (e.g. by clicking some subtle UI that appears while editing one),
	// we want to maintain the old behavior at least that if you press return twice at the very end of a PRE block
	// it will get you out.
	function nodeInserted(changeEvent) {
		// Only interested if we inserted a BR into a PRE
		if ((changeEvent.relatedNode.nodeName === 'PRE') && (changeEvent.target.nodeName === 'BR')) {
			// Did we just insert a second BR in a row at the end of the PRE block?
			// Note that it's weird because sometimes the new br will be inserted BEFORE the existing
			// br at the end, and sometimes after. So two in a row in either case means times to remove
			// them both and add a new paragraph.
			var parent = changeEvent.relatedNode;
			var brNode = changeEvent.target;
			var brPrevious = changeEvent.target.previousElementSibling;
			var brNext = changeEvent.target.nextElementSibling;

			// TinyMCE does some shenanigans where they actually put an extra BR in at the end of the block,
			// for some reason (see "extraBr" in EnterKey.js), so we accept as two BR's "at the end" an
			// inserted BR with a BR previous sibling and a BR next sibling whose next sibling is null.
			if (brPrevious && (brPrevious.nodeName === 'BR')) {
				if (brNext && (brNext.nodeName === 'BR') && (brNext.nextElementSibling === null)) {
					// Zap the two BR nodes that led to this condition, but do so after a delay so
					// the TinyMCE code that is currently inserting these breaks doesn't hit an exception
					// trying to work with the added BR
					window.setTimeout(function(par, first, second) {
						par.removeChild(first);
						par.removeChild(second);

						// Now we actually just employ TinyMCE's default shift-return behavior by faking a key event
						var eventArgs = {"keyCode": 13, "target": editor, "shiftKey": true};
						eventArgs.isImmediatePropagationStopped = function() {
							return false;
						};
						eventArgs.isDefaultPrevented = function() {
							return false;
						};
						editor.fire('keydown', eventArgs);
					}, 0, parent, brPrevious, brNode);
				}
			}
		}
	}

	// After the editor is done loading, pay attention to node insertions
	editor.on("init", function(/* unused e */) {
		editor.getBody().addEventListener("DOMNodeInserted", nodeInserted, false);
	});

	//	editor.on("change", function(nodeChangeEvent) {
	//		var theElement = nodeChangeEvent.element;
	//		console.log("Got node change on " + theElement.nodeName);
	//	});
});