import fs from "fs";
import path from "path";

const root = process.cwd();
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const ignore = new Set(["node_modules", ".next", "dist", ".git", "coverage"]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}

function resolveImport(fromFile, spec) {
  if (spec.startsWith("@/")) return path.join(root, spec.slice(2));
  if (spec.startsWith(".") || spec.startsWith("/")) {
    return path.resolve(path.dirname(fromFile), spec);
  }
  return null;
}

function existsExact(absBase) {
  const candidates = [
    absBase,
    `${absBase}.ts`,
    `${absBase}.tsx`,
    `${absBase}.js`,
    `${absBase}.jsx`,
    path.join(absBase, "index.ts"),
    path.join(absBase, "index.tsx"),
    path.join(absBase, "index.js"),
    path.join(absBase, "index.jsx"),
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;

    const parts = path.relative(root, candidate).split(path.sep);
    let cur = root;
    for (const part of parts) {
      const names = fs.readdirSync(cur);
      const hit = names.find((n) => n === part);
      if (!hit) {
        const ci = names.find((n) => n.toLowerCase() === part.toLowerCase());
        return {
          ok: false,
          kind: "case",
          expected: part,
          actual: ci || null,
          resolved: candidate,
        };
      }
      cur = path.join(cur, hit);
    }
    return { ok: true, resolved: candidate };
  }

  const dir = path.dirname(absBase);
  const base = path.basename(absBase);
  if (fs.existsSync(dir)) {
    const names = fs.readdirSync(dir);
    const ci = names.find((n) => {
      const lower = n.toLowerCase();
      return (
        lower === base.toLowerCase() ||
        lower === `${base.toLowerCase()}.ts` ||
        lower === `${base.toLowerCase()}.tsx` ||
        lower === `${base.toLowerCase()}.js` ||
        lower === `${base.toLowerCase()}.jsx`
      );
    });
    if (ci) {
      return { ok: false, kind: "case", expected: base, actual: ci, resolved: null };
    }
  }

  return { ok: false, kind: "missing", expected: absBase, actual: null, resolved: null };
}

const importRe = /(?:from\s+|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/g;
const files = walk(root);
const mismatches = [];
const missing = [];
let checked = 0;

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(importRe)) {
    const spec = match[1];
    const abs = resolveImport(file, spec);
    if (!abs) continue;
    checked += 1;
    const result = existsExact(abs);
    if (result.ok) continue;
    const item = {
      file: path.relative(root, file).replaceAll("\\", "/"),
      import: spec,
      expected: result.expected,
      actualOnDisk: result.actual,
    };
    if (result.kind === "case") mismatches.push(item);
    else missing.push(item);
  }
}

console.log(`Checked local imports: ${checked}`);
console.log(`CASE MISMATCHES: ${mismatches.length}`);
for (const x of mismatches) console.log(JSON.stringify(x));
console.log(`MISSING MODULES: ${missing.length}`);
for (const x of missing) console.log(JSON.stringify(x));
process.exit(mismatches.length ? 1 : 0);
