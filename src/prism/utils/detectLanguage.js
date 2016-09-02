// TODO write
const NO_EXTENSION_LANGUAGE = 'bash';
const NOT_FOUND_EXTENSION_LANGUAGE = 'javascript';
import { EXT_2LANGUAGE } from './languages.js';

const ext2languageDict = Object.keys(EXT_2LANGUAGE)
  .reduce(
    (r, extensions) => {
      const exts = extensions.replace(/\s+/, '').split(',');
      exts.forEach(ext => {
        r[ext] = EXT_2LANGUAGE[extensions]; // eslint-disable-line
      });
      return r;
    },
    {}
  );

const detectLanguage = ({ path /* , content */ }) => {
  const pathPieces = path.split('.');
  if (pathPieces.length === 0) {
    return NO_EXTENSION_LANGUAGE;
  }

  const ext = pathPieces[pathPieces.length - 1];

  if (!(ext in ext2languageDict)) {
    return NOT_FOUND_EXTENSION_LANGUAGE;
  }

  return ext2languageDict[ext];
};

export default detectLanguage;
