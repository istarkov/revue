/**
 * To add new language you need to add prism support for it
 * You could see languages supported by prism here http://prismjs.com/#languages-list
 * Then you need to provide extensions associacion
 */
import 'prismjs';
import './components/prismMarkdown';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';

export const EXT_2LANGUAGE = {
  'js, jsx, mjs': 'jsx',
  sass: 'sass',
  scss: 'scss',
  css: 'css',
  py: 'python',
  'php, php5': 'php',
};

// TODO add 10 languages I love
