#!/bin/bash
set -e
# wait this issue to complete
# https://github.com/bvaughn/react-virtualized/issues/357#issuecomment-241790616

SCRIPT_PATH=`dirname ${BASH_SOURCE[0]}`
DIR=`cd "$SCRIPT_PATH";pwd -P`
FILE_PATH="$DIR/../../node_modules/react-virtualized/dist/commonjs/Grid/Grid.js"

FIND='if (this.state.scrollLeft !== scrollLeft || this.state.scrollTop !== scrollTop) {'
REPLACE='var zoom = Math.round(((window.outerWidth) \/ window.innerWidth) * 100) \/ 100; if (Math.abs(this.state.scrollLeft - scrollLeft) >= 1 \/ zoom || Math.abs(this.state.scrollTop - scrollTop) >= 1 \/ zoom) {'

LINE_EXISTS=`cat "$FILE_PATH" | grep "$FIND" | wc -l`
TMPFILE="/tmp/$RANDOM.Grid.js"

if [[ $LINE_EXISTS = 1 ]]; then
  cat "$FILE_PATH" | sed "s/$FIND/$REPLACE/g" > $TMPFILE
  mv "$FILE_PATH" "${FILE_PATH}_original"
  mv "$TMPFILE" "$FILE_PATH"
else
  (>&2 echo "Codemod could not be run, remove as it almost solves nothing")
  exit 1
fi
