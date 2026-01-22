export function toast() {
  // minimal toast stub
  return {
    open: () => {},
    close: () => {},
  } as const;
}

export function useToast() {
  return {
    toasts: [],
    open: () => {},
    close: () => {},
  } as const;
}

export default useToast;
