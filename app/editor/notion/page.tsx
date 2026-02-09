// 'use client';

// import { NotionEditor } from '@/editor/components/tiptap-templates/notion-like/notion-like-editor';


// export default function NotionEditorPage() {
//   return (
//     <div className="notion-editor-page">
//       <NotionEditor
//         room="notion-demo-room"
//         placeholder="Start writing your notion-like content..."
//       />
//     </div>
//   );
// }

import { NotionEditor} from "@/editor/components/tiptap-templates/notion-like/notion-like-editor"

export default function Page() {
  return <NotionEditor 
  room="notion-demo-room"
  placeholder="Start writing your notion-like content..."
/>
}
