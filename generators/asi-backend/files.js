const mkdirp = require('mkdirp');
const cleanup = require('../../utils/cleanup');
const constants = require('../../utils/generator-constants');

/* Constants use throughout */
const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const DOCKER_DIR = constants.DOCKER_DIR;
const TEST_DIR = constants.TEST_DIR;
const ROOT_DIR = constants.ROOT_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
const SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

module.exports = {
  writeFiles
};

let javaDir;

function writeFiles() {
  return {

    setUpJavaDir() {
      javaDir = this.javaDir = `${constants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
    },

    /**cleanupOldServerFiles() {
      cleanup.cleanupOldServerFiles(this, this.javaDir, this.testDir);
    },*/

    writeGlobalFiles() {
      this.template('_README.md', 'README.md');
      this.template('gitignore', '.gitignore');
      this.copy('gitattributes', '.gitattributes');
      this.copy('editorconfig', '.editorconfig');
    },

    /**writeDockerFiles() {
      // Create Docker and Docker Compose files
      this.template(`${DOCKER_DIR}_Dockerfile`, `${DOCKER_DIR}Dockerfile`);
      this.template(`${DOCKER_DIR}_app.yml`, `${DOCKER_DIR}app.yml`);
      if (this.prodDatabaseType === 'mysql') {
        this.template(`${DOCKER_DIR}_mysql.yml`, `${DOCKER_DIR}mysql.yml`);
      }
      if (this.prodDatabaseType === 'mariadb') {
        this.template(`${DOCKER_DIR}_mariadb.yml`, `${DOCKER_DIR}mariadb.yml`);
      }
      if (this.prodDatabaseType === 'postgresql') {
        this.template(`${DOCKER_DIR}_postgresql.yml`, `${DOCKER_DIR}postgresql.yml`);
      }
      if (this.prodDatabaseType === 'mongodb') {
        this.template(`${DOCKER_DIR}_mongodb.yml`, `${DOCKER_DIR}mongodb.yml`);
        this.template(`${DOCKER_DIR}_mongodb-cluster.yml`, `${DOCKER_DIR}mongodb-cluster.yml`);
        this.template(`${DOCKER_DIR}mongodb/MongoDB.Dockerfile`, `${DOCKER_DIR}mongodb/MongoDB.Dockerfile`);
        this.template(`${DOCKER_DIR}mongodb/scripts/init_replicaset.js`, `${DOCKER_DIR}mongodb/scripts/init_replicaset.js`);
      }
      if (this.prodDatabaseType === 'mssql') {
        this.template(`${DOCKER_DIR}_mssql.yml`, `${DOCKER_DIR}mssql.yml`);
      }
      if (this.prodDatabaseType === 'oracle') {
        this.template(`${DOCKER_DIR}_oracle.yml`, `${DOCKER_DIR}oracle.yml`);
      }
      if (this.prodDatabaseType === 'cassandra') {
        // docker-compose files
        this.template(`${DOCKER_DIR}_cassandra.yml`, `${DOCKER_DIR}cassandra.yml`);
        this.template(`${DOCKER_DIR}_cassandra-cluster.yml`, `${DOCKER_DIR}cassandra-cluster.yml`);
        this.template(`${DOCKER_DIR}_cassandra-migration.yml`, `${DOCKER_DIR}cassandra-migration.yml`);
        // dockerfiles
        this.template(`${DOCKER_DIR}cassandra/_Cassandra-Migration.Dockerfile`, `${DOCKER_DIR}cassandra/Cassandra-Migration.Dockerfile`);
        // scripts
        this.template(`${DOCKER_DIR}cassandra/scripts/_autoMigrate.sh`, `${DOCKER_DIR}cassandra/scripts/autoMigrate.sh`);
        this.template(`${DOCKER_DIR}cassandra/scripts/_execute-cql.sh`, `${DOCKER_DIR}cassandra/scripts/execute-cql.sh`);
      }
      if (this.searchEngine === 'elasticsearch') {
        this.template(`${DOCKER_DIR}_elasticsearch.yml`, `${DOCKER_DIR}elasticsearch.yml`);
      }
      if (this.messageBroker === 'kafka') {
        this.template(`${DOCKER_DIR}_kafka.yml`, `${DOCKER_DIR}kafka.yml`);
      }
      if (this.serviceDiscoveryType) {
        this.template(`${DOCKER_DIR}config/_README.md`, `${DOCKER_DIR}central-server-config/README.md`);

        if (this.serviceDiscoveryType === 'consul') {
          this.template(`${DOCKER_DIR}_consul.yml`, `${DOCKER_DIR}consul.yml`);
          this.copy(`${DOCKER_DIR}config/git2consul.json`, `${DOCKER_DIR}config/git2consul.json`);
          this.copy(`${DOCKER_DIR}config/consul-config/application.yml`, `${DOCKER_DIR}central-server-config/application.yml`);
        }
        if (this.serviceDiscoveryType === 'eureka') {
          this.template(`${DOCKER_DIR}_jhipster-registry.yml`, `${DOCKER_DIR}jhipster-registry.yml`);
          this.copy(`${DOCKER_DIR}config/docker-config/application.yml`, `${DOCKER_DIR}central-server-config/docker-config/application.yml`);
          this.copy(`${DOCKER_DIR}config/localhost-config/application.yml`, `${DOCKER_DIR}central-server-config/localhost-config/application.yml`);
        }
      }


      this.template(`${DOCKER_DIR}_sonar.yml`, `${DOCKER_DIR}sonar.yml`);
    },*/

    writeServerBuildFiles() {
      switch (this.buildTool) {
        case 'maven':
        default :
          this.copy('mvnw', 'mvnw');
          this.copy('mvnw.cmd', 'mvnw.cmd');
          this.copy('.mvn/wrapper/maven-wrapper.jar', '.mvn/wrapper/maven-wrapper.jar');
          this.copy('.mvn/wrapper/maven-wrapper.properties', '.mvn/wrapper/maven-wrapper.properties');
          this.template('_pom.xml', 'pom.xml', null, { interpolate: INTERPOLATE_REGEX });
      }
    },

    writeServerResourceFiles() {
      // Create Java resource files
      mkdirp(SERVER_MAIN_RES_DIR);
      this.copy(`${SERVER_MAIN_RES_DIR}banner.txt`, `${SERVER_MAIN_RES_DIR}banner.txt`);
    },

    writeServerModulesFiles() {
      this.copy('../modules/batch', this.baseName+'-batch');
      this.copy('../modules/business', this.baseName+'-business');
      this.copy('../modules/common-dependencies', this.baseName+'-common-dependencies');
      this.copy('../modules/common-dto', this.baseName+'-common-dto');
      this.copy('../modules/common-serialize', this.baseName+'-common-serialize');
      this.copy('../modules/config', this.baseName+'-config');
      this.copy('../modules/dao', this.baseName+'-dao');
      this.copy('../modules/database-services', this.baseName+'-database-services');
      this.copy('../modules/dto', this.baseName+'-dto');
      this.copy('../modules/ged-services', this.baseName+'-ged-services');
      this.copy('../modules/helpers', this.baseName+'-helpers');
      this.copy('../modules/mappers', this.baseName+'-mappers');
      this.copy('../modules/model', this.baseName+'-model');
      this.copy('../modules/override', this.baseName+'-override');
      this.copy('../modules/report', this.baseName+'-report');
      this.copy('../modules/resources', this.baseName+'-resources');
      this.copy('../modules/serialize', this.baseName+'-serialize');
      this.copy('../modules/technical-services', this.baseName+'-technical-services');
      this.copy('../modules/utils', this.baseName+'-utils');
      this.copy('../modules/validators', this.baseName+'-validators');
      this.copy('../modules/web-services', this.baseName+'-web-services');
      this.copy('../modules/webapp', this.baseName+'-webapp');
    },

    writeServerPropertyFiles() {
    },

    writeServerJavaAuthConfigFiles() {

    },

    writeServerJavaAppFiles() {
      // Create Java files
      // Spring Boot main
      // this.template(`${SERVER_MAIN_SRC_DIR}package/_Application.java`, `${javaDir}/${this.mainClass}.java`);
      // this.template(`${SERVER_MAIN_SRC_DIR}package/_ApplicationWebXml.java`, `${javaDir}/ApplicationWebXml.java`);
    },

    writeServerJavaConfigFiles() {

    },

    writeServerJavaDomainFiles() {

    },

    writeServerJavaPackageInfoFiles() {
      // this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_package-info.java`, `${javaDir}repository/package-info.java`);
    },

    writeServerJavaServiceFiles() {
      // this.template(`${SERVER_MAIN_SRC_DIR}package/service/_package-info.java`, `${javaDir}service/package-info.java`);

       // Skip the code below for --skip-user-management
      if (this.skipUserManagement) return;

      // this.template(`${SERVER_MAIN_SRC_DIR}package/service/util/_RandomUtil.java`, `${javaDir}service/util/RandomUtil.java`);
    },

    writeServerJavaWebErrorFiles() {

    },

    writeServerTestFwFiles() {
      // Create Test Java files
      const testDir = this.testDir;
      mkdirp(testDir);
    }
  };
}
