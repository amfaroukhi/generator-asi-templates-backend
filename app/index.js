const util = require('util');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const BaseGenerator = require('../utils/generator-base');
// const cleanup = require('../cleanup');
const prompts = require('./prompts');
const packagejs = require('../package.json');
const constants = require('../utils/generator-constants');

const ASIGenerator = generator.extend({});

util.inherits(ASIGenerator, BaseGenerator);

module.exports = ASIGenerator.extend({
  constructor: function (...args) { // eslint-disable-line object-shorthand
  generator.apply(this, args);

  this.configOptions = {};
  // This adds support for a `--skip-client` flag
  this.option('skip-client', {
    desc: 'Skip the client-side application generation',
    type: Boolean,
    defaults: true
  });

  // This adds support for a `--skip-server` flag
  this.option('skip-server', {
    desc: 'Skip the server-side application generation',
    type: Boolean,
    defaults: false
  });

  // This adds support for a `--skip-user-management` flag
  this.option('skip-user-management', {
    desc: 'Skip the user management module during app generation',
    type: Boolean,
    defaults: true
  });

  // This adds support for a `--[no-]i18n` flag
  this.option('i18n', {
    desc: 'Disable or enable i18n when skipping client side generation, has no effect otherwise',
    type: Boolean,
    defaults: false
  });

  // This adds support for a `--skip-checks` flag
  this.option('skip-checks', {
    desc: 'Check the status of the required tools',
    type: Boolean,
    defaults: true
  });

  // This adds support for a `--asi-prefix` flag
  this.option('asi-prefix', {
    desc: 'Add prefix before services, controllers and states name',
    type: String,
    defaults: 'asi'
  });

  // This adds support for a `--npm` flag
  this.option('npm', {
    desc: 'Use npm instead of yarn',
    type: Boolean,
    defaults: true
  });

  // This adds support for a `--auth` flag
  this.option('auth', {
    desc: 'Provide authentication type for the application when skipping server',
    type: String
  });

  // This adds support for a `--db` flag
  this.option('db', {
    desc: 'Provide DB name for the application when skipping server',
    type: String
  });

  this.currentQuestion = 0;
  this.totalQuestions = constants.QUESTIONS;
  this.skipClient = this.configOptions.skipClient = this.options['skip-client'] || this.config.get('skipClient');
  this.skipServer = this.configOptions.skipServer = this.options['skip-server'] || this.config.get('skipServer');
  this.skipUserManagement = this.configOptions.skipUserManagement = this.options['skip-user-management'] || this.config.get('skipUserManagement');
  this.asiPrefix = this.configOptions.asiPrefix || this.config.get('asiPrefix') || this.options['asi-prefix'];
  this.skipChecks = this.options['skip-checks'];
  this.isDebugEnabled = this.configOptions.isDebugEnabled = this.options.debug;
},

initializing: {
  displayLogo() {
    this.printASILogo();
  },

  checkJava() {
    this.checkJava();
  },

  validate() {
    if (this.skipServer && this.skipClient) {
      this.error(chalk.red(`Vous ne pouvez pas activer ${chalk.yellow('--skip-client')} et ${chalk.yellow('--skip-server')} ensemble`));
    }
  },

  setupconsts() {
    this.applicationType = this.config.get('applicationType');
    if (!this.applicationType) {
      this.applicationType = 'server';
    }

    this.baseName = this.config.get('baseName');

    this.asiGenVersion = packagejs.version;
    if (this.asiGenVersion === undefined) {
      this.asiGenVersion = this.config.get('asiGenVersion');
    }

    this.otherModules = this.config.get('otherModules');
    this.testFrameworks = this.config.get('testFrameworks');
    this.enableTranslation = this.config.get('enableTranslation');
    this.nativeLanguage = this.config.get('nativeLanguage');
    this.languages = this.config.get('languages');
    const configFound = this.baseName !== undefined && this.applicationType !== undefined;
    if (configFound) {
      this.existingProject = true;
      // If translation is not defined, it is enabled by default
      if (this.enableTranslation === undefined) {
        this.enableTranslation = true;
      }
    }
    this.clientPackageManager = this.config.get('clientPackageManager');
    if (!this.clientPackageManager) {
      if (this.useYarn) {
        this.clientPackageManager = 'yarn';
      } else {
        this.clientPackageManager = 'npm';
      }
    }
  }
},

prompting: {
    askForApplicationType: prompts.askForApplicationType,
    askForModuleName: prompts.askForModuleName
},

configuring: {
  setup() {
    this.configOptions.skipI18nQuestion = true;
    this.configOptions.baseName = this.baseName;
    this.configOptions.logo = false;
    this.configOptions.otherModules = this.otherModules;
    this.configOptions.lastQuestion = this.currentQuestion;

    if (this.skipClient) {
      // defaults to use when skipping client
      this.configOptions.enableTranslation = this.options.i18n;
    }
    this.configOptions.clientPackageManager = this.clientPackageManager;
  },
  askFori18n: prompts.askFori18n,
  composeServer() {
    if (this.skipServer) return;

    this.composeWith(require.resolve('../generators/asi-backend'), {
      configOptions: this.configOptions,
      force: this.options.force
    });
  },

  // Désactiver l'option --skipClient pour permettre la génération de client et accès au code suivant (à venir)
  composeClient() {
    if (this.skipClient) return;

    this.composeWith(require.resolve('../client'), {
      'skip-install': this.options['skip-install'],
      configOptions: this.configOptions,
      force: this.options.force
    });
  }


},

default: {

    askForTestOpts: prompts.askForTestOpts,

    // askForMoreModules: prompts.askForMoreModules,

    setSharedConfigOptions() {
    this.configOptions.lastQuestion = this.currentQuestion;
    this.configOptions.totalQuestions = this.totalQuestions;
    this.configOptions.testFrameworks = this.testFrameworks;
    this.configOptions.enableTranslation = this.enableTranslation;
    this.configOptions.nativeLanguage = this.nativeLanguage;
    this.configOptions.languages = this.languages;
    this.configOptions.clientPackageManager = this.clientPackageManager;
  },

  insight() {
    const insight = this.insight();
    insight.trackWithEvent('generator', 'app');
    insight.track('app/applicationType', this.applicationType);
    insight.track('app/testFrameworks', this.testFrameworks);
    insight.track('app/otherModules', this.otherModules);
    insight.track('app/clientPackageManager', this.clientPackageManager);
  },

  composeLanguages() {
    if (this.skipI18n) return;
    // this.composeLanguagesSub(this, this.configOptions, this.generatorType);
  },

  saveConfig() {
    //this.config.set('asiGenVersion', packagejs.version); Gestion des versions/maj jhipster
    this.config.set('applicationType', this.applicationType);
    this.config.set('baseName', this.baseName);
    this.config.set('testFrameworks', this.testFrameworks);
    this.config.set('asiPrefix', this.asiPrefix);
    this.config.set('otherModules', this.otherModules);
    if (this.skipClient) this.config.set('skipClient', true);
    if (this.skipServer) this.config.set('skipServer', true);
    if (this.skipUserManagement) this.config.set('skipUserManagement', true);
    this.config.set('enableTranslation', this.enableTranslation);
    if (this.enableTranslation) {
      this.config.set('nativeLanguage', this.nativeLanguage);
      this.config.set('languages', this.languages);
    }
    this.config.set('clientPackageManager', this.clientPackageManager);
  }
},

writing: {
  // Gestion des anciennes versions créées
  /**cleanup() {
    cleanup.cleanupOldFiles(this, this.javaDir, this.testDir);
  },*/
}
});

