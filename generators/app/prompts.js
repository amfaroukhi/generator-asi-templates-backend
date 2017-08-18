const chalk = require('chalk');

module.exports = {
  // askForInsightOptIn,
  askForApplicationType,
  askForModuleName,
  askFori18n,
  askForTestOpts
  // askForMoreModules
};

// app->index.js : askForInsightOptIn: prompts.askForInsightOptIn
/**function askForInsightOptIn() {
  if (this.existingProject) return;

  const done = this.async();
  const insight = this.insight();

  this.prompt({
      when: () => insight.optOut === undefined,
    type: 'confirm',
    name: 'insight',
    message: `May ${chalk.cyan('JHipster')} anonymously report usage statistics to improve the tool over time?`,
default: true
}).then((prompt) => {
    if (prompt.insight !== undefined) {
    insight.optOut = !prompt.insight;
  }
  done();
});
}*/

// Demander le type d'application
function askForApplicationType() {
  if (this.existingProject) return;

  const DEFAULT_APPTYPE = 'server';

  const done = this.async();

  const promise = this.skipServer
    ? Promise.resolve({ applicationType: DEFAULT_APPTYPE })
    : this.prompt({
        type: 'list',
        name: 'applicationType',
        message: response => this.getNumberedQuestion('Quel *type* d\'application voulez-vous créer?', true),
      choices: [
    {
      value: DEFAULT_APPTYPE,
      name: 'Application backend Java/Spring'
    },
    {
      value: 'client',
      name: '[Soon]Application frontend Angular'
    },
    {
      value: 'full',
      name: '[Soon]Application client(Angular)-serveur(Spring)'
    }
  ],
default: DEFAULT_APPTYPE
});
  promise.then((prompt) => {
    this.applicationType = this.configOptions.applicationType = prompt.applicationType;
  done();
});
}

// Demander le nom  de base du projet
function askForModuleName() {
  if (this.existingProject) return;

  this.askModuleName(this);
  this.configOptions.lastQuestion = this.currentQuestion;
  this.configOptions.totalQuestions = this.totalQuestions;
}

// Demander pour l'utilisation de l'internationnalisation i18n
function askFori18n() {
  this.currentQuestion = this.configOptions.lastQuestion;
  this.totalQuestions = this.configOptions.totalQuestions;
  if (this.skipI18n || this.existingProject) return;
  this.aski18n(this);
}

// Demander les frameworks de test aditionnels
function askForTestOpts() {
  if (this.existingProject) return;

  const choices = [];
  const defaultChoice = [];
  if (!this.skipServer) {
    // Tout framework test côté serveur devra être ajouté ici
    choices.push(
      { name: 'Gatling', value: 'gatling' },
      { name: 'Cucumber', value: 'cucumber' }
    );
  }
  if (!this.skipClient) {
    // Tout framework test côté client devra être ajouté ici
    choices.push(
      { name: 'Protractor', value: 'protractor' }
    );
  }
  const done = this.async();

  this.prompt({
      type: 'checkbox',
      name: 'testFrameworks',
      message: response => this.getNumberedQuestion('Outre JUnit et Karma, quels frameworks de test voudriez-vous utiliser?', true),
    choices,
default: defaultChoice
}).then((prompt) => {
    this.testFrameworks = prompt.testFrameworks;
  done();
});
}


/**function askForMoreModules() {
  if (this.existingProject) {
    return;
  }

  const done = this.async();
  this.prompt({
      type: 'confirm',
      name: 'installModules',
      message: response => this.getNumberedQuestion('Would you like to install other generators from the JHipster Marketplace?', true),
default: false
}).then((prompt) => {
    if (prompt.installModules) {
    askModulesToBeInstalled(done, this);
  } else {
    done();
  }
});
}*/


/**function askModulesToBeInstalled(done, generator) {
  generator.httpsGet('https://api.npms.io/v2/search?q=keywords:jhipster-module&from=0&size=50', (body) => {
    try {
      const moduleResponse = JSON.parse(body);
  const choices = [];
  moduleResponse.results.forEach((modDef) => {
    choices.push({
    value: { name: modDef.package.name, version: modDef.package.version },
    name: `(${modDef.package.name}-${modDef.package.version}) ${modDef.package.description}`
  });
});
  if (choices.length > 0) {
    generator.prompt({
      type: 'checkbox',
      name: 'otherModules',
      message: 'Which other modules would you like to use?',
      choices,
      default: []
    }).then((prompt) => {
      // [ {name: [moduleName], version:[version]}, ...]
      generator.otherModules = [];
    prompt.otherModules.forEach((module) => {
      generator.otherModules.push({ name: module.name, version: module.version });
  });
    generator.configOptions.otherModules = generator.otherModules;
    done();
  });
  } else {
    done();
  }
} catch (err) {
    generator.warning(`Error while parsing. Please install the modules manually or try again later. ${err.message}`);
    done();
  }
}, (error) => {
    generator.warning(`Unable to contact server to fetch additional modules: ${error.message}`);
    done();
  });
}*/
