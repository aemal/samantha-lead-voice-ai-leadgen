'use client';

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface CommentEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitButtonText?: string;
  showCancelButton?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function CommentEditor({
  value,
  onChange,
  placeholder = "Add a comment...",
  onSubmit,
  onCancel,
  submitButtonText = "Comment",
  showCancelButton = false,
  disabled = false,
  className = ""
}: CommentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading as it's not needed for comments
        heading: false,
        // Configure other extensions as needed
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  const handleSubmit = useCallback(() => {
    if (onSubmit && editor && editor.getText().trim()) {
      onSubmit();
    }
  }, [onSubmit, editor]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="animate-pulse bg-gray-100 h-24 rounded-lg" />;
  }

  return (
    <div className={`border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`}>
      {/* Editor Toolbar */}
      <div className="border-b border-gray-200 px-3 py-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded text-sm font-semibold hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded text-sm italic hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`p-1.5 rounded text-sm hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Bullet List"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={`p-1.5 rounded text-sm hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      {/* Editor Content */}
      <div className="relative p-3" onKeyDown={handleKeyDown}>
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:min-h-[80px] [&_.ProseMirror]:text-gray-900 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:my-2 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ol]:my-2"
        />
        {editor.isEmpty && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <p className="text-gray-400 text-sm">{placeholder}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(onSubmit || onCancel) && (
        <div className="px-3 pb-3 flex items-center justify-end gap-2">
          {showCancelButton && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={disabled}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          {onSubmit && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || !editor.getText().trim()}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitButtonText}
            </button>
          )}
        </div>
      )}

      {/* Keyboard shortcut hint */}
      {onSubmit && (
        <div className="px-3 pb-2">
          <p className="text-xs text-gray-400">Press Ctrl+Enter to submit</p>
        </div>
      )}
    </div>
  );
}