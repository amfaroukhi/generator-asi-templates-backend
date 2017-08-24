// version of Node, Yarn, NPM
const NODE_VERSION = '6.11.1';
const YARN_VERSION = '0.27.5';
const NPM_VERSION = '5.3.0';
const JAVA_VERSION = 8;

// all constants used throughout all generators
const ROOT_DIR = './';
const MAIN_DIR = 'src/main/';
const TEST_DIR = 'src/test/';

// Note: this will be prepended with 'target/' for Maven, or with 'build/' for Gradle.
const CLIENT_DIST_DIR = 'www/';

const SUPPORTED_VALIDATION_RULES = ['required', 'max', 'min', 'maxlength', 'minlength', 'maxbytes', 'minbytes', 'pattern'];

// documentation constants
const ASI_GENERATOR_DOCUMENTATION_URL = 'https://...';
const ASI_GENERATOR_DOCUMENTATION_ARCHIVE_PATH = '/documentation-archive/';

const SQL_DB_OPTIONS = [
    {
        value: 'mysql',
        name: 'MySQL'
    },
    {
        value: 'mariadb',
        name: 'MariaDB'
    },
    {
        value: 'postgresql',
        name: 'PostgreSQL'
    },
    {
        value: 'oracle',
        name: 'Oracle (non optionnel)'
    },
    {
        value: 'mssql',
        name: 'Microsoft SQL Server'
    }
];

const LANGUAGES = [
    { name: 'Arabic (Libya)', dispName: 'العربية', value: 'ar-ly', rtl: true, skipForLocale: true },
    { name: 'Armenian', dispName: 'Հայերեն', value: 'hy' },
    { name: 'Catalan', dispName: 'Català', value: 'ca' },
    { name: 'Chinese (Simplified)', dispName: '中文（简体）', value: 'zh-cn' },
    { name: 'Chinese (Traditional)', dispName: '繁體中文', value: 'zh-tw' },
    { name: 'Czech', dispName: 'Český', value: 'cs' },
    { name: 'Danish', dispName: 'Dansk', value: 'da' },
    { name: 'Dutch', dispName: 'Nederlands', value: 'nl' },
    { name: 'English', dispName: 'English', value: 'en' },
    { name: 'Estonian', dispName: 'Eesti', value: 'et' },
    { name: 'Farsi', dispName: 'فارسی', value: 'fa', rtl: true },
    { name: 'French', dispName: 'Français', value: 'fr' },
    { name: 'Galician', dispName: 'Galego', value: 'gl' },
    { name: 'German', dispName: 'Deutsch', value: 'de' },
    { name: 'Greek', dispName: 'Ελληνικά', value: 'el' },
    { name: 'Hindi', dispName: 'हिंदी', value: 'hi' },
    { name: 'Hungarian', dispName: 'Magyar', value: 'hu' },
    { name: 'Indonesian', dispName: 'Bahasa Indonesia', value: 'id' },
    { name: 'Italian', dispName: 'Italiano', value: 'it' },
    { name: 'Japanese', dispName: '日本語', value: 'ja' },
    { name: 'Korean', dispName: '한국어', value: 'ko' },
    { name: 'Marathi', dispName: 'मराठी', value: 'mr' },
    { name: 'Polish', dispName: 'Polski', value: 'pl' },
    { name: 'Portuguese (Brazilian)', dispName: 'Português (Brasil)', value: 'pt-br' },
    { name: 'Portuguese', dispName: 'Português', value: 'pt-pt' },
    { name: 'Romanian', dispName: 'Română', value: 'ro' },
    { name: 'Russian', dispName: 'Русский', value: 'ru' },
    { name: 'Slovak', dispName: 'Slovenský', value: 'sk' },
    { name: 'Serbian', dispName: 'Srpski', value: 'sr' },
    { name: 'Spanish', dispName: 'Español', value: 'es' },
    { name: 'Swedish', dispName: 'Svenska', value: 'sv' },
    { name: 'Turkish', dispName: 'Türkçe', value: 'tr' },
    { name: 'Tamil', dispName: 'தமிழ்', value: 'ta' },
    { name: 'Thai', dispName: 'ไทย', value: 'th' },
    { name: 'Ukrainian', dispName: 'Українська', value: 'ua' },
    { name: 'Vietnamese', dispName: 'Tiếng Việt', value: 'vi' }
];

const constants = {
    QUESTIONS: 50, // maximum possible number of questions
    CLIENT_QUESTIONS: 50,
    SERVER_QUESTIONS: 50,
    INTERPOLATE_REGEX: /<%:([\s\S]+?)%>/g, // so that tags in templates do not get mistreated as _ templates
    DOCKER_DIR: `${MAIN_DIR}docker/`,
    LINE_LENGTH: 180,
    LANGUAGES,

    ROOT_DIR,
    MAIN_DIR,
    TEST_DIR,

    CLIENT_MAIN_SRC_DIR: `${MAIN_DIR}webapp/`,
    CLIENT_TEST_SRC_DIR: `${TEST_DIR}javascript/`,
    CLIENT_WEBPACK_DIR: 'webpack/',
    CLIENT_DIST_DIR,
    ANGULAR_DIR: `${MAIN_DIR}webapp/app/`,

    SERVER_MAIN_SRC_DIR: `${MAIN_DIR}java/`,
    SERVER_MAIN_RES_DIR: `${MAIN_DIR}resources/`,
    SERVER_TEST_SRC_DIR: `${TEST_DIR}java/`,
    SERVER_TEST_RES_DIR: `${TEST_DIR}resources/`,

    // entity related
    SUPPORTED_VALIDATION_RULES,

    ASI_GENERATOR_DOCUMENTATION_URL,
    ASI_GENERATOR_DOCUMENTATION_ARCHIVE_PATH,

    SQL_DB_OPTIONS
};

module.exports = constants;
