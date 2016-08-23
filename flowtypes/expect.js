type expectObject<T> = { // eslint-disable-line
  toEqual: (obj: T) => void
}

declare module 'expect' {
  declare function exports<T>(obj: T): expectObject<T>
}
