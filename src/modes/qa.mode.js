export const QA_RE = 'evolvCandidateToken=(([0-9]+)_([0-9]+)_([0-9a-z]+))';
// template strings is not supported by IE
const QA_RE_REPLACE = '#?&?' + QA_RE;

export default {
	shouldActivate: function(environmentId) {
		const match = window.location.hash.match(new RegExp(QA_RE));
		return match && environmentId === match[4];
	},
	activate: function() {
		const match = window.location.hash.match(new RegExp(QA_RE));

		if (match) {
			const token = match[1];

			window.evolv.store('candidateToken', token, true);
			window.location.href = window.location.href.replace(new RegExp(QA_RE_REPLACE), '');
		}
	}
};
