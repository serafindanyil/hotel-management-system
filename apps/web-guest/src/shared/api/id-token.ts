type IdTokenSource = () => Promise<string | undefined> | undefined;

let idTokenSource: IdTokenSource | undefined;

const isServer = (): boolean => typeof window === 'undefined';

export const setIdTokenSource = (source?: IdTokenSource): void => {
  if (isServer()) throw new Error('The ID token source can only be set in the browser');
  idTokenSource = source;
};

export const getIdToken = async (): Promise<string | undefined> => {
  const token = await idTokenSource?.();
  return token || undefined;
};
