export function isLegacy(functionMap) {
  return function(key) {
    return key in functionMap
      && functionMap[key] !== undefined
      && (functionMap[key].timing === undefined);
  };
}

export function isImmediate(functionMap) {
  return function(key) {
    return key in functionMap
      && functionMap[key] !== undefined
      && functionMap[key].timing === 'immediate';
  };
}

export function isOnDomContentLoaded(functionMap) {
  return function(key) {
    return key in functionMap
      && functionMap[key] !== undefined
      && functionMap[key].timing === 'dom-content-loaded';
  };
}

export function isOnPageLoaded(functionMap) {
  return function(key) {
    return key in functionMap
      && functionMap[key] !== undefined
      && functionMap[key].timing === 'loaded';
  };
}
