// Smooth open/close for the Q&A blocks.
//
// <details> cannot be animated as it ships. The browser flips the content between
// hidden and shown with nothing in between, and there is nothing to transition anyway:
// the answer is a run of sibling elements, not a box, and only a box has a height.
//
// So we build one - at runtime, not in the stored HTML. The database keeps clean
// semantic <details>/<summary>, and if this script never runs the block is still a
// working native accordion. The animation is an enhancement, not a dependency.

const DURATION = 320;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'; // --ease-out-brand

export function initFaq(root: ParentNode = document): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tells the stylesheet that JS is driving. Open/closed visuals then follow .is-open
  // rather than [open] - see below for why they cannot follow [open].
  root.querySelectorAll<HTMLElement>('.faq').forEach((section) => section.classList.add('js'));

  root.querySelectorAll<HTMLDetailsElement>('details.faq-item').forEach((item) => {
    if (item.dataset.faqReady) return;
    item.dataset.faqReady = '1';

    const summary = item.querySelector(':scope > summary');
    if (!summary) return;

    // TWO boxes, not one.
    //
    // The outer box is the one being animated, and it must carry NO padding. With
    // box-sizing: border-box a box cannot render shorter than its own padding - so
    // `height: 0` on a box with 1.5rem of bottom padding stops dead at 24px, and those
    // last 24px only vanish later, when `open` is finally removed. That is the
    // two-stage close: it slides most of the way shut, pauses, then jumps.
    //
    // The padding lives on the inner box, which nothing animates.
    const box = document.createElement('div');
    box.className = 'faq-a';
    const inner = document.createElement('div');
    inner.className = 'faq-a-inner';
    while (summary.nextSibling) inner.appendChild(summary.nextSibling);
    box.appendChild(inner);
    item.appendChild(box);

    // The visual state has to be flipped by hand either way, or the chevron never turns.
    const paint = (open: boolean) => item.classList.toggle('is-open', open);

    if (reduce) {
      summary.addEventListener('click', () => requestAnimationFrame(() => paint(item.open)));
      return;
    }

    let animation: Animation | null = null;

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      animation?.cancel();

      const closing = item.open;

      // The content must be laid out before it can be measured, so open first.
      if (!closing) item.open = true;

      // Flip the visuals NOW, not when the animation ends.
      //
      // Hanging them off [open] meant the card's colour and the chevron only moved
      // once the height had finished collapsing - because [open] has to stay set for
      // the whole closing animation, or the browser hides the content we are animating.
      // The close read as two separate movements instead of one.
      paint(!closing);

      const height = inner.offsetHeight;

      animation = box.animate(
        {
          height: closing ? [`${height}px`, '0px'] : ['0px', `${height}px`],
          opacity: closing ? [1, 0] : [0, 1],
        },
        {
          duration: DURATION,
          easing: EASING,
          // Hold the collapsed frame until `open` is actually removed, so there is no
          // flash of full-height content on the last frame.
          fill: closing ? 'forwards' : 'none',
        }
      );

      animation.onfinish = () => {
        if (closing) {
          item.open = false;
          animation?.cancel(); // release the forwards fill; the box is hidden now anyway
        }
        animation = null;
      };
    });
  });
}
