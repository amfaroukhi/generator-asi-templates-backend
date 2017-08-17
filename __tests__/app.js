'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');

describe('asi-templates-backend:app', function () {
  beforeAll(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({ skipInstall: true })
      .withPrompts({ someOption: true })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'bower.json',
      'package.json',
      '.editorconfig',
      '.jshintrc'
    ]);
  });
});

// 'use strict';
// var path = require('path');
// var assert = require('yeoman-assert');
// var helpers = require('yeoman-test');
//
// describe('generator-asi-templates-backend:app', () => {
//   beforeAll(() => {
//     return helpers.run(path.join(__dirname, '../generators/app'))
//       .withPrompts({someAnswer: true});
//   });
//
//   it('creates files', () => {
//     assert.file([
//       'dummyfile.txt'
//     ]);
//   });
// });
