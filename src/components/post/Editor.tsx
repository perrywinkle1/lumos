"use client";

import * as React from "react";
import { useEditor, EditorContent, Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";

export interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function Editor({
  content = "",
  onChange,
  placeholder = "Start writing your guide here...",
  className,
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0 before:pointer-events-none",
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-[#ff6719] hover:underline cursor-pointer",
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-lg max-w-none focus:outline-none min-h-[400px]",
          "prose-headings:font-semibold prose-headings:text-gray-900",
          "prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4",
          "prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3",
          "prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2",
          "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4",
          "prose-a:text-[#ff6719] prose-a:no-underline hover:prose-a:underline",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600",
          "prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
          "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4",
          "prose-ul:list-disc prose-ul:pl-6",
          "prose-ol:list-decimal prose-ol:pl-6",
          "prose-li:my-1"
        ),
      },
    },
  });

  return (
    <div className={cn("relative", className)}>
      <EditorToolbar editor={editor} />
      <div className="mt-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Export hook for external access to editor instance
export function useEditorInstance() {
  const [editor, setEditor] = React.useState<TiptapEditor | null>(null);
  return { editor, setEditor };
}
