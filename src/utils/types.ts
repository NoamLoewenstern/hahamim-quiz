export type ReverseKeyValue<T extends { [key: string]: keyof any }> = {
  [P in keyof T as T[P]]: P;
};
