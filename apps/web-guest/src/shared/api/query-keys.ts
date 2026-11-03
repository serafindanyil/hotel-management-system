export const queryKeys = {
  endpoint: (operation: string, input?: unknown) => [operation, input] as const,
};
