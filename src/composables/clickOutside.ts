import type {Ref} from 'vue';

export function useClickOutside(elementRef: Ref<HTMLElement | null>, onClickOutside: (e: MouseEvent) => void) {
  const handler = (e: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(e.target as Node)) {
      onClickOutside(e);
    }
  };
  onMounted(() => {
    document.addEventListener('click', handler);
  });
  onUnmounted(() => {
    document.removeEventListener('click', handler);
  });
}
