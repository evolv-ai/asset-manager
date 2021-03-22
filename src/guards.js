export function isImmediate(functionMap) {
  return function(key) {
    return key in functionMap
      && (functionMap[key] === undefined || functionMap[key].timing === 'immediate');
  };
}

export function isScheduled(functionMap) {
  return function(key) {
    return key in functionMap
      && functionMap[key] !== undefined
      && functionMap[key].timing !== 'immediate';
  };
}
