export const PREVIEW_REGEX = 'evolvPreviewCid=([0-9a-f]+(?:(?:%3a|:)[0-9a-f]+)+)';
const PREVIEW_REGEX_HASH = '[#&]' + PREVIEW_REGEX;
const PREVIEW_REGEX_SEARCH = '[?&]' + PREVIEW_REGEX;

export default {
	shouldActivate: function () {
		return window.location.hash.match(new RegExp(PREVIEW_REGEX_HASH)) || window.location.search.match(new RegExp(PREVIEW_REGEX_SEARCH));
	},
	activate: function () {
		const hashMatch = window.location.hash.match(new RegExp(PREVIEW_REGEX_HASH));

		if (hashMatch) {
			const token = hashMatch[1];
			window.sessionStorage.setItem('evolv:previewCid', token);

			const url = new URL(window.location.href);
			const newHash = url.hash.replace(new RegExp(PREVIEW_REGEX_HASH), '');
			url.hash = newHash.length > 0 ? '#' + newHash.slice(1) : '';
			window.location.href = url.toString();

			return;
		}

		const queryMatch = window.location.search.match(new RegExp(PREVIEW_REGEX_SEARCH));

		if (queryMatch) {
			const token = queryMatch[1];
			window.sessionStorage.setItem('evolv:previewCid', token);

			const url = new URL(window.location.href);
			const newSearch = url.search.replace(new RegExp(PREVIEW_REGEX_SEARCH), '');
			url.search = newSearch.length > 0 ? '?' + newSearch.slice(1) : '';
			window.location.href = url.toString();
		}
	}
};
