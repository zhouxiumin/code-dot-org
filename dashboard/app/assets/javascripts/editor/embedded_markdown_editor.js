/* globals codeMirror marked */

/**
 * Initializes a live preview markdown editor that spits its contents out into
 * a given text area as embedded markdown of the form:
 *
 *    markdown <<MARKDOWN
 *    My markdown here
 *    MARKDOWN
 *
 * Suitable for setting a DSL's markdown element
 *
 * @param {jQuery} embeddedElement textarea element within which to embed the markdown
 * @param {string} markdownTextArea id (which will be prefixed by "level_")
 *                                  of textarea where editor will live
 * @param {jQuery} markdownPreviewArea
 */
dashboard.initializeEmbeddedMarkdownEditor = function (embeddedElement, markdownTextArea, markdownPreviewArea) {
  var regex = /markdown <<(\w*)\n([\s\S]*)\n\1$/m;
  var dslElement = embeddedElement;
  var dslText = dslElement.val();

  var mdEditor = codeMirror(markdownTextArea, 'markdown', function (editor, change) {
    var renderer = new marked.Renderer();
    renderer.image = function(href, title, text) {
      var out = '<iframe src="/api/embed?url=' + href + '" alt="' + text + '"' + 'allowfullscreen="1"></iframe>';
/*
      var out = '<img src="' + href + '" alt="' + text + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += this.options.xhtml ? '/>' : '>';
*/
      return out;
    };
    markdownPreviewArea.html(marked(editor.getValue(), {
      renderer: renderer
    }));

    var editorText = editor.getValue();
    var dslText = dslElement.val();
    var replacedText;
    if (regex.exec(dslText)) {
      replacedText = dslText.replace(regex, 'markdown <<$1\n' + editorText + '\n$1');
    } else {
      replacedText = dslText + '\nmarkdown <<MARKDOWN\n' + editorText + '\nMARKDOWN';
    }
    dslElement.val(replacedText);
  }, true);

  // Match against markdown heredoc syntax and capture contents in [2].
  var match = regex.exec(dslText);
  if (match && match[2]) {
    var markdownText = match[2];
    mdEditor.setValue(markdownText);
  } else {
    mdEditor.setValue('');
  }
};
