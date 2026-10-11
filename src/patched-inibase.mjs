// A transparent, unreleased experiment. Never changes the installed baseline.
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
export async function patchedInibase() {
	const root = resolve(".work/inibase-patched-3.6.0");
	await mkdir(root, { recursive: true });
	await cp(resolve("node_modules/inibase"), root, { recursive: true });
	const file = join(root, "dist/file.js");
	const original = await readFile(file, "utf8");
	const start = original.indexOf("export const append = async");
	const end = original.indexOf("export const prepend = async", start);
	if (start < 0 || end < 0) throw new Error("Patch anchor not found");
	let append = original.slice(start, end);
	const commandStart = append.indexOf(
		"                const escapedFileTempPath = escapeShellPath(fileTempPath);",
	);
	const commandEnd = append.indexOf("\n            }", commandStart);
	if (
		commandStart < 0 ||
		commandEnd < 0 ||
		!append.slice(commandStart, commandEnd).includes("echo")
	)
		throw new Error("Unexpected iniBase append implementation");
	append =
		append.slice(0, commandStart) +
		`                await appendFile(fileTempPath, await gzip(\`\${Array.isArray(data) ? data.join("\\n") : data}\\n\`));` +
		append.slice(commandEnd);
	append = append.replace(
		"    catch {\n        return [fileTempPath, null];\n    }",
		"    catch (error) {\n        throw error;\n    }",
	);
	const patched = original.slice(0, start) + append + original.slice(end);
	await writeFile(file, patched);
	const patchHash = createHash("sha256").update(patched).digest("hex");
	const { default: Inibase } = await import(
		pathToFileURL(join(root, "dist/index.js")).href
	);
	return { Inibase, patchHash };
}
