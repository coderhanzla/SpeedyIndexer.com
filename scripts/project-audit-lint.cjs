const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const ignored = new Set(['node_modules', '.next', '.git', 'out', 'dist', 'build']);
const sourceExt = new Set(['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs', '.json']);
const issues = [];

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (ignored.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full);
            continue;
        }
        if (!sourceExt.has(path.extname(entry.name))) continue;
        checkFile(full);
    }
}

function rel(file) {
    return path.relative(root, file).replace(/\\/g, '/');
}

function add(file, message) {
    issues.push(`${rel(file)}: ${message}`);
}

function checkFile(file) {
    const text = fs.readFileSync(file, 'utf8');

    if (rel(file) !== 'scripts/project-audit-lint.cjs') {
        for (const phrase of ['Start Free', 'Start Indexing Free', 'No credit card required']) {
            if (text.includes(phrase)) add(file, `legacy CTA phrase remains: "${phrase}"`);
        }
    }

    if (/src\/app\/.*\.js$/.test(rel(file)) && /useState\s*\(\s*\(\s*\)\s*=>[^)]*localStorage/s.test(text)) {
        add(file, 'localStorage is read in a useState initializer');
    }

    if (/src\/app\/.*\.js$/.test(rel(file)) && /\.from\(['"]urls['"]\)/.test(text) && /import\s+\{\s*supabase\s*\}/.test(text)) {
        add(file, 'client code queries urls directly with anon Supabase client');
    }

    if (rel(file) === 'src/app/lib/redis.js' && /127\.0\.0\.1|localhost/.test(text)) {
        add(file, 'app Redis client must not fall back to localhost in production code');
    }
}

walk(root);

if (issues.length) {
    console.error('Project audit lint failed:');
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
}

console.log('Project audit lint passed.');
