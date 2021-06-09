export const BLOCK_RE = 'evolvBlockExecution=(true|false)';
// template strings is not supported by IE
export const BLOCK_RE_REPLACE = '#?\\??&?' + BLOCK_RE;

export default {
  shouldActivate: function() {
    const regex = new RegExp(BLOCK_RE);
    const match = window.location.hash.match(regex) || window.location.search.match(regex);
    return !!match;
  },
  activate: function() {
    const regex = new RegExp(BLOCK_RE);
    const match = window.location.hash.match(regex) || window.location.search.match(regex);
    if (match) {
      window.evolv.store('blockExecution', match[1], true);
      window.location.href = window.location.href.replace(new RegExp(BLOCK_RE_REPLACE), '');
    }
  }
};
