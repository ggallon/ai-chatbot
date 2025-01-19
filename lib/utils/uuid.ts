/**
 * Generate a UUID v4 based on random numbers.
 *
 * @return The generate UUID
 */
export function generateUUID() {
  if (typeof self.crypto.randomUUID === typeof Function) {
    return self.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
