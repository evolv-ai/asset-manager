export const PREVIEW_REGEX = 'evolvPreviewCid=([0-9a-f]+(?:(?:%3a|:)[0-9a-f]+)+)';
const PREVIEW_REGEX_REPLACE = '#?&?' + PREVIEW_REGEX;

export default {
	shouldActivate: function () {
		return window.location.hash.match(new RegExp(PREVIEW_REGEX));
	},
	activate: function () {
		const match = window.location.hash.match(new RegExp(PREVIEW_REGEX));

		if (match) {
			const token = match[1];

			window.sessionStorage.setItem('evolv:previewCid', token);
			window.location.href = window.location.href.replace(new RegExp(PREVIEW_REGEX_REPLACE), '');
		}
	}
};
