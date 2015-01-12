var MessageFormat = require('messageformat');

// Options: locale (required), global, namespace, prepend, append
module.exports = function(data) {
  var string = data.string;
  var options = data.options || {};
  if (!options.locale) {
    console.log('Error: Options `locale` is required.');
    return null;
  }
  options.namespace = options.namespace || 'i18n';
  options.global = options.global || 'this';
  var locale = options.locale;
  var namespace = options.namespace;
  if (!string) {
    return null;
  }

  var mf;
  try {
    mf = new MessageFormat(locale, false, namespace);
  } catch (e) {
    // Fallback to English locale
    try {
      mf = new MessageFormat('en', false, namespace);
    } catch (e2) {
      console.log(e2.toString());
      return null;
    }
  }

  try {
    return [
      options.prepend,
      '(function(g){',
      'var ' + namespace + ' = ' + mf.functions() + ';',
      (namespace + '["' + namespace + '"] = ' + mf.precompileObject(JSON.parse(string)) + ';'),
      'return g["' + namespace + '"] = ' + namespace + ';',
      '})(' + options.global + ');',
      options.append
    ].join(require('os').EOL);
  } catch (errs) {
    var message = '';
    if (errs.join) {
      message = errs.join('\n');
    } else {
      message = errs.name + ': ' +  errs.message;
    }
    console.log('Error (locale=' + locale + ': ' + message);
    return null;
  }
};
