/**
 * @typedef DatasetConfig
 * @property {string} [evolvEnvironment]
 * @property {string} [evolvEndpoint]
 * @property {string} [evolvUid]
 * @property {string} [evolvLazyUid]
 * @property {string} [evolvRequireConsent]
 * @property {string} [evolvUseCookies]
 * @property {string} [evolvJs]
 * @property {string} [evolvCss]
 * @property {string} [evolvPushstate]
 * @property {string} [evolvTimeout]
 * @property {string} [evolvDebug]
 */

/**
 * @typedef Config
 * @property {string | undefined} environment
 * @property {string} endpoint
 * @property {string | undefined} uid
 * @property {string} lazyUid
 * @property {boolean} requireConsent
 * @property {string|undefined} useCookies
 * @property {boolean} js
 * @property {boolean} css
 * @property {boolean} pushstate
 * @property {number|undefined} timeout
 * @property {boolean} debug
 * @property {string|undefined} profileId
 */

/**
 * Removes the "evolv" namespace from the given dataset key.
 *
 * @param {string} name
 * @return {string}
 */
function stripPrefix(name) {
	return name.replace(/^evolv(.)/, function(sub, group) {
		return group.toLowerCase();
	});
}

/**
 * Builds a partial configuration from the given dataset.
 *
 * @param {Partial<DatasetConfig>|DOMStringMap} dataset
 * @return Partial<Config>
 */
export function buildConfig(dataset) {
	/** @type Partial<Config> */
	const config = {};

	for (let prop in dataset) {
		const name = stripPrefix(prop);


		switch (prop) {
			case 'evolvDebug':
			case 'evolvLazyUid':
			case 'evolvRequireConsent':
			case 'evolvJs':
			case 'evolvCss':
			case 'evolvPushstate': {
				config[name] = dataset[prop] === 'true';
				break;
			}
			case 'evolvTimeout': {
				const value = +dataset[prop];

				config[name] = isNaN(value)
					? undefined
					: value;
				break;
			}
			case 'evolvCapture': {
				const stringValue = (dataset[prop] || '').toLowerCase();
				const numberValue = +stringValue;
				if (stringValue === 'true') {
					config[name] = 1;
				} else if (!isNaN(numberValue)) {
					config[name] = numberValue;
				} else {
					config[name] = undefined;
				}
				break;
			}
			case 'evolvUseCookies':
			default: {
				config[name] = dataset[prop];
				break;
			}
		}
	}

	return config;
}
