const chalk = require('chalk');

module.exports = {
  askForApplicationType,
  askForModuleName,
  askFori18n,
  askForTestOpts
};


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
