import React from 'react';
import Observable from './utils/rxjs';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import defaultProps from 'recompose/defaultProps';
import withHandlers from 'recompose/withHandlers';
import withPropsOnChange from 'recompose/withPropsOnChange';
import withStateSelector from './HOCs/withStateSelector';
import fileLoader from './HOCs/fileLoader';
import CodePresenterContainer from './CodePresenterContainer';
import Editor from './Editor/Editor';
import parseCodeNotes from './utils/parseCodeNotes';
import { IconLabel } from './controls/Icon';
import { browserHistory } from 'react-router';
import layoutStyles from './Layout.sass';

const tmpCodeNote = `https://github.com/istarkov/google-map-react/blob/7542b69310865066b05f88af3690040c1f76ae3c/src/google_map.js#L57-L58

# Hello World
This is **hello world** mycode.tips example

https://github.com/istarkov/google-map-react/blob/7542b69310865066b05f88af3690040c1f76ae3c/src/google_map.js#L105-111

# Hello World 2
This is **hello world** mycode.tips example


https://github.com/istarkov/google-map-react/blob/7542b69310865066b05f88af3690040c1f76ae3c/src/google_map.js#L154-L158

# Hello World 3
This is **hello world** mycode.tips example

https://github.com/istarkov/google-map-react/blob/7542b69310865066b05f88af3690040c1f76ae3c/src/google_map.js#L202-L207

# Hello World 4
This is **hello world** mycode.tips example

https://github.com/istarkov/google-map-react/blob/7542b69310865066b05f88af3690040c1f76ae3c/src/google_map.js#L258-L264

# Hello World 5
This is **hello world** mycode.tips example


https://github.com/istarkov/google-map-react/blob/7542b69310865066b05f88af3690040c1f76ae3c/src/marker_dispatcher.js#L9-L11

# Marker dispatcher
This is **hello world** mycode.tips example

https://github.com/user/proj/blob/master/src/oneBigCool.js#L1-L10

Error

`;

const layoutComponent = ({
  styles: {
    layout,
    main,
    editor,
    side,
    editButton,
    octocatButton,
  },
  editMode,
  onEditClick,
  onOctocatClick,
  codeNotes,
  codeNotesParsed,
  selectedLines,
  setCodeNotes,
  page,
  onPageChange,
  onCursorLineChanged,
  onEditorSave,
}) => (
  <div className={layout}>
    {
      !editMode &&
        <div className={editButton}>
          <IconLabel onClick={onEditClick} name="edit" />
        </div>
    }
    {
      !editMode &&
        <div className={octocatButton}>
          <IconLabel onClick={onOctocatClick} name="octocat" />
        </div>
    }
    {
      editMode &&
        <div className={editor}>
          <Editor
            value={codeNotes}
            onChange={setCodeNotes}
            onSave={onEditorSave}
            onCursorLineChanged={onCursorLineChanged}
            selectedLines={selectedLines}
          />
        </div>
    }
    {
      !editMode &&
        <div className={side} />
    }
    <div className={main}>
      <CodePresenterContainer
        codeNotes={codeNotesParsed}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
    {
      !editMode &&
        <div className={side}>
        </div>
    }
  </div>
);

const RETRY_COUNT = 3;
const RETRY_DELAY = 1000;
export const layoutHOC = compose(
  defaultProps({
    styles: layoutStyles,
  }),
  withProps(({ params: { page, noteKeys, editMode } }) => ({
    page: +page,
    noteKeys: noteKeys || '-',
    editMode: !!editMode,
  })),
  // withState('editMode', 'setEditMode', false),
  // http://localhost:3000/PxRF6e-lala/0
  // curl -X GET 'http://localhost:4000/load/FKLRm2'
  // curl -X GET 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyB0ofrDxiagMe2XFecOTF3KcK3MDIQ4ems&shortUrl=http://goo.gl/FKLRm2'
  fileLoader(
    (path) =>
      Observable
        .ajax({ type: 'GET', withCredentials: false, url: `/load/${path}` })
        .retryWhen(error => Observable.from(error).delay(RETRY_DELAY).take(RETRY_COUNT))
        .map(({ response }) => response),
    ({ noteKeys }) => (noteKeys === '-' ? [] : noteKeys.split('-')),
    (props, fileParts) => ({
      ...props,
      fileParts,
    })
  ),
  // The same as withState but every time note changed codeNotes is resetted
  withStateSelector(
    'codeNotes',
    'setCodeNotes',
    () => () => tmpCodeNote // fileParts || tmpCodeNote
  ),
  withPropsOnChange(
    ['codeNotes'],
    ({ codeNotes }) => ({
      codeNotesParsed: parseCodeNotes(codeNotes),
    })
  ),
  // to help visually split blocks
  withPropsOnChange(
    ['codeNotesParsed'],
    ({ codeNotesParsed }) => ({
      selectedLines: codeNotesParsed.map(({ source: { lineFrom } }) => lineFrom),
    })
  ),
  withHandlers({
    onEditClick: ({ noteKeys, page }) => () => {
      browserHistory.push(`/${noteKeys}/${page}/e`);
    },
    onOctocatClick: () => () => {
      window.open('https://github.com/istarkov');
    },
    onPageChange: ({ noteKeys, page, editMode }) => (nextPage) => {
      if (page !== nextPage) {
        browserHistory.push(`/${noteKeys}/${nextPage}${editMode ? '/e' : ''}`);
      }
    },
    onCursorLineChanged: ({ noteKeys, codeNotesParsed, page }) => (line) => {
      // console.log('line', codeNotesParsed, line);
      const nextPage = codeNotesParsed
        .findIndex(({ source: { lineFrom, lineTo } }) => lineFrom <= line && line <= lineTo);
      if (nextPage >= 0 && nextPage !== page) {
        browserHistory.replace(`/${noteKeys}/${nextPage}/e`);
      }
    },
    onEditorSave: ({ noteKeys, page, codeNotes }) => () => {
      browserHistory.push(`/${noteKeys}/${page}`);
      // setEditMode(false);
      // curl -H "Content-Type: application/json" -X POST -d '{"longUrl":"http://aaa?HELLOAFRECA"}' http://localhost:4000/save
      // curl -H "Content-Type: application/json" -X POST -d '{"longUrl":"http://aaa?HELLOAFRECA"}' https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyB0ofrDxiagMe2XFecOTF3KcK3MDIQ4ems

      console.log('onSave');
    },
  }),
);

export default layoutHOC(layoutComponent);
