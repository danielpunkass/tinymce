/**
 * Plugin.ts
 *
 * Copyright 2014, Red Sweater Software
 * Released under LGPL License.
 *
 * This plugin includes nuances for behavior of the TinyMCE framework which are not clearly
 * bug fixes that should be submitted as pull requests, but which for Red Sweater's purposes
 * are desirable behaviors across the board.
 */

import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';
import Tools from 'tinymce/core/api/util/Tools';
import VK from 'tinymce/core/api/util/VK';

const setupDocumentCleanup = (editor: Editor): void => {
  const isEmptyParagraph = (node: Node): boolean => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    const element = node as Element;
    if (element.tagName !== 'P') {
      return false;
    }

    const innerHTML = element.innerHTML;
    if (!innerHTML) {
      return true;
    }

    const cleanedContent = innerHTML.replace(/\s|<br.*?>|&nbsp;/g, '');
    return cleanedContent.length === 0;
  };

  editor.on('PreProcess', (e) => {
    const last = e.node.lastChild;
    
    if (last && isEmptyParagraph(last)) {
      editor.dom.remove(last);
    }
  });
};

const setupContentPatching = (editor: Editor): void => {
  const wrapBlockquoteContent = (editor: Editor): void => {
    Tools.each(editor.dom.select('blockquote'), (blockquote) => {
      Tools.each(blockquote.childNodes, (childNode) => {
        if (editor.dom.isBlock(childNode) === false) {
          const newParagraph = editor.dom.create('P');
          blockquote.insertBefore(newParagraph, childNode);
          newParagraph.appendChild(childNode);
        }
      });
    });
  };

  editor.on('SetContent', () => {
    wrapBlockquoteContent(editor);
  });
};

const setupPreBlockHandling = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    if (e.keyCode !== 13 || e.shiftKey) {
      return;
    }

    const rng = editor.selection.getRng();
    if (!rng || !rng.collapsed) {
      return;
    }

    const node = editor.selection.getNode();
    const pre = editor.dom.getParent(node, 'pre');

    if (!pre) {
      return;
    }

    const endRange = editor.dom.createRng();
    endRange.setStart(rng.startContainer, rng.startOffset);
    endRange.setEnd(pre, pre.childNodes.length);

    if (endRange.toString().trim() !== '') {
      return;
    }

    let lastElement = pre.lastChild;
    while (lastElement && lastElement.nodeType === 3 && (lastElement.nodeValue || '').trim() === '') {
      lastElement = lastElement.previousSibling;
    }

    if (lastElement && lastElement.nodeName === 'BR') {
      e.preventDefault();
      editor.dom.remove(lastElement);
      const newP = editor.dom.create('p');
      newP.innerHTML = '<br data-mce-bogus="1" />';
      editor.dom.insertAfter(newP, pre);
      editor.selection.setCursorLocation(newP, 0);
    }
  });
};

const setupListTabHandling = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    if (e.keyCode !== VK.TAB || VK.metaKeyPressed(e)) {
      return true; // Let other handlers process this event
    }

    if (editor.queryCommandState('InsertUnorderedList') || editor.queryCommandState('InsertOrderedList')) {
      e.preventDefault();
      editor.undoManager.transact(() => {
        if (e.shiftKey) {
          editor.execCommand('Outdent');
        } else {
          editor.execCommand('Indent');
        }
      });
      return false; // Event fully consumed
    }
    return true; // Let other handlers process this event
  });
};

export default (): void => {
  PluginManager.add('redsweater', (editor) => {
    setupDocumentCleanup(editor);
    setupContentPatching(editor);
    setupPreBlockHandling(editor);
    setupListTabHandling(editor);

    return {
      getMetadata: () => ({
        name: 'Red Sweater Plugin',
        url: 'https://red-sweater.com'
      })
    };
  });
};