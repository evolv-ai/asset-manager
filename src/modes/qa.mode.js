const QA_RE = 'evolvCandidateToken=([_0-9]+)';
const QA_RE_REPLACE = `#?&?${QA_RE}`;

export default {
	shouldActivate() {
		return new RegExp(QA_RE).test(window.location.hash);
	},
	activate() {
		const match = window.location.hash.match(new RegExp(QA_RE));

		if (match) {
			const token = match[1];

			window.evolv.store('candidateToken', token, true);
			window.location.href = window.location.href.replace(new RegExp(QA_RE_REPLACE), '');
		}
	}
};
