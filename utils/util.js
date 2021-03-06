'use strict';
var path = require('path');
var fs = require('fs');
var _ = require("underscore.string");
const html = require('html-wiring');
const shelljs = require('shelljs');
const ejs = require('ejs');
// const _ = require('lodash');
const constants = require('./generator-constants');

// const LANGUAGES_MAIN_SRC_DIR = `../../languages/templates/${constants.CLIENT_MAIN_SRC_DIR}`;


module.exports = {
  rewrite,
  rewriteFile,
  replaceContent,
  classify,
  rewriteJSONFile,
  copyWebResource,
  renderContent,
  deepFind,
  getJavadoc
};


function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function rewrite(args) {
    /* jshint -W044 */
    // check if splicable is already in the body text
    var re = new RegExp(args.splicable.map(function (line) {
        return '\s*' + escapeRegExp(line);
    }).join('\n'));

    if (re.test(args.haystack)) {
        return args.haystack;
    }

    var lines = args.haystack.split('\n');

    var otherwiseLineIndex = 0;
    lines.forEach(function (line, i) {
        if (line.indexOf(args.needle) !== -1) {
            otherwiseLineIndex = i;
        }
    });

    var spaces = 0;
    while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
        spaces += 1;
    }

    var spaceStr = '';
    while ((spaces -= 1) >= 0) {
        spaceStr += ' ';
    }

    lines.splice(otherwiseLineIndex, 0, args.splicable.map(function (line) {
        return spaceStr + line;
    }).join('\n'));

    return lines.join('\n');
}


function rewriteFile(args) {
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);

    args.haystack = fs.readFileSync(fullPath, 'utf8');
    var body = rewrite(args);

    fs.writeFileSync(fullPath, body);
}

// function rewriteFile(args, generator) {
//   args.path = args.path || process.cwd();
//   const fullPath = path.join(args.path, args.file);
//
//   args.haystack = generator.fs.read(fullPath);
//   const body = rewrite(args);
//   generator.fs.write(fullPath, body);
// }

function appName(self) {
    var counter = 0,
        suffix = self.options['app-suffix'];
    // Have to check this because of generator bug #386
    process.argv.forEach(function (val) {
        if (val.indexOf('--app-suffix') > -1) {
            counter++;
        }
    });
    if (counter === 0 || (typeof suffix === 'boolean' && suffix)) {
        suffix = 'App';
    }
    return suffix ? _.classify(suffix) : '';
}

function replaceContent(args, generator) {
  args.path = args.path || process.cwd();
  const fullPath = path.join(args.path, args.file);

  const re = args.regex ? new RegExp(args.pattern, 'g') : args.pattern;

  let body = generator.fs.read(fullPath);
  body = body.replace(re, args.content);
  generator.fs.write(fullPath, body);
}




// _.classify uses _.titleize which lowercase the string,
// so if the user chooses a proper ClassName it will not rename properly
function classify(string) {
  string = string.replace(/[\W_](\w)/g, match => ` ${match[1].toUpperCase()}`).replace(/\s/g, '');
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function rewriteJSONFile(filePath, rewriteFile, generator) {
  const jsonObj = generator.fs.readJSON(filePath);
  rewriteFile(jsonObj, generator);
  generator.fs.writeJSON(filePath, jsonObj, null, 2);
}

function copyWebResource(source, dest, regex, type, generator, opt = {}, template) {
  if (generator.enableTranslation) {
    generator.template(source, dest, generator, opt);
  } else {
    renderContent(source, generator, generator, opt, (body) => {
      body = body.replace(regex, '');
    switch (type) {
      case 'html' :
        body = replacePlaceholders(body, generator);
        break;
      case 'js' :
        body = replaceTitle(body, generator);
        break;
      default:
        break;
    }
    generator.fs.write(dest, body);
  });
  }
}

function renderContent(source, generator, context, options, cb) {
  ejs.renderFile(generator.templatePath(source), context, options, (err, res) => {
    if (!err) {
    cb(res);
  } else {
    generator.error(`Copying template ${source} failed. [${err}]`);
  }
});
}

function replaceTitle(body, generator) {
  const re = /pageTitle[\s]*:[\s]*['|"]([a-zA-Z0-9.\-_]+)['|"]/g;
  let match;

  while ((match = re.exec(body)) !== null) { // eslint-disable-line no-cond-assign
    // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
    const key = match[1];
    const target = key;
    const jsonData = geti18nJson(key, generator);
    const keyValue = jsonData !== undefined ? deepFind(jsonData, key) : undefined;

    body = body.replace(target, keyValue !== undefined ? keyValue : generator.baseName);
  }

  return body;
}

function replacePlaceholders(body, generator) {
  const re = /placeholder=['|"]([{]{2}['|"]([a-zA-Z0-9.\-_]+)['|"][\s][|][\s](translate)[}]{2})['|"]/g;
  let match;

  while ((match = re.exec(body)) !== null) { // eslint-disable-line no-cond-assign
    // match is now the next match, in array form and our key is at index 2, index 1 is replace target.
    const key = match[2];
    const target = match[1];
    const jsonData = geti18nJson(key, generator);
    const keyValue = jsonData !== undefined ? deepFind(jsonData, key, true) : undefined; // dirty fix to get placeholder as it is not in proper json format, name has a dot in it. Assuming that all placeholders are in similar format

    body = body.replace(target, keyValue !== undefined ? keyValue : '');
  }

  return body;
}

function geti18nJson(key, generator) {
  const i18nDirectory = `${LANGUAGES_MAIN_SRC_DIR}i18n/en/`;
  const name = _.kebabCase(key.split('.')[0]);
  let filename = `${i18nDirectory + name}.json`;
  let render;

  if (!shelljs.test('-f', path.join(generator.sourceRoot(), filename))) {
    filename = `${i18nDirectory}_${name}.json`;
    render = true;
  }
  try {
    let file = html.readFileAsString(path.join(generator.sourceRoot(), filename));

    file = render ? ejs.render(file, generator, {}) : file;
    file = JSON.parse(file);
    return file;
  } catch (err) {
    generator.log(err);
    generator.log(`Error in file: ${filename}`);
    // 'Error reading translation file!'
    return undefined;
  }
}

function deepFind(obj, path, placeholder) {
  const paths = path.split('.');
  let current = obj;
  if (placeholder) { // dirty fix for placeholders, the json files needs to be corrected
    paths[paths.length - 2] = `${paths[paths.length - 2]}.${paths[paths.length - 1]}`;
    paths.pop();
  }
  for (let i = 0; i < paths.length; ++i) {
    if (current[paths[i]] === undefined) {
      return undefined;
    }
    current = current[paths[i]];
  }
  return current;
}

function getJavadoc(text, indentSize) {
  if (!text) {
    text = '';
  }
  if (text.indexOf('"') !== -1) {
    text = text.replace(/"/g, '\\"');
  }
  let javadoc = `${_.repeat(' ', indentSize)}/**`;
  const rows = text.split('\n');
  for (let i = 0; i < rows.length; i++) {
    javadoc = `${javadoc}\n${_.repeat(' ', indentSize)} * ${rows[i]}`;
  }
  javadoc = `${javadoc}\n${_.repeat(' ', indentSize)} */`;
  return javadoc;
}



// module.exports = {
//     rewrite: rewrite,
//     rewriteFile: rewriteFile,
//     appName: appName
// };
