import React from 'react';
import { themr } from 'react-css-themr';
import isObject from 'lodash/isObject';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';
import branch from 'recompose/branch';
import renderComponent from 'recompose/renderComponent';
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
import { saveAtUrlShortener, loadFromUrlShortener } from './utils/gooGlUrlShortenerAPI';
import layoutStyles from './Layout.sass';

const DEFAULT_NOTE_KEY = 'nIk5UF';

const layoutComponent = ({
  page,
  theme,
  editMode,
  codeNotes,
  selectedLines,
  codeNotesParsed,
  saveErrors,
  onEditClick,
  setCodeNotes,
  onPageChange,
  onEditorSave,
  onEditorBack,
  onOctocatClick,
  onResetSaveErrors,
  onCursorLineChanged,
}) => (
  <div className={theme.layout}>
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
        <div className={theme.editButton}>
          <IconLabel onClick={onEditClick} name="edit" />
        </div>
    }
    {
      !editMode &&
        <div className={theme.octocatButton}>
          <IconLabel onClick={onOctocatClick} name="octocat" />
        </div>
    }
    {
      editMode &&
        <div className={theme.editor}>
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
        <div className={theme.side} />
    }
    <div className={theme.main}>
      <CodePresenterContainer
        codeNotes={codeNotesParsed}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
    {
      !editMode &&
        <div className={theme.side}>
        </div>
    }
  </div>
);

export const layoutHOC = compose(
  themr('Layout', layoutStyles),
  // make router params typed
  withProps(({ params: { page, noteKeys, editMode } }) => ({
    page: +page,
    noteKeys: noteKeys || DEFAULT_NOTE_KEY,
    editMode: !!editMode,
  })),
  // load codeNotes from db (now it's goo.gl url shortener)
  fileLoader(
    (path) => loadFromUrlShortener(path),
    ({ noteKeys }) => (noteKeys || DEFAULT_NOTE_KEY).split('-'),
    (props, codeNotesArray) => ({
      ...props,
      codeNotesArray,
    })
  ),
  // check file loader result
  withPropsOnChange(
    ['codeNotesArray'],
    ({ codeNotesArray }) => {
      if (codeNotesArray !== undefined) {
        const errors = codeNotesArray.filter(isObject)
          .map(({ payload }) => payload.message);

        if (errors.length > 0) {
          return {
            errors,
          };
        }
        // goo.gl does not allow to save a big amount of data, so I split long notes
        // and need to join them after loading if needed
        const defaultCodeNotes = codeNotesArray.join('');
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
  // The same as withState but every time defaultCodeNotes changed codeNotes is resetted
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
