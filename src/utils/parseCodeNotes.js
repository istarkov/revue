/* @flow */
import tokenize from '../prism/utils/tokenize';
// import uuid from 'node-uuid';

export const parseLink = (link: string) => {
  const re = /(https?):\/\/(github\.com)\/([^\/]+)\/([^\/]+)\/(?:[^\/]+)\/([^\/]+)\/([^#\n\r]+)#?L?(\d+)?-?L?(\d*)?/; // eslint-disable-line
  const match = link.match(re);
  if (!match) {
    throw new Error(`Cant parse link ${link}`);
  }

  const [, protocol, domain, user, project, ref, path, lineFrom, lineTo] = match;
  const linkId = `${protocol}://${domain}/${user}/${project}/${ref}/${path}`;
  return {
    link: {
      id: linkId,
      protocol,
      domain,
      user,
      project,
      ref,
      href: `${protocol}://${domain}/${user}/${project}/blob/${ref}/${path}`,
      path,
    },
    linkId,
    linkLineFrom: +lineFrom,
    linkLineTo: lineTo === undefined ? +lineFrom : +lineTo,
  };
};

const parseTokenLink = (token) => {
  const re = /\[([^\]]+)\]\(([^\)]+)\)/;
  const match = token.content.match(re);
  if (!match) {
    throw new Error(`Cant parse url ${token.content}`);
  }
  const [, name, url] = match;
  return {
    ...token,
    content: name,
    href: url,
  };
};

const REMOVE_PUNCTUACTION = true;
const parseCodeNotes = (str: string) => {
  const tokenizedLines = tokenize(str, 'markdown', REMOVE_PUNCTUACTION);
  const output = [];

  for (let i = 0; i !== tokenizedLines.length; ++i) {
    const currentLineTokens = tokenizedLines[i];
    const gitHubUrlToken = currentLineTokens.find(({ type }) => type === 'github-url');
    if (gitHubUrlToken !== undefined) {
      output.push({
        ...parseLink(gitHubUrlToken.content),
        noteLines: [],
        source: {
          lineFrom: i,
          lineTo: i,
        },
      });
    } else if (output.length > 0) {
      output[output.length - 1].noteLines.push(currentLineTokens);
      output[output.length - 1].source.lineTo++;
    }
  }

  return output
    // trim noteLines
    .map(({ link, linkId, linkLineFrom, linkLineTo, source, noteLines }) => ({
      link,
      linkId,
      linkLineFrom,
      linkLineTo,
      source,
      noteLines: noteLines.slice(
        noteLines.findIndex(l => l.length > 0),
        noteLines.length - [...noteLines].reverse().findIndex(l => l.length > 0),
      ),
    }))
    // update links in notelines
    .map(({ link, linkId, linkLineFrom, linkLineTo, source, noteLines }) => ({
      link,
      linkId,
      linkLineFrom,
      linkLineTo,
      source,
      noteLines: noteLines
        .map(line =>
          line.map(token => (
            token.type.indexOf('url') > -1
              ? parseTokenLink(token)
              : token
          ))
        ),
    }))
    // add id
    .map(({ link, linkId, linkLineFrom, linkLineTo, source, noteLines }, index) => ({
      id: index, // uuid.v4(),
      linkId,
      linkLineFrom,
      linkLineTo,
      link,
      source,
      noteLines,
    }));
};

export default parseCodeNotes;
