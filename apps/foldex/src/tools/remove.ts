import { loadIndex, saveIndex, removeBookmarkFile } from "../store";

export async function removeBookmark(
  urlOrId: string,
): Promise<{ removed: boolean; title?: string }> {
  const index = await loadIndex();

  const entry = Object.entries(index.bookmarks).find(
    ([, bm]) => bm.id === urlOrId || bm.url === urlOrId,
  );

  if (!entry) {
    return { removed: false };
  }

  const [id, bookmark] = entry;
  const title = bookmark.title;

  delete index.bookmarks[id];
  await saveIndex(index);
  await removeBookmarkFile(id);

  return { removed: true, title };
}
