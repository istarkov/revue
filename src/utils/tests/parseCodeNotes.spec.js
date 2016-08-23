/* @flow */
// `npm bin`/mocha --compilers js:babel-register --reporter min --watch './src/**/*.spec.js'
import expect from 'expect';
import parseCodeNotes from '../parseCodeNotes';

const descr = `
https://github.com/istarkov/google-map-react/blob/0296eb678ad54f441c30dc566ec817a636d4a5c0/src/google_map.js#L35-L41
Notes supports *itallic* and **bold** and _itallic_ and __bold__
[WillBeIgnored](https://github.com/istarkov/google-map-react/blob/0296eb678ad54f441c30dc566ec817a636d4a5c0/src/google_map.js#L35-L41)
and **BIG *COOL* CODE**
https://github.com/istarkov/google-map-react/blob/0296eb678ad54f441c30dc566ec817a636d4a5c0/src/google_map.js#L35


supports multiline notes

and trim empty lines

[aaa](https://github.com/istarkov/google-map-react/blob/0296eb678ad54f441c30dc566ec817a636d4a5c0/src/google_map.js)

also it supports [links](https://github.com/istarkov/google-map-react)`;

describe('parseCodeNotes', () => {
  it('should parse notes text with itallic', () => {
    const parsed = parseCodeNotes(descr);

    expect(parsed[0].noteLines).toEqual([[
        { type: 'text', content: 'Notes supports ' },
        { type: ['italic', 'text'], content: 'itallic' },
        { type: 'text', content: ' and ' },
        { type: ['bold', 'text'], content: 'bold' },
        { type: 'text', content: ' and ' },
        { type: ['italic', 'text'], content: 'itallic' },
        { type: 'text', content: ' and ' },
        { type: ['bold', 'text'], content: 'bold' },
    ]]);

    expect(parsed[1].noteLines).toEqual([[
      { type: 'text', content: 'and ' },
      { type: ['bold', 'text'], content: 'BIG ' },
      { type: ['bold', 'italic', 'text'], content: 'COOL' },
      { type: ['bold', 'text'], content: ' CODE' },
    ]]);

    expect(parsed[2].noteLines).toEqual([
      [{ type: 'text', content: 'supports multiline notes' }],
      [],
      [{ type: 'text', content: 'and trim empty lines' }],
    ]);

    expect(parsed[3].noteLines).toEqual([[
      { type: 'text', content: 'also it supports ' },
      {
        type: ['url', 'text'],
        content: 'links',
        href: 'https://github.com/istarkov/google-map-react',
      },
    ]]);
  });

  it('should detect and parse links', () => {
    const parsed = parseCodeNotes(descr);
    expect(
      parsed.filter(({ link: { project } }) => project === 'google-map-react').length
    )
    .toEqual(parsed.length);

    expect(
      parsed.map(({ linkLineFrom, linkLineTo }) => ({ linkLineFrom, linkLineTo }))
    )
    .toEqual([
      { linkLineFrom: 35, linkLineTo: 41 },
      { linkLineFrom: 35, linkLineTo: 41 },
      { linkLineFrom: 35, linkLineTo: 35 },
      { linkLineFrom: NaN, linkLineTo: NaN },
    ]);
  });
});
