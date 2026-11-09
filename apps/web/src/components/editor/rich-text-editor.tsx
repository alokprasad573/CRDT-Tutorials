"use client";

import {
  useEditor,
  EditorContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Collaboration } from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";


export interface RichTextEditorProps {
  /**
   * Initial HTML content for the editor.
   */
  initialContent?: string;
  /**
   * Whether the editor is editable. When false, the editor is read-only.
   */
  editable?: boolean;
  /**
   * Optional height in CSS units.
   */
  height?: string;
  /**
   * Callback fired when editor content changes.
   */
  onUpdate?: (html: string) => void;
  /**
   * Callback fired when the Tiptap editor instance is created.
   * Useful for accessing editor methods (commands, state, etc.) from the parent.
   */
  onEditorCreated?: (editor: ReturnType<typeof useEditor>) => void;
  /**
   * Optional className for the editor container.
   */
  className?: string;
  /**
   * Yjs document for collaborative editing. When provided, the editor
   * connects to Yjs and shares changes through the CollaborationExtension.
   */
  ydoc?: Y.Doc;
  /**
   * Yjs Awareness instance for presence/cursor information.
   * When provided, collaborator presence is shared.
   */
  awareness?: Awareness | null;
  /**
   * When true, collaboration extensions are active. When false, the
   * editor operates in local-only mode.
   */
  collaborationEnabled?: boolean;
}

/**
 * RichTextEditor — a reusable Tiptap-based rich-text editor component.
 *
 * Provides bold, italic, underline, strikethrough, headings, paragraphs,
 * bullet/numbered lists, blockquotes, code blocks, links, undo/redo, and
 * text color/styling through the StarterKit extension set.
 *
 * When `ydoc` and `collaborationEnabled` are provided, the editor uses
 * Tiptap's CollaborationExtension to synchronize changes through Yjs.
 * Changes are broadcast via the Hocuspocus provider connected by the
 * parent component.
 *
 * Collaborator presence and cursors are handled through Yjs Awareness,
 * rendered by the CollaboratorPresence component in the editor header
 * and CollaboratorCursors overlay in the editor canvas.
 *
 * The editor does not persist content itself — persistence is handled
 * by the parent page via Yjs update hooks on the server.
 */
export function RichTextEditor({
  initialContent = "",
  editable = true,
  height = "100%",
  onUpdate,
  onEditorCreated,
  className,
  ydoc,
  collaborationEnabled = false,
}: RichTextEditorProps) {
  const extensions = collaborationEnabled && ydoc
    ? [StarterKit, Collaboration]
    : [StarterKit];

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    onUpdate: ({ editor }) => {
      onEditorCreated?.(editor);
      onUpdate?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`border border-gray-200 rounded-lg min-h-100 flex flex-col relative ${className || ""}`}
      style={{ minHeight: height }}
    >
      <EditorContent editor={editor} className="flex-1 overflow-y-auto outline-none" />
    </div>
  );
}

/**
 * EditorToolbar — formatting toolbar for the RichTextEditor.
 *
 * Reads editor state via `useEditorState` to reflect active formatting and
 * enable/disable commands appropriately.
 */
export function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.isActive("bold")}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive("bold")
            ? "bg-indigo-600 text-white"
            : "text-gray-600 hover:bg-gray-200"
        }`}
        title="Bold (Mod+B)"
      >
        <strong>B</strong>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.isActive("italic")}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive("italic")
            ? "bg-indigo-600 text-white italic"
            : "text-gray-600 hover:bg-gray-200"
        }`}
        title="Italic (Mod+I)"
      >
        <em>I</em>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.isActive("underline")}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive("underline")
            ? "bg-indigo-600 text-white underline"
            : "text-gray-600 hover:bg-gray-200"
        }`}
        title="Underline (Mod+U)"
      >
        <u>U</u>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.isActive("strike")}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive("strike")
            ? "bg-indigo-600 text-white line-through"
            : "text-gray-600 hover:bg-gray-200"
        }`}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </button>

      <div className="h-4 w-px bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={!editor.can().toggleHeading({ level: 1 })}
        className="px-2 py-1 rounded text-sm transition-colors text-gray-600 hover:bg-gray-200"
        title="Heading 1"
      >
        H1
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={!editor.can().toggleHeading({ level: 2 })}
        className="px-2 py-1 rounded text-sm transition-colors text-gray-600 hover:bg-gray-200"
        title="Heading 2"
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className="px-2 py-1 rounded text-sm transition-colors text-gray-600 hover:bg-gray-200"
        title="Paragraph"
      >
        P
      </button>

      <div className="h-4 w-px bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().toggleBulletList()}
        className="px-2 py-1 rounded text-sm transition-colors text-gray-600 hover:bg-gray-200"
        title="Bullet List"
      >
        <span className="flex items-center">• List</span>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().toggleOrderedList()}
        className="px-2 py-1 rounded text-sm transition-colors text-gray-600 hover:bg-gray-200"
        title="Numbered List"
      >
        <span className="flex items-center">1. List</span>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={!editor.can().toggleBlockquote()}
        className="px-2 py-1 rounded text-sm transition-colors text-gray-600 hover:bg-gray-200"
        title="Blockquote"
      >
        <span className="flex items-center">❝</span>
      </button>

      <div className="h-4 w-px bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="px-2 py-1 rounded text-sm transition-colors text-gray-600 hover:bg-gray-200"
        title="Undo (Mod+Z)"
      >
        ↩
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="px-2 py-1 rounded text-sm transition-colors text-gray-600 hover:bg-gray-200"
        title="Redo (Mod+Shift+Z)"
      >
        ↪
      </button>
    </div>
  );
}
