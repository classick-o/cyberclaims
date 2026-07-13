import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { FAQ_EXTENSIONS, insertFaq } from '../extensions/Faq.js';

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
  { cmd: 'toggleCode', is: 'code', label: 'Code' },
];

export default function RichText({ value, onChange, onPickImage, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      // The CSS has always styled `p.is-editor-empty::before` to show a hint — but that
      // class comes from this extension, which was never installed. The placeholder had
      // simply never appeared.
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node }) => {
          if (node.type.name === 'faqQuestion') return 'The question a reader would actually ask…';
          if (node.type.name === 'heading') return 'Heading';
          return placeholder ?? 'Write the article…';
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

  const setLink = () => {
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('Link URL (leave empty to remove)', prev);
    if (url === null) return;
    if (url === '') return editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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

        <button
          type="button"
          className={`tt-btn${active('faq') ? ' on' : ''}`}
          title="A block of questions and answers. Renders as an accordion, and tells Google it is an FAQ."
          onClick={() => insertFaq(editor)}
        >
          Q&amp;A
        </button>
      </div>

      <div className="tt-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
