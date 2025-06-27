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

import PluginManager from 'tinymce/core/api/PluginManager';
import Tools from 'tinymce/core/api/util/Tools';
import VK from 'tinymce/core/api/util/VK';

import * as DocumentCleanup from './core/DocumentCleanup';
import * as ContentPatching from './core/ContentPatching';
import * as PreBlockHandling from './core/PreBlockHandling';
import * as ListTabHandling from './core/ListTabHandling';

export default (): void => {
  PluginManager.add('redsweater', (editor) => {
    
    // Register event handlers for various redsweater-specific behaviors
    DocumentCleanup.setup(editor);
    ContentPatching.setup(editor);
    PreBlockHandling.setup(editor);
    ListTabHandling.setup(editor);

    return {
      getMetadata: () => ({
        name: 'Red Sweater Plugin',
        url: 'https://red-sweater.com'
      })
    };
  });
};