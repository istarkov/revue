// TODO write
const NO_EXTENSION_LANGUAGE = 'bash';
const NOT_FOUND_EXTENSION_LANGUAGE = 'javascript';

const EXT_2LANGUAGE = {
  'js, jsx, mjs': 'jsx',
  sass: 'sass',
  scss: 'scss',
  css: 'css',
};

const detectLanguage = ({ path /* , content */ }) => {
  const pathPieces = path.split('.');
  if (pathPieces.length === 0) {
    return NO_EXTENSION_LANGUAGE;
  }


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

  const ext = pathPieces[pathPieces.length - 1];
  if (!(ext in ext2languageDict)) {
    return NOT_FOUND_EXTENSION_LANGUAGE;
  }

  return ext2languageDict[ext];
};

export default detectLanguage;
