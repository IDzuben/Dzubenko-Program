const { execSync } = require('child_process');

try {
    execSync('cmake --version', { stdio: 'inherit' });
    console.log('cmake is installed');
} catch (err) {
    console.error('cmake is not installed');
    process.exit(1);
}
