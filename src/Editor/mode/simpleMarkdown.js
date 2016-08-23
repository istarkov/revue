/* eslint-disable max-len */
/* Fast and superdirty simple markdown with github-url syntax highliting */
import codeMirror from 'codemirror';
import 'codemirror/addon/mode/simple';

codeMirror.defineSimpleMode('simpleMarkdown', {
  // The start state contains the rules that are intially used
  start: [
    {
      regex: /(https?:\/\/github\.com\/)([\w-]+)(\/)([\w-]+)(\/[\w-]+\/[\w-]+\/)([\w-\/\.]+)(#)*(.*)/,
      token: [
        'link-comment', // protocol-domain
        'number', // user company
        'link-comment',
        'def', // project
        'link-comment',
        'path',
        'link-comment',
        'variable-3',
      ],
    },
    { regex: /^#\s.+$/, token: 'header' },
    {
      regex: /(\[)([^\]]+)(\]\()([^\)]+)(\))/,
      token: ['comment', 'property', 'comment', 'link', 'comment'],
    },
    { regex: /[_\*]{2}.*?[_\*]{2}/, token: 'bold' },
    { regex: /[_\*].*?[_\*]/, token: 'italic' },
  ],
  comment: [],
});
