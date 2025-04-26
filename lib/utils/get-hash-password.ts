import { genSaltSync, hashSync } from 'bcrypt-ts';

import { generateUUID } from './uuid';

export function getHashPassword(password: string) {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}

export function getFakeHashPassword() {
  return getHashPassword(generateUUID());
}
