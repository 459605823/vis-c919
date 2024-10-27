import type {Ref} from 'vue';

export function useScroll(scrollRef: Ref<HTMLElement | undefined>) {
  let ani: Animation | undefined;
  // 暂停滑动
  const pauseScroll = () => {
    ani?.pause();
  };
  // 开始滑动
  const resumeScroll = () => {
    ani?.play();
  };
  // 取消滑动
  const cancelScroll = () => {
    ani?.cancel();
  };
  const initScroll = (length: number, speed: number) => {
    if (!scrollRef.value)
      return;
    cancelScroll();
    ani = undefined;
    const scrollRefDom = scrollRef.value;
    const scrollRefHeight = scrollRefDom.clientHeight;
    const scrollWrapRefHeight = scrollRefDom.parentElement!.clientHeight;
    if (scrollRefHeight <= scrollWrapRefHeight)
      return;
    ani = scrollRefDom.animate(
      [{transform: 'translateY(0%)'}, {transform: 'translateY(-50%)'}],
      {
        duration: (length * 1000) / speed,
        iterations: Infinity,
      },
    );
  };

  const dispose = () => {
    cancelScroll();
    ani = undefined;
  };

  return {
    initScroll,
    pauseScroll,
    resumeScroll,
    cancelScroll,
    dispose,
  };
}
