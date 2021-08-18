
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "sources" }] */
export const objectAssign = Object.assign || function(target, sources) {
	if (target === null || target === undefined) {
		throw new TypeError('Cannot convert undefined or null to object');
	}

	const to = Object(target);

	for (let index = 1; index < arguments.length; index++) {
		let nextSource = arguments[index];

		if (nextSource !== null && nextSource !== undefined) {
			for (let nextKey in nextSource) {
				// Avoid bugs when hasOwnProperty is shadowed
				// eslint-disable-next-line no-prototype-builtins
				if (nextSource.hasOwnProperty(nextKey)) {
					to[nextKey] = nextSource[nextKey];
				}
			}
		}
	}

	return to;
};

window.objectAssign = objectAssign;
