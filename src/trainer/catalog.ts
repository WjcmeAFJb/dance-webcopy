// Auto-discovers every lesson under `./lessons/**/*.lesson.ts` (Vite's
// `import.meta.glob`) and groups them by folder.

import type { Lesson, LessonFolder } from "./types";
import { FOLDERS } from "./types";

// `import.meta.glob` is provided by Vite at build/dev time. Cast through
// `unknown` so the TypeScript compiler doesn't complain about the missing
// global type.
const modules = (import.meta as unknown as {
  glob: <T>(pattern: string, opts: { eager: true }) => Record<string, T>;
}).glob<{ lesson: Lesson }>("./lessons/**/*.lesson.ts", { eager: true });

const all: Lesson[] = [];

for (const [path, mod] of Object.entries(modules)) {
  const lesson = (mod as { lesson?: Lesson })?.lesson;
  if (!lesson) continue;
  if (!lesson.folder || !lesson.id) {
    console.warn(`[trainer] lesson missing id/folder: ${path}`);
    continue;
  }
  all.push(lesson);
}

all.sort((a, b) => {
  if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
  return a.id.localeCompare(b.id);
});

export const ALL_LESSONS: readonly Lesson[] = all;

export function lessonsByFolder(): Map<LessonFolder, Lesson[]> {
  const map = new Map<LessonFolder, Lesson[]>();
  for (const f of FOLDERS) map.set(f.id, []);
  for (const l of all) {
    map.get(l.folder)?.push(l);
  }
  return map;
}

export function lessonById(id: string): Lesson | undefined {
  return all.find((l) => l.id === id);
}
