const util = require('util');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const _ = require('lodash');
const prompts = require('./prompts');
const BaseGenerator = require('../../utils/generator-base');
const writeFiles = require('./files').writeFiles;
const packagejs = require('../../package.json');
const crypto = require('crypto');
const os = require('os');
const constants = require('../../utils/generator-constants');

const ASIServerGenerator = generator.extend({});

util.inherits(ASIServerGenerator, BaseGenerator);

const QUESTIONS = constants.SERVER_QUESTIONS;

module.exports = ASIServerGenerator.extend({
  constructor: function (...args)
{ // eslint-disable-line object-shorthand
  generator.apply(this, args);

  this.configOptions = this.options.configOptions || {};

  // This adds support for a `--[no-]i18n` flag
  this.option('i18n', {
    desc: 'Disable or enable i18n when skipping client side generation, has no effect otherwise',
    type: Boolean,
    defaults: false
  });

  // This adds support for a `--skip-user-management` flag
  this.option('skip-user-management', {
    desc: 'Skip the user management module during app generation',
    type: Boolean,
    defaults: true
  });

  this.skipClient = this.configOptions.skipClient || this.config.get('skipClient');
  this.skipUserManagement = this.configOptions.skipUserManagement || this.options['skip-user-management'] || this.config.get('skipUserManagement');
  this.enableTranslation = this.options.i18n || this.configOptions.enableTranslation || this.config.get('enableTranslation');
  this.testFrameworks = [];

  this.currentQuestion = this.configOptions.lastQuestion ? this.configOptions.lastQuestion : 0;
  this.totalQuestions = this.configOptions.totalQuestions ? this.configOptions.totalQuestions : QUESTIONS;
  this.logo = this.configOptions.logo;
  this.baseName = this.configOptions.baseName;
  this.clientPackageManager = this.configOptions.clientPackageManager;
  this.isDebugEnabled = this.configOptions.isDebugEnabled || this.options.debug;
}
,

initializing: {
  displayLogo()
  {
    if (this.logo) {
      this.printASILogo();
    }
  }
,

  setupServerconsts()
  {
    // Make constants available in templates
    this.MAIN_DIR = constants.MAIN_DIR;
    this.TEST_DIR = constants.TEST_DIR;
    this.CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
    this.CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
    this.SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
    this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
    this.SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
    this.SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

    this.NODE_VERSION = constants.NODE_VERSION;
    this.YARN_VERSION = constants.YARN_VERSION;
    this.NPM_VERSION = constants.NPM_VERSION;

    this.packagejs = packagejs;
    this.applicationType = this.config.get('applicationType') || this.configOptions.applicationType;
    if (!this.applicationType) {
      this.applicationType = 'monolith';
    }

    this.packageName = this.config.get('packageName');
    this.serverPort = this.config.get('serverPort');
    if (this.serverPort === undefined) {
      this.serverPort = '9091';
    }
    this.websocket = this.config.get('websocket') === 'no' ? false : this.config.get('websocket');
    this.searchEngine = this.config.get('searchEngine') === 'no' ? false : this.config.get('searchEngine');
    if (this.searchEngine === undefined) {
      this.searchEngine = false;
    }
    this.messageBroker = this.config.get('messageBroker') === 'no' ? false : this.config.get('messageBroker');
    if (this.messageBroker === undefined) {
      this.messageBroker = false;
    }

    this.serviceDiscoveryType = this.config.get('serviceDiscoveryType') === 'no' ? false : this.config.get('serviceDiscoveryType');
    if (this.serviceDiscoveryType === undefined) {
      this.serviceDiscoveryType = false;
    }

    this.databaseType = this.config.get('databaseType');
    if (this.databaseType === 'mongodb') {
      this.devDatabaseType = 'mongodb';
      this.prodDatabaseType = 'mongodb';
      this.hibernateCache = 'no';
    } else if (this.databaseType === 'cassandra') {
      this.devDatabaseType = 'cassandra';
      this.prodDatabaseType = 'cassandra';
      this.hibernateCache = 'no';
    } else if (this.databaseType === 'no') {
      // no database, only available for microservice applications
      /**this.devDatabaseType = 'no';
       this.prodDatabaseType = 'no';
       this.hibernateCache = 'no';*/
    } else {
      // sql
      this.devDatabaseType = this.config.get('devDatabaseType');
      this.prodDatabaseType = this.config.get('prodDatabaseType');
      this.hibernateCache = this.config.get('hibernateCache');
    }
    if (this.hibernateCache === undefined) {
      this.hibernateCache = 'no';
    }
    // Hazelcast is mandatory for Gateways, as it is used for rate limiting
    if (this.applicationType === 'gateway') {
      /**this.hibernateCache = 'hazelcast';*/
    }
    this.clusteredHttpSession = this.config.get('clusteredHttpSession') === 'no' ? false : this.config.get('clusteredHttpSession');
    if (this.hibernateCache === 'ehcache') {
      this.clusteredHttpSession = false; // cannot use HazelCast clusering AND ehcache
    }
    this.buildTool = this.config.get('buildTool');
    this.enableSocialSignIn = this.config.get('enableSocialSignIn');
    this.asiGenVersion = packagejs.version;
    if (this.asiGenVersion === undefined) {
      this.asiGenVersion = this.config.get('asiGenVersion');
    }
    this.authenticationType = this.config.get('authenticationType');
    // JWT authentication is mandatory with Eureka, so the JHipster Registry
    // can control the applications
    if (this.serviceDiscoveryType === 'eureka' && this.authenticationType !== 'uaa') {
      this.authenticationType = 'jwt';
    }
    if (this.authenticationType === 'session') {
      this.rememberMeKey = this.config.get('rememberMeKey');
    }
    this.jwtSecretKey = this.config.get('jwtSecretKey');
    this.nativeLanguage = this.config.get('nativeLanguage');
    this.languages = this.config.get('languages');
    this.uaaBaseName = this.config.get('uaaBaseName');
    this.clientFramework = this.config.get('clientFramework');
    const testFrameworks = this.config.get('testFrameworks');
    if (testFrameworks) {
      this.testFrameworks = testFrameworks;
    }

    const baseName = this.config.get('baseName');
    if (baseName) {
      // pour éviter l'override du nom à partir des configOptions
      this.baseName = baseName;
    }

    const serverConfigFound = this.packageName !== undefined &&
      this.authenticationType !== undefined &&
      this.databaseType !== undefined &&
      this.devDatabaseType !== undefined &&
      this.prodDatabaseType !== undefined &&
      this.buildTool !== undefined;

    if (this.baseName !== undefined && serverConfigFound) {
      // Generate remember me key if key does not already exist in config
      if (this.authenticationType === 'session' && this.rememberMeKey === undefined) {
        this.rememberMeKey = crypto.randomBytes(20).toString('hex');
      }

      // Generate JWT secret key if key does not already exist in config
      if (this.authenticationType === 'jwt' && this.jwtSecretKey === undefined) {
        this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
      }

      // If social sign in is not defined, it is disabled by default
      if (this.enableSocialSignIn === undefined) {
        this.enableSocialSignIn = false;
      }

      // If the service discovery is not defined, it is disabled by default
      if (this.serviceDiscoveryType === undefined) {
        this.serviceDiscoveryType = false;
      }

      // If translation is not defined, it is enabled by default
      if (this.enableTranslation === undefined) {
        this.enableTranslation = true;
      }
      if (this.nativeLanguage === undefined) {
        this.nativeLanguage = 'en';
      }
      if (this.languages === undefined) {
        this.languages = ['en', 'fr'];
      }
      // user-management will be handled by UAA app
      if (this.applicationType === 'gateway' && this.authenticationType === 'uaa') {
        this.skipUserManagement = true;
      }

      this.log(chalk.green('Ceci est un projet existant, utilisant la configuration dans le fichier .yo-rc.json \n' +
        'pour regénérer le projet...\n'));

      this.existingProject = true;
    }
  }
}
,

prompting: {

  askForModuleName: prompts.askForModuleName,
    askForServerSideOpts
:
  prompts.askForServerSideOpts,
    askForOptionalItems
:
  prompts.askForOptionalItems,
    askFori18n
:
  prompts.askFori18n,

    setSharedConfigOptions()
  {
    this.configOptions.lastQuestion = this.currentQuestion;
    this.configOptions.totalQuestions = this.totalQuestions;
    this.configOptions.packageName = this.packageName;
    this.configOptions.hibernateCache = this.hibernateCache;
    this.configOptions.clusteredHttpSession = this.clusteredHttpSession;
    this.configOptions.websocket = this.websocket;
    this.configOptions.databaseType = this.databaseType;
    this.configOptions.devDatabaseType = this.devDatabaseType;
    this.configOptions.prodDatabaseType = this.prodDatabaseType;
    this.configOptions.searchEngine = this.searchEngine;
    this.configOptions.messageBroker = this.messageBroker;
    this.configOptions.serviceDiscoveryType = this.serviceDiscoveryType;
    this.configOptions.buildTool = this.buildTool;
    this.configOptions.enableSocialSignIn = this.enableSocialSignIn;
    this.configOptions.authenticationType = this.authenticationType;
    this.configOptions.uaaBaseName = this.uaaBaseName;
    this.configOptions.serverPort = this.serverPort;

    // Make dist dir available in templates
    if (this.buildTool === 'maven') {
      this.BUILD_DIR = 'target/';
    } else {
      this.BUILD_DIR = 'build/';
    }
    this.CLIENT_DIST_DIR = this.BUILD_DIR + constants.CLIENT_DIST_DIR;
    // Make documentation URL available in templates
    this.DOCUMENTATION_URL = constants.ASI_GENERATOR_DOCUMENTATION_URL;
    this.DOCUMENTATION_ARCHIVE_URL = `${constants.ASI_GENERATOR_DOCUMENTATION_URL + constants.ASI_GENERATOR_DOCUMENTATION_ARCHIVE_PATH}v${this.asiGenVersion}`;
  }
}
,

configuring: {
  insight()
  {
    const insight = this.insight();
    insight.trackWithEvent('generator', 'server');
    insight.track('app/authenticationType', this.authenticationType);
    insight.track('app/hibernateCache', this.hibernateCache);
    insight.track('app/clusteredHttpSession', this.clusteredHttpSession);
    insight.track('app/websocket', this.websocket);
    insight.track('app/databaseType', this.databaseType);
    insight.track('app/devDatabaseType', this.devDatabaseType);
    insight.track('app/prodDatabaseType', this.prodDatabaseType);
    insight.track('app/searchEngine', this.searchEngine);
    insight.track('app/messageBroker', this.messageBroker);
    insight.track('app/serviceDiscoveryType', this.serviceDiscoveryType);
    insight.track('app/buildTool', this.buildTool);
    insight.track('app/enableSocialSignIn', this.enableSocialSignIn);
  }
,

  configureGlobal()
  {
    // Application name modified, using each technology's conventions
    this.angularAppName = this.getAngularAppName();
    this.camelizedBaseName = _.camelCase(this.baseName);
    this.dasherizedBaseName = _.kebabCase(this.baseName);
    this.lowercaseBaseName = this.baseName.toLowerCase();
    this.humanizedBaseName = _.startCase(this.baseName);
    this.mainClass = this.getMainClassName();

    if (this.databaseType === 'cassandra' || this.databaseType === 'mongodb') {
      this.pkType = 'String';
    } else {
      this.pkType = 'Long';
    }

    this.packageFolder = this.packageName.replace(/\./g, '/');
    this.testDir = `${constants.SERVER_TEST_SRC_DIR + this.packageFolder}/`;
    if (!this.nativeLanguage) {
      // set to english when translation is set to false
      this.nativeLanguage = 'en';
    }
  }
,

  saveConfig()
  {
    this.config.set('asiGenVersion', packagejs.version);
    this.config.set('baseName', this.baseName);
    this.config.set('packageName', this.packageName);
    this.config.set('packageFolder', this.packageFolder);
    this.config.set('serverPort', this.serverPort);
    this.config.set('authenticationType', this.authenticationType);
    this.config.set('uaaBaseName', this.uaaBaseName);
    this.config.set('hibernateCache', this.hibernateCache);
    this.config.set('clusteredHttpSession', this.clusteredHttpSession);
    this.config.set('websocket', this.websocket);
    this.config.set('databaseType', this.databaseType);
    this.config.set('devDatabaseType', this.devDatabaseType);
    this.config.set('prodDatabaseType', this.prodDatabaseType);
    this.config.set('searchEngine', this.searchEngine);
    this.config.set('messageBroker', this.messageBroker);
    this.config.set('serviceDiscoveryType', this.serviceDiscoveryType);
    this.config.set('buildTool', this.buildTool);
    this.config.set('enableSocialSignIn', this.enableSocialSignIn);
    this.config.set('jwtSecretKey', this.jwtSecretKey);
    this.config.set('rememberMeKey', this.rememberMeKey);
    this.config.set('enableTranslation', this.enableTranslation);
    if (this.enableTranslation && !this.configOptions.skipI18nQuestion) {
      this.config.set('nativeLanguage', this.nativeLanguage);
      this.config.set('languages', this.languages);
    }
  }
}
,

default:
{
  getSharedConfigOptions()
  {
    this.useSass = this.configOptions.useSass ? this.configOptions.useSass : false;
    if (this.configOptions.enableTranslation !== undefined) {
      this.enableTranslation = this.configOptions.enableTranslation;
    }
    if (this.configOptions.nativeLanguage !== undefined) {
      this.nativeLanguage = this.configOptions.nativeLanguage;
    }
    if (this.configOptions.languages !== undefined) {
      this.languages = this.configOptions.languages;
    }
    if (this.configOptions.testFrameworks) {
      this.testFrameworks = this.configOptions.testFrameworks;
    }
    if (this.configOptions.clientFramework) {
      this.clientFramework = this.configOptions.clientFramework;
    }
    this.protractorTests = this.testFrameworks.indexOf('protractor') !== -1;
    this.gatlingTests = this.testFrameworks.indexOf('gatling') !== -1;
    this.cucumberTests = this.testFrameworks.indexOf('cucumber') !== -1;
  }
,

  composeLanguages()
  {
    if (this.configOptions.skipI18nQuestion) return;

    this.composeLanguagesSub(this, this.configOptions, 'server');
  }
}
,

writing: writeFiles(),

  end()
{
  if (this.prodDatabaseType === 'oracle') {
    this.log('\n\n');
    this.warning(
      `${chalk.yellow.bold('You have selected Oracle database.\n')
        }Please follow our documentation on using Oracle to set up the \n` +
      'Oracle proprietary JDBC driver.'
    );
  }
  this.log(chalk.green.bold('\nServer application generated successfully.\n'));

  let executable = 'mvnw';
  if (this.buildTool === 'gradle') {
    executable = 'gradlew';
  }
  let logMsgComment = '';
  if (os.platform() === 'win32') {
    logMsgComment = ` (${chalk.yellow.bold(executable)} if using Windows Command Prompt)`;
  }
  this.log(chalk.green(`${'Run your Spring Boot application:' +
  '\n '}${chalk.yellow.bold(`./${executable}`)}${logMsgComment}`));
}

})
;
