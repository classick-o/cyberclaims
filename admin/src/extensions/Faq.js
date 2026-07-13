import { Node, mergeAttributes } from '@tiptap/core';

// A questions-and-answers block for articles.
//
// Serialises to native <details>/<summary> — a real accordion with no JavaScript, that
// is keyboard-navigable and screen-reader-friendly out of the box, and whose contents
// Google indexes even while collapsed. No <div> anywhere: <details> accepts flow
// content directly after its <summary>, so the answer's paragraphs are its children.
//
//   <section class="faq">
//     <details class="faq-item">
//       <summary>Is Coinbase Wallet safe?</summary>
//       <p>It is non-custodial, which means…</p>
//     </details>
//   </section>
//
// In the EDITOR it is not a <details> at all — a collapsed accordion would hide the
// text you are trying to write. renderHTML() (what getHTML() serialises) and
// addNodeView() (what you type into) are deliberately different: the editor shows an
// always-open card, the page ships a collapsed accordion.
//
// The question is a real ProseMirror node, not an <input> inside a node view. Inputs
// inside node views fight ProseMirror for focus and key handling; a node just works.

export const Faq = Node.create({
  name: 'faq',
  group: 'block',
  content: 'faqItem+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'section.faq' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['section', mergeAttributes(HTMLAttributes, { class: 'faq' }), 0];
  },

  addNodeView() {
    return ({ editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'faq-block';

      const head = document.createElement('div');
      head.className = 'faq-block-head';
      head.contentEditable = 'false';
      head.textContent = 'Questions & answers';

      const items = document.createElement('div');
      items.className = 'faq-block-items';

      const foot = document.createElement('div');
      foot.className = 'faq-block-foot';
      foot.contentEditable = 'false';

      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'faq-add';
      add.textContent = '+ Add question';
      add.addEventListener('click', (event) => {
        event.preventDefault();
        const pos = typeof getPos === 'function' ? getPos() : null;
        if (pos == null) return;

        // Read the node fresh from state rather than closing over the one this view
        // was built with — it is a snapshot, and its size is stale the moment someone
        // types.
        const node = editor.state.doc.nodeAt(pos);
        if (!node) return;

        editor
          .chain()
          .focus()
          .insertContentAt(pos + node.nodeSize - 1, {
            type: 'faqItem',
            content: [{ type: 'faqQuestion' }, { type: 'paragraph' }],
          })
          .run();
      });

      foot.appendChild(add);
      dom.append(head, items, foot);

      return { dom, contentDOM: items };
    };
  },
});

export const FaqItem = Node.create({
  name: 'faqItem',
  // The question, then the answer as ordinary block content — so an answer can hold
  // paragraphs, lists, links, anything the rest of the article can.
  content: 'faqQuestion block+',
  defining: true,

  parseHTML() {
    return [{ tag: 'details.faq-item' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { class: 'faq-item' }), 0];
  },

  addNodeView() {
    return ({ editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'faq-item-edit';

      const content = document.createElement('div');
      content.className = 'faq-item-body';

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'faq-remove';
      remove.title = 'Remove this question';
      remove.setAttribute('aria-label', 'Remove this question');
      remove.textContent = '×';
      remove.contentEditable = 'false';
      remove.addEventListener('click', (event) => {
        event.preventDefault();
        const pos = typeof getPos === 'function' ? getPos() : null;
        if (pos == null) return;
        const node = editor.state.doc.nodeAt(pos);
        if (!node) return;
        editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
      });

      dom.append(content, remove);
      return { dom, contentDOM: content };
    };
  },
});

export const FaqQuestion = Node.create({
  name: 'faqQuestion',
  content: 'text*',
  marks: '', // a question is a question; bold and links inside a <summary> are noise
  defining: true,

  parseHTML() {
    return [{ tag: 'summary' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return () => {
      const dom = document.createElement('div');
      dom.className = 'faq-q';

      // contentDOM IS dom — one element, not a wrapper around an inner span.
      //
      // Tiptap's Placeholder decorates the node's OUTER element. With a separate inner
      // content div, the `is-empty` class and `data-placeholder` landed on the wrapper
      // while the text lived in the child, so the hint had nowhere sensible to draw and
      // the CSS never matched it.
      //
      // The "Q" badge is a ::after pseudo-element, not a child, so it costs contentDOM
      // nothing — ProseMirror still sees an element containing only the question text.
      return { dom, contentDOM: dom };
    };
  },
});

/** Toolbar command: drop in a Q&A block with one empty question. */
export const insertFaq = (editor) =>
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'faq',
      content: [
        {
          type: 'faqItem',
          content: [{ type: 'faqQuestion' }, { type: 'paragraph' }],
        },
      ],
    })
    .run();

export const FAQ_EXTENSIONS = [Faq, FaqItem, FaqQuestion];
