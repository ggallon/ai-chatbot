export const MAX_TITLE_LENGTH = 40;

export function getFormatedChatTitle({ title }: { title: string }) {
  if (title.length > MAX_TITLE_LENGTH) {
    return `${title.toString().slice(0, MAX_TITLE_LENGTH)}...`;
  }
  return title;
}
