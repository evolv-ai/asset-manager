export default {
	branches: [
		{ name: 'master', channel: 'next' },
		{ name: 'release/*', channel: 'rc', prerelease: 'rc' }
	],
	tagFormat: 'v${version}',
	plugins: [
		'@semantic-release/commit-analyzer',
		['@semantic-release/release-notes-generator', {
			writerOpts: {
				transform: escapeSkipDirectives
			}
		}],
		'@semantic-release/changelog',
		['@semantic-release/npm', {
			npmPublish: false
		}],
		['@semantic-release/git', {
			message: 'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
			assets: [
				'CHANGELOG.md',
				'package.json',
				'package-lock.json'
			]
		}]
	]
};

/**
 * Alters Travis [skip] directives so that they become inert.
 *
 * @description
 * Travis CI allows commit messages to contain a directive similar to [skip ci] which will cause a build to
 * be skipped. However, when committing a release, if any constituent message collected into the release
 * notes contains the directive, the build will be skipped.
 *
 * @see {@link https://docs.travis-ci.com/user/customizing-the-build/#skipping-a-build}
 *
 * @param commitChunk
 * @returns {*}
 */
function escapeSkipDirectives(commitChunk) {
	const keywords = ['ci', 'travis', 'travis-ci', 'travisci'].join('|');
	const replacer = (full, captured) => `|${captured}|`;

	const leadingSkip = new RegExp(`\\[(skip\\s+(${keywords}))\\]`);
	const trailingSkip = new RegExp(`\\[((${keywords})\\s+skip)\\]`);

	['body', 'header', 'message', 'footer'].forEach(field => {
		if (!commitChunk[field]) {
			return;
		}

		commitChunk[field] = commitChunk[field]
			.replace(leadingSkip, replacer)
			.replace(trailingSkip, replacer);
	});

	return commitChunk;
}
