const fs = require('fs');
const path = require('path');

const cliPath = path.join(__dirname, '../dist/cli/index.js');

if (fs.existsSync(cliPath)) {
	const content = fs.readFileSync(cliPath, 'utf-8');
	if (!content.startsWith('#!/usr/bin/env node')) {
		fs.writeFileSync(cliPath, '#!/usr/bin/env node\n' + content, 'utf-8');
	}
	// Make file executable
	try {
		fs.chmodSync(cliPath, '755');
	} catch (err) {
		// chmod might fail on Windows, that's okay
		console.warn('Could not set executable permissions (this is normal on Windows)');
	}
} else {
	console.warn('CLI file not found at:', cliPath);
}
