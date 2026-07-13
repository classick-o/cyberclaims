import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { FAQ_EXTENSIONS, insertFaq, hasFaq } from '../extensions/Faq.js';
import { useDialog } from './Dialog.jsx';

// WYSIWYG, not Markdown.
//
// Markdown is more portable and I'd pick it for a developer. The person writing these
// articles is a COO, and asking her to remember that `##` means heading is how a CMS
// ends up unused. The output is HTML, sanitised server-side against a strict allowlist
// on write — so "the editor emits HTML" is not the same as "the database trusts it".

const TOOLBAR = [
  { cmd: 'toggleBold', is: 'bold', label: 'B', style: { fontWeight: 800 } },
  { cmd: 'toggleItalic', is: 'italic', label: 'I', style: { fontStyle: 'italic' } },
  { cmd: 'toggleStrike', is: 'strike', label: 'S', style: { textDecoration: 'line-through' } },
  { sep: true },
  { cmd: 'toggleHeading', args: { level: 2 }, is: ['heading', { level: 2 }], label: 'H2' },
  { cmd: 'toggleHeading', args: { level: 3 }, is: ['heading', { level: 3 }], label: 'H3' },
  { sep: true },
  { cmd: 'toggleBulletList', is: 'bulletList', label: '• List' },
  { cmd: 'toggleOrderedList', is: 'orderedList', label: '1. List' },
  { cmd: 'toggleBlockquote', is: 'blockquote', label: 'Quote' },
];

export default function RichText({ value, onChange, onPickImage, placeholder }) {
  const [ask, dialog] = useDialog();

  const editor = useEditor({
    extensions: [
      // code and codeBlock are switched off outright, not just hidden from the toolbar
      // — leaving the extensions loaded would keep Ctrl+E and the ``` shortcut alive,
      // and an editor who hit one by accident would have no button to undo it with.
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false }),
      // The CSS has always styled `.is-editor-empty::before` to show a hint — but that
      // class comes from this extension, which was never installed. The placeholder had
      // simply never appeared.
      //
      // showOnlyCurrent: false so the Q and A hints are visible before you click into
      // them — they read as fields, and an empty field with no hint is just a gap. But
      // that means EVERY empty node would get a placeholder, so anything without a
      // useful hint returns '' and draws nothing.
      Placeholder.configure({
        includeChildren: true,
        showOnlyCurrent: false,
        placeholder: ({ node, editor }) => {
          if (node.type.name === 'faqQuestion') {
            return 'The question a reader would actually ask…';
          }

          // Only the very first block gets the article hint. Otherwise every empty
          // paragraph in a half-written article shouts "Write the article…" at you.
          if (editor.state.doc.firstChild === node) return placeholder ?? 'Write the article…';

          // Everything else draws nothing — except the Q&A answer, whose hint comes
          // from CSS. The obvious way to do it here would be to resolve `pos` and check
          // whether the parent is a faqItem, but the decoration is computed against the
          // INCOMING doc while `editor.state.doc` is still the previous one, so that
          // lookup resolves against the wrong tree mid-transaction. The stylesheet
          // already knows the shape (`.faq-q + *`); let it say so.
          return '';
        },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
      ...FAQ_EXTENSIONS,
    ],
    content: value ?? '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Switching locale tabs swaps the whole document under the same editor instance.
  // Without this the editor keeps showing the previous language's body. The guard
  // matters: setContent on every render would fight the user's cursor on each keystroke.
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) return null;

  const active = (is) => (Array.isArray(is) ? editor.isActive(...is) : editor.isActive(is));

  const setLink = async () => {
    const prev = editor.getAttributes('link').href ?? '';

    const url = await ask({
      title: prev ? 'Edit link' : 'Add a link',
      label: 'Link URL',
      message: 'Leave it empty to remove the link.',
      defaultValue: prev,
      placeholder: 'https://example.com',
      confirmLabel: prev ? 'Update' : 'Add link',
    });

    if (url === null) return; // cancelled
    if (url.trim() === '') return editor.chain().focus().unsetLink().run();

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div>
      <div className="tt-toolbar">
        {TOOLBAR.map((item, i) =>
          item.sep ? (
            <div key={i} className="tt-sep" />
          ) : (
            <button
              key={i}
              type="button"
              className={`tt-btn${active(item.is) ? ' on' : ''}`}
              style={item.style}
              title={item.label}
              onClick={() => editor.chain().focus()[item.cmd](item.args).run()}
            >
              {item.label}
            </button>
          )
        )}

        <div className="tt-sep" />

        <button
          type="button"
          className={`tt-btn${active('link') ? ' on' : ''}`}
          onClick={setLink}
        >
          Link
        </button>
        <button
          type="button"
          className="tt-btn"
          onClick={() =>
            onPickImage((media) =>
              editor.chain().focus().setImage({ src: media.path, alt: media.alt ?? '' }).run()
            )
          }
        >
          Image
        </button>

        <div className="tt-sep" />

        {/* One per article. The button stays clickable once the block exists — it takes
            you to it rather than adding a second — but it reads as spent, so you can see
            at a glance that this article already has its Q&A section. */}
        <button
          type="button"
          className={`tt-btn${active('faq') ? ' on' : ''}${hasFaq(editor) ? ' spent' : ''}`}
          title={
            hasFaq(editor)
              ? 'This article already has its Q&A section — an article gets one. Click to jump to it.'
              : 'A block of questions and answers. Renders as an accordion, and tells Google it is an FAQ.'
          }
          onClick={() => insertFaq(editor)}
        >
          Q&amp;A
        </button>
      </div>

      <div className="tt-editor">
        <EditorContent editor={editor} />
      </div>

      {dialog}
    </div>
  );
}
