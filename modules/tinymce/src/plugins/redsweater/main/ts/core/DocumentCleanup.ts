/**
 * DocumentCleanup.ts
 * 
 * Handles cleanup of empty paragraphs at the end of documents during serialization.
 * Cribbed from the table plugin's historical behavior but applied universally.
 */

import Editor from 'tinymce/core/api/Editor';

const isEmptyParagraph = (node: Node): boolean => {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const element = node as Element;
  if (element.tagName !== 'P') {
    return false;
  }

  // Various situations end up being reached that should all be treated as "empty" last paragraphs.
  // They can all be summarized as having the node's innerHTML be comprised entirely of 
  // whitespace, <br> tags, and &nbsp; entities. So to see if this is a node that should be 
  // ejected, get the innerHTML and replace all of those. If we're left with nothing? It's an empty node.
  const innerHTML = element.innerHTML;
  if (!innerHTML) {
    return true;
  }

  const cleanedContent = innerHTML.replace(/\s|<br.*?>|&nbsp;/g, '');
  return cleanedContent.length === 0;
};

const setup = (editor: Editor): void => {
  editor.on('PreProcess', (e) => {
    const last = e.node.lastChild;
    
    if (last && isEmptyParagraph(last)) {
      editor.dom.remove(last);
    }
  });
};

export {
  setup
};