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
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-ocaml';

export const EXT_2LANGUAGE = {
  'js, jsx, mjs': 'jsx',
  sass: 'sass',
  scss: 'scss',
  css: 'css',
  py: 'python',
  'php, php5': 'php',
  go: 'go',
  java: 'java',
  ts: 'typescript',
  'c, cpp, hpp, h, hh': 'cpp',
  'ml, mli, fs, fsx': 'ocaml',
};
