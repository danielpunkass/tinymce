/**
 * ListTabHandling.ts
 * 
 * Handles native tab behavior in lists for indentation/outdentation.
 */

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

const setup = (editor: Editor): void => {
  // Until and unless we start using the lists plugin (which has some unwanted interactions)
  // we have to make sure tab and shift-tab get handled natively, since TinyMCE explicitly avoids
  // calling execNativeCommand for this scenario.
  editor.on('keydown', (e) => {
    // Check for tab but not ctrl/cmd+tab since it switches browser tabs
    if (e.keyCode !== VK.TAB || VK.metaKeyPressed(e)) {
      return;
    }

    if (editor.queryCommandState('InsertUnorderedList') || editor.queryCommandState('InsertOrderedList')) {
      e.preventDefault();
      editor.undoManager.transact(() => {
        if (e.shiftKey) {
          editor.getDoc().execCommand('Outdent');
        } else {
          editor.getDoc().execCommand('Indent');
        }
      });
    }
  });
};

export {
  setup
};