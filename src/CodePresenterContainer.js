/* @flow */
import React from 'react';
import uniqBy from 'lodash/uniqBy';
import isArray from 'lodash/isArray';
import compose from 'recompose/compose';
import withPropsOnChange from 'recompose/withPropsOnChange';
import localFetchAndTokenize from './utils/localFetchAndTokenize';
import fetchAndTokenize from './utils/fetchAndTokenize';
import parseCodeNotes from './utils/parseCodeNotes';
import fileLoader from './HOCs/fileLoader';
import CodePresenter from './CodePresenter';
import { AutoSizer } from 'react-virtualized';

import type { TokensLine } from './prism/utils/tokenize';

// Tokens for each code line + lineNumber to show at line start
type Line = {
  lineNumber: string,
  tokens: TokensLine,
}

// Link headers showed at the up
type Header = {
  content: string,
  href: string,
  lineNumber: number,
}

// Notes for code,
// as for md parsing I also use prism
// noteLines tokens has the same format as ordinal code lines
type CodeNote = {
  lineFrom: number,
  lineTo: number,
  noteLines: Array<TokensLine>,
}

type InputProps = {
  lines: Line[],
  headers: Header[],
  codeNotes: CodeNote[],
}

const codePresenterContainer = ({
  lines,
  headers,
  codeNotes,
  ...props,
}: InputProps) => (
  <AutoSizer>
    {
      ({ height, width }) => (
        height > 0 && (
          <div style={{ height, width, display: 'flex' }}>
            <CodePresenter
              {...{ lines, headers, codeNotes }}
              {...props}
              clientHeight={height}
            />
          </div>
        )
      )
    }
  </AutoSizer>
);

const codePresenterContainerHOC = compose(
  // generate links to load from notes
  withPropsOnChange(
    ['codeNotes'],
    ({ codeNotes }) => {
      const codeNotesParsed = isArray(codeNotes)
        ? codeNotes
        : parseCodeNotes(codeNotes);

      const links = uniqBy(
        codeNotesParsed.map(({ link }) => link),
        ({ id }) => id
      );

      return {
        links,
        codeNotesParsed,
      };
    }
  ),
  // load all links
  fileLoader(
    process.env.USE_LOCAL_FETCH // to play with code without proxy
      ? localFetchAndTokenize
      : fetchAndTokenize,
    ({ links }) => links, // input file name source
    (props, filesLinesTokens) => ({ // output content
      ...props,
      filesLinesTokens, // undefined until all files are loaded
    })
  ),
  // combine all file lines into one lines array
  // calculate headers lineNumber,
  // calculate lineFrom lineTo
  withPropsOnChange(
    ['filesLinesTokens', 'codeNotesParsed'],
    ({ filesLinesTokens, codeNotesParsed }) => {
      if (filesLinesTokens === undefined) {
        return {
          lines: undefined,
          headers: undefined,
          codeNotes: undefined,
        };
      }

      const dataHelpers = filesLinesTokens
      .reduce(
        (r, fileLines) => {
          r.linkKey2StartLine[fileLines.link.id] = r.lines.length; // eslint-disable-line
          r.linkKey2LinesCount[fileLines.link.id] = fileLines.lines.length - 2;  // eslint-disable-line
          r.linkKey2LoadingError[fileLines.link.id] = fileLines.lines[0].tokens[0].error; // eslint-disable-line
          r.headers.push({
            lineNumber: r.lines.length,
            // get header data
            content: fileLines.lines[0].tokens[0].content,
            href: fileLines.lines[0].tokens[0].href,
            error: fileLines.lines[0].tokens[0].error,
          }); // eslint-disable-line
          r.lines = r.lines.concat(fileLines.lines); // eslint-disable-line
          return r;
        },
        {
          linkKey2LoadingError: {},
          linkKey2LinesCount: {},
          linkKey2StartLine: {},
          lines: [],
          headers: [],
        }
      );

      const { linkKey2StartLine, linkKey2LinesCount, linkKey2LoadingError } = dataHelpers;

      const codeNotes = codeNotesParsed
        .map(({ id, linkId, noteLines, linkLineFrom, linkLineTo }) => ({
          id,
          noteLines,
          lineFrom: linkKey2LoadingError[linkId] === true
            ? linkKey2StartLine[linkId] + 1
            : !isNaN(linkLineFrom)
                ? Math.min(linkKey2LinesCount[linkId], linkLineFrom) + linkKey2StartLine[linkId]
                : linkKey2StartLine[linkId] + 1, // to first line
          lineTo: linkKey2LoadingError[linkId] === true
            ? linkKey2StartLine[linkId] + linkKey2LinesCount[linkId]
            : !isNaN(linkLineTo)
                ? Math.min(linkKey2LinesCount[linkId], linkLineTo) + linkKey2StartLine[linkId]
                : !isNaN(linkLineFrom)
                  ? Math.min(linkKey2LinesCount[linkId], linkLineFrom) + linkKey2StartLine[linkId]
                  : linkKey2StartLine[linkId] + 1,
        }));

      return {
        lines: dataHelpers.lines,
        headers: dataHelpers.headers,
        codeNotes,
      };
    }
  ),
);

export default codePresenterContainerHOC(codePresenterContainer);
