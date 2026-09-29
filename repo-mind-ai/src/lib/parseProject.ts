import JSZip from "jszip";
import type { ParsedSourceFile } from "./architecture";

const sourceExtension = /\.(tsx?|jsx?)$/i;
const ignoredPathSegment = /(^|\/)(node_modules|\.next|dist|build)(\/|$)/;

export async function parseProjectFiles(files: File[]): Promise<ParsedSourceFile[]> {
  const zipFile = files.find((file) => file.name.toLowerCase().endsWith(".zip"));
  let sourceFiles: ParsedSourceFile[];

  if (zipFile) {
    const archive = await JSZip.loadAsync(zipFile);
    const entries = Object.values(archive.files).filter(
      (entry) => !entry.dir && sourceExtension.test(entry.name) && !ignoredPathSegment.test(entry.name),
    );
    sourceFiles = await Promise.all(
      entries.map(async (entry) => ({ path: entry.name, content: await entry.async("string") })),
    );
  } else {
    sourceFiles = await Promise.all(
      files
        .filter((file) => {
          const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
          return sourceExtension.test(path) && !ignoredPathSegment.test(path);
        })
        .map(async (file) => ({
          path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
          content: await file.text(),
        })),
    );
  }

  if (sourceFiles.length === 0) {
    throw new Error("No parseable JS/TS files found in this project.");
  }

  return sourceFiles;
}