import React from 'react';
import isObject from 'lodash/isObject';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';
import branch from 'recompose/branch';
import renderComponent from 'recompose/renderComponent';
import defaultProps from 'recompose/defaultProps';
import withHandlers from 'recompose/withHandlers';
import withPropsOnChange from 'recompose/withPropsOnChange';
import withStateSelector from './HOCs/withStateSelector';
import fileLoader from './HOCs/fileLoader';
import CodePresenterContainer from './CodePresenterContainer';
import Editor from './Editor';
import Loading from './Loading';
import Notification from './Notification';
import parseCodeNotes from './utils/parseCodeNotes';
import { IconLabel } from './controls/Icon';
import { browserHistory } from 'react-router';
import {
  saveAtUrlShortener, loadFromUrlShortener, decodeUrlShortenerData,
} from './utils/gooGlUrlShortenerAPI';
import layoutStyles from './Layout.sass';

const DEFAULT_NOTE_KEY = '6HZ0EU';

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
  onEditorBack,
  saveErrors,
  onResetSaveErrors,
}) => (
  <div className={layout}>
    {
      saveErrors &&
        <Notification
          title={'SAVE ERROR'}
          list={saveErrors}
          buttonText={'Try save later'}
          onButtonClick={onResetSaveErrors}
        />
    }
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
            onBack={onEditorBack}
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

export const layoutHOC = compose(
  defaultProps({
    styles: layoutStyles,
  }),
  withProps(({ params: { page, noteKeys, editMode } }) => ({
    page: +page,
    noteKeys: noteKeys || DEFAULT_NOTE_KEY,
    editMode: !!editMode,
  })),
  fileLoader(
    (path) => loadFromUrlShortener(path),
    ({ noteKeys }) => (noteKeys || DEFAULT_NOTE_KEY).split('-'),
    (props, base64EditorContentArray) => ({
      ...props,
      base64EditorContentArray,
    })
  ),
  // base64EditorContentArray
  withPropsOnChange(
    ['base64EditorContentArray'],
    ({ base64EditorContentArray }) => {
      if (base64EditorContentArray !== undefined) {
        const errors = base64EditorContentArray.filter(isObject)
          .map(({ payload }) => payload.message);

        if (errors.length > 0) {
          return {
            errors,
          };
        }

        const defaultCodeNotes = decodeUrlShortenerData(base64EditorContentArray);
        return {
          defaultCodeNotes,
        };
      }

      return {
        editorContentLoading: true,
      };
    }
  ),
  branch(
    ({ editorContentLoading }) => editorContentLoading,
    renderComponent(() => <Loading text={'LOADING'} />),
    (v) => v,
  ),
  branch(
    ({ errors }) => errors && errors.length > 0,
    renderComponent(({ errors }) => (
      <Notification
        title={'LOADING ERROR'}
        list={errors}
        buttonText={'Visit homepage'}
        onButtonClick={() => browserHistory.push('/')}
      />
    )),
    (v) => v,
  ),
  // The same as withState but every time note changed codeNotes is resetted
  withStateSelector(
    'codeNotes',
    'setCodeNotes',
    () => ({ defaultCodeNotes }) => defaultCodeNotes
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
  withState('saveErrors', 'setSaveErrors', undefined),
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
    onEditorBack: ({ noteKeys, page }) => () => {
      browserHistory.push(`/${noteKeys}/${page}`);
    },
    onEditorSave: ({ noteKeys, page, codeNotes, setSaveErrors }) => () => {
      // hide save buttons,
      browserHistory.push(`/${noteKeys}/${page}`);

      saveAtUrlShortener({
        text: codeNotes,
      })
      .subscribe(
        (newNoteKeys) => browserHistory.push(`/${newNoteKeys}/${page}`),
        (e) => setSaveErrors([e.message]),
        () => {}
      );
    },
    onResetSaveErrors: ({ setSaveErrors }) => () => {
      setSaveErrors(undefined);
    },
  }),
);

export default layoutHOC(layoutComponent);
