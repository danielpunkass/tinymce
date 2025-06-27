/**
 * ContentPatching.ts
 * 
 * Handles patching of HTML content after it's set in the editor to improve editing experience.
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

const wrapBlockquoteContent = (editor: Editor): void => {
  // Handle situation where blockquotes may have originated without p tags within
  Tools.each(editor.dom.select('blockquote'), (blockquote) => {
    // We don't worry about case of no children at all because the node would be culled
    // by standard setContent deserialization. Just, for each of the children of
    // a blockquote, if it's not a block node itself, put it in a P block.
    Tools.each(blockquote.childNodes, (childNode) => {
      if (editor.dom.isBlock(childNode) === false) {
        const newParagraph = editor.dom.create('P');
        blockquote.insertBefore(newParagraph, childNode);
        newParagraph.appendChild(childNode);
      }
    });
  });
};

const setup = (editor: Editor): void => {
  // After TinyMCE sets the content on the editor, we want to patch up
  // certain HTML quirks that are ill-suited to a good editing experience
  editor.on('SetContent', () => {
    wrapBlockquoteContent(editor);
  });
};

export {
  setup
};