// components/ui/use-toast.ts
export function useToast() {
  const toasts: any[] = [];

  function toast(message: string) {
    alert(message);
  }

  return { toast, toasts };
}
