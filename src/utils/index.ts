/* eslint-disable @typescript-eslint/no-unused-vars */
export function removePassword<T extends { password?: any }>(
  user: T,
): Omit<T, 'password'> {
  const { password, ...rest } = user;
  return rest;
}
