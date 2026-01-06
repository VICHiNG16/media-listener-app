const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    // Get package info
    const pkg = require('./package.json');

    // formatted time: YYYYMMDD-HHmmss
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${year}${month}${day}-${hours}${minutes}${seconds}`;

    // Run npm pack
    console.log('Running npm pack...');
    // npm pack outputs the filename to stdout, but we also rely on knowing the standard format
    const output = execSync('npm pack').toString().trim();
    // Usually output is just the filename, e.g. "media-session-1.0.0.tgz"
    // Some npm versions might output more noise, so we should filter for the .tgz content or just assume standard naming if we trust package.json

    // Standard name check
    const standardName = `${pkg.name}-${pkg.version}.tgz`;

    // If npm pack output matches standardName, we use it. If not, we try to use the last line.
    let generatedFile = standardName;
    if (output.includes(standardName)) {
        generatedFile = standardName;
    } else {
        // Fallback: look for file in directory? Or assume standard naming.
        // npm pack always creates name-version.tgz matching package.json (sanitized)
        // scoped packages replace @ with nothing and / with -
    }

    if (!fs.existsSync(generatedFile)) {
        console.error(`Error: Could not find generated file ${generatedFile}`);
        process.exit(1);
    }

    // New name: name-time-version.tgz
    const newName = `${pkg.name}-${timeStr}-${pkg.version}.tgz`;

    fs.renameSync(generatedFile, newName);

    console.log(`Successfully packed to: ${newName}`);

} catch (error) {
    console.error('Failed to pack:', error.message);
    process.exit(1);
}
