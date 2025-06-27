/**
 * Demo.ts
 * 
 * Demo for the Red Sweater plugin.
 */

import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea#tinymce',
  height: 600,
  plugins: [
    'redsweater', 'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'anchor',
    'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
  setup: (editor) => {
    editor.on('init', () => {
      console.log('Red Sweater plugin demo initialized');
    });
  }
});