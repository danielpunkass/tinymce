// Additional tests which may not be interesting to upstream TinyMCE project but which reassure me
// for specific use cases of mine

module("redsweater.UndoManager", {
  setupModule: function () {
    QUnit.stop();

    tinymce.init({
      selector: "textarea",
      add_unload_trigger: false,
      skin: false,
      init_instance_callback: function (ed) {
        window.editor = ed;
        QUnit.start();
      }
    });
  }
});

test('Ignored keystrokes', function () {
  editor.undoManager.clear();
  editor.setContent('test');

  expect(4);

  ok(!editor.undoManager.typing);

	// Command-A i.e. Select All
  editor.dom.fire(editor.getBody(), 'keydown', { keyCode: 65, metaKey:true, shiftKey:false, altKey:false, ctrlKey:false });
  ok(!editor.undoManager.hasUndo());
  ok(!editor.undoManager.hasRedo());
  ok(!editor.undoManager.typing);
});

test('Ignored Adds', function () {
  editor.undoManager.clear();
  editor.setContent('test');

  var count = 0;

  editor.on('AddUndo', function () {
    count++;
  });

  expect(4);

  editor.dom.fire(editor.getBody(), 'keydown', { keyCode: 65 });
  ok(editor.undoManager.typing);

  editor.dom.fire(editor.getBody(), 'keyup', { keyCode: 13 });
  ok(!editor.undoManager.typing);

  equal(count, 1);

  editor.undoManager.add();
  editor.undoManager.add();

  equal(count, 1);
});

