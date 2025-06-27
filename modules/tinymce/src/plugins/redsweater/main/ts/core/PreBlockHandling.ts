/**
 * PreBlockHandling.ts
 * 
 * Handles special behavior for PRE blocks to allow escaping with double return.
 */

import Editor from 'tinymce/core/api/Editor';

const handlePreBlockEscape = (editor: Editor): void => {
  // In TinyMCE3 we suffered the terrible behavior of PRE blocks that return would add a new PRE block so that
  // there was a long string of them. They've fixed that in TinyMCE4 however the behavior is now such that
  // carriage returns map to <br /> by default, making it impossible to get out intuitively. Until we support
  // a more obvious way to get out of a pre block (e.g. by clicking some subtle UI that appears while editing one),
  // we want to maintain the old behavior at least that if you press return twice at the very end of a PRE block
  // it will get you out.
  
  const nodeInserted = (changeEvent: any) => {
    // Only interested if we inserted a BR into a PRE
    if ((changeEvent.relatedNode?.nodeName === 'PRE') && (changeEvent.target?.nodeName === 'BR')) {
      // Did we just insert a second BR in a row at the end of the PRE block?
      // Note that it's weird because sometimes the new br will be inserted BEFORE the existing
      // br at the end, and sometimes after. So two in a row in either case means time to remove
      // them both and add a new paragraph.
      const parent = changeEvent.relatedNode;
      const brNode = changeEvent.target;
      const brPrevious = changeEvent.target.previousElementSibling;
      const brNext = changeEvent.target.nextElementSibling;

      // TinyMCE does some shenanigans where they actually put an extra BR in at the end of the block,
      // for some reason (see "extraBr" in EnterKey.js), so we accept as two BR's "at the end" an
      // inserted BR with a BR previous sibling and a BR next sibling whose next sibling is null.
      if (brPrevious && (brPrevious.nodeName === 'BR')) {
        if (brNext && (brNext.nodeName === 'BR') && (brNext.nextElementSibling === null)) {
          // Zap the two BR nodes that led to this condition, but do so after a delay so
          // the TinyMCE code that is currently inserting these breaks doesn't hit an exception
          // trying to work with the added BR
          setTimeout(() => {
            if (parent.contains(brPrevious)) {
              parent.removeChild(brPrevious);
            }
            if (parent.contains(brNode)) {
              parent.removeChild(brNode);
            }

            // Now we actually just employ TinyMCE's default shift-return behavior by faking a key event
            const falseFunction = () => false;

            const eventArgs = { 
              keyCode: 13, 
              target: editor.getBody(), 
              shiftKey: true, 
              isImmediatePropagationStopped: falseFunction, 
              isDefaultPrevented: falseFunction 
            } as any;

            editor.fire('keydown', eventArgs);
          }, 0);
        }
      }
    }
  };

  // After the editor is done loading, pay attention to node insertions
  editor.on('init', () => {
    const body = editor.getBody();
    if (body && typeof body.addEventListener === 'function') {
      body.addEventListener('DOMNodeInserted', nodeInserted, false);
    }
  });
};

const setup = (editor: Editor): void => {
  handlePreBlockEscape(editor);
};

export {
  setup
};