const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const sourcePath = path.join(process.cwd(), 'src', 'utils', 'translations.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const moduleRecord = { exports: {} };
new Function('exports', 'module', output)(moduleRecord.exports, moduleRecord);
const translations = moduleRecord.exports.translations;
const english = Object.keys(translations.en).sort();
const tamil = new Set(Object.keys(translations.ta));
const missingTamil = english.filter((key) => !tamil.has(key));
const missingEnglish = Object.keys(translations.ta).filter((key) => !english.includes(key));
if (missingTamil.length || missingEnglish.length) {
  console.error(JSON.stringify({ missingTamil, missingEnglish }, null, 2));
  process.exit(1);
}
console.log(`i18n parity OK: ${english.length} English/Tamil keys`);
