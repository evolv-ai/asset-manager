import fs from 'fs';

const myArgs = process.argv.slice(2);
const packageFile = myArgs[0];
const semVer = myArgs[1];

if (packageFile && semVer) {
	console.log(`Changing version in ${packageFile} to ${semVer}.`);
	const packageContents = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
	packageContents.version = semVer;
	fs.writeFileSync(packageFile, JSON.stringify(packageContents, null, '\t'));
	console.log('Done changing version in file.');
} else {
	console.log('Arguments were missing.');
}
