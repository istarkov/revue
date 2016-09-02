import React, { Component } from 'react';
import compose from 'recompose/compose';
import withState from 'recompose/withState';
import shallowEqual from 'fbjs/lib/shallowEqual';
import defaultProps from 'recompose/defaultProps';
import codeMirror from 'codemirror';
import Button from './Button';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import './mode/simpleMarkdown';

import editorStyles from './editor.sass';
import './monokaiExtend.sass';

export class Editor extends Component {
  componentDidMount() {
    this.editor = codeMirror(
      this.holder,
      {
        value: this.props.value,
        tabSize: 2,
        mode: 'simpleMarkdown',
        // I love monokai, but will accept PR with other themes support
        theme: 'monokai',
      }
    );
    this.editor.on('change', this.onEdit);
    this.editor.on('cursorActivity', this.onCursorActivity);
    this.updateSelectedLines();
  }

  componentDidUpdate(prevProps) {
    this.ignoreChangeEvent = true;
    if (this.props.value !== prevProps.value &&
        this.props.value !== this.cachedValue) {
      this.cachedValue = this.props.value;
      this.editor.setValue(this.props.value);
    }

    if (!shallowEqual(this.props.selectedLines, prevProps.selectedLines)) {
      this.updateSelectedLines();
    }
    this.ignoreChangeEvent = false;
  }

  componentWillUnmount() {
    this.editor.off('change', this.onEdit);
    this.editor.off('cursorActivity', this.onCursorActivity);
    this.editor = null;
  }

  onCursorActivity = (editor) => {
    if (!this.ignoreChangeEvent) {
      const { line } = editor.getCursor();
      if (this.cursorLine !== line) {
        this.cursorLine = line;
        if (this.props.onCursorLineChanged) {
          this.props.onCursorLineChanged(line);
        }
      }
    }
  }

  onEdit = () => {
    if (!this.ignoreChangeEvent) {
      this.cachedValue = this.editor.getValue();
      if (!this.props.hasChanged) {
        this.props.setHasChanged(true);
      }

      if (this.props.onChange) {
        this.props.onChange(this.cachedValue);
        if (this.props.onCursorLineChanged) {
          const { line } = this.editor.getCursor();
          this.props.onCursorLineChanged(line);
        }
      }
    }
  }

  setRef = (holder) => {
    this.holder = holder;
  }

  updateSelectedLines = () => {
    this.editor.operation(() => {
      this.selectedLinesHandles.forEach(
        lineHandle =>
          this.editor.removeLineClass(lineHandle, 'background', this.props.styles.selectedLine)
      );
      this.selectedTextLinesHandles.forEach(
        lineHandle =>
          this.editor.removeLineClass(lineHandle, 'text', this.props.styles.selectedTextLine)
      );

      this.selectedLinesHandles = this.props.selectedLines.map(
        lineNum => this.editor.addLineClass(lineNum, 'background', this.props.styles.selectedLine)
      );

      this.selectedTextLinesHandles = this.props.selectedLines.map(
        lineNum => this.editor.addLineClass(lineNum, 'text', this.props.styles.selectedTextLine)
      );
    });
  }


  editor = null;
  holder = null;
  selectedLinesHandles = [];
  selectedTextLinesHandles = [];
  ignoreChangeEvent = false;
  cursorLine = -1;

  render() {
    const {
      props: {
        styles,
        hasChanged,
        onSave,
        onBack,
      },
      setRef,
    } = this;

    return (
      <div className={styles.main}>
        <div className={styles.editor}>
          <div className={styles.editorHolder} ref={setRef} />
        </div>

        <div className={styles.buttonsPanel}>
          <Button onClick={onSave} active={hasChanged}>
            SAVE
          </Button>
          <Button onClick={onBack} theme={styles} themeNamespace="cancel" active>
            BACK
          </Button>
        </div>
      </div>
    );
  }
}

export const editorHOC = compose(
  defaultProps({
    styles: editorStyles,
    onSave: () => {},
  }),
  withState('hasChanged', 'setHasChanged', false)
);

export default editorHOC(Editor);
