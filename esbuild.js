
const esbuild = require("esbuild");
const fs = require("node:fs/promises");
const path = require("node:path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');
const outdir = 'out';

async function writeScreenshotTemplate() {
    const [html2canvas, template] = await Promise.all([
        fs.readFile(require.resolve('html2canvas/dist/html2canvas.min.js'), 'utf8'),
        fs.readFile(path.join('src', 'screenshot_template.html'), 'utf8'),
    ]);
    const html = template.replace(
        `<script src="{{__html2canvasPath__}}"><\/script>`,
        `<script>\n${html2canvas}\n</script>`
    );

    await fs.mkdir(outdir, { recursive: true });
    await fs.writeFile(path.join(outdir, 'screenshot_template.html'), html);
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',

    setup(build) {
        build.onStart(() => {
            console.log('[watch] build started');
        });
        build.onEnd((result) => {
            result.errors.forEach(({ text, location }) => {
                console.error(`✘ [ERROR] ${text}`);
                console.error(`    ${location.file}:${location.line}:${location.column}:`);
            });
            console.log('[watch] build finished');
        });
    },
};

async function main() {
    const ctx = await esbuild.context({
        entryPoints: [
            'src/extension.ts'
        ],
        bundle: true,
        format: 'cjs',
        minify: production,
        sourcemap: !production,
        sourcesContent: false,
        platform: 'node',
        mainFields: ['module', 'main'],
        alias: {
            'jsonc-parser': 'jsonc-parser/lib/esm/main.js',
        },
        outfile: path.join(outdir, 'extension.js'),
        external: ['vscode'],
        logLevel: 'silent',
        plugins: [
            /* add to the end of plugins array */
            esbuildProblemMatcherPlugin,
        ],
    });
    if (watch) {
        await writeScreenshotTemplate();
        await ctx.watch();
    } else {
        await ctx.rebuild();
        await writeScreenshotTemplate();
        await ctx.dispose();
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
