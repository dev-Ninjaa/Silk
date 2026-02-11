import { Block, InlineEmoji, NoteMention } from '@/editor/schema/types';
import { JSONContent } from '@tiptap/core';

/**
 * Converts an array of Block objects (PulmNotes format) to TipTap JSONContent format.
 *
 * Handles:
 * - Headings (h1, h2, h3) → TipTap heading nodes
 * - Paragraphs (text) → TipTap paragraph nodes
 * - Lists (bullet-list, numbered-list, todo) → TipTap list nodes (grouped by consecutive type)
 * - Code blocks → TipTap codeBlock nodes
 * - Blockquotes → TipTap blockquote nodes
 * - Dividers → TipTap horizontalRule nodes
 * - Mentions → Inline mention nodes with noteId and title attributes
 * - Tables → TipTap table structure
 *
 * Returns a TipTap document (JSONContent) ready for editor initialization.
 */
export function convertBlocksToTipTap(blocks: Block[]): JSONContent {
  if (!blocks || blocks.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    };
  }

  const content: JSONContent[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === 'bullet-list' || block.type === 'numbered-list' || block.type === 'todo') {
      // Group consecutive list items of the same type
      const listType = getLipTapListType(block.type);
      const listItems: JSONContent[] = [];
      const startIndex = i;

      while (i < blocks.length) {
        const currentBlock = blocks[i];
        if (currentBlock.type !== block.type) break;

        const listItemContent = parseBlockContent(currentBlock.content, currentBlock.mentions, currentBlock.marks, currentBlock.links, currentBlock.emojis);

        if (block.type === 'todo') {
          listItems.push({
            type: 'taskItem',
            attrs: { checked: currentBlock.checked ?? false },
            content: [{ type: 'paragraph', content: listItemContent }],
          });
        } else {
          listItems.push({
            type: 'listItem',
            content: [{ type: 'paragraph', content: listItemContent }],
          });
        }

        i++;
      }

      const listNode: JSONContent = {
        type: listType,
        content: listItems,
      };

      if (block.type === 'todo') {
        // Wrap taskItems in taskList
        content.push({
          type: 'taskList',
          content: listItems,
        });
      } else {
        content.push(listNode);
      }

      continue;
    }

    // Handle other block types
    switch (block.type) {
      case 'h1':
      case 'h2':
      case 'h3': {
        const level = parseInt(block.type[1]);
        content.push({
          type: 'heading',
          attrs: { level, textAlign: block.textAlign },
          content: parseBlockContent(block.content, block.mentions, block.marks, block.links, block.emojis),
        });
        break;
      }

      case 'text': {
        content.push({
          type: 'paragraph',
          attrs: { textAlign: block.textAlign },
          content: parseBlockContent(block.content, block.mentions, block.marks, block.links, block.emojis),
        });
        break;
      }

      case 'quote': {
        content.push({
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: block.textAlign },
              content: parseBlockContent(block.content, block.mentions, block.marks, block.links, block.emojis),
            },
          ],
        });
        break;
      }

      case 'code': {
        // Detect fenced code language if present: ```lang\n...\n```
        let language = 'javascript';
        const match = typeof block.content === 'string' ? block.content.match(/^```(\w+)/) : null;
        if (match) language = match[1] || language;

        content.push({
          type: 'codeBlock',
          attrs: { language },
          content: [{ type: 'text', text: block.content }],
        });
        break;
      }

      case 'divider': {
        content.push({
          type: 'horizontalRule',
        });
        break;
      }

      case 'table': {
        // Parse table structure from JSON
        try {
          const tableData = JSON.parse(block.content);
          const tableNode = buildTableNode(tableData);
          if (tableNode) {
            content.push(tableNode);
          }
        } catch (err) {
          // Fallback for legacy string-based table format
          console.warn('[Table Conversion] Failed to parse table JSON, falling back to text', err);
          content.push({
            type: 'paragraph',
            content: parseBlockContent(block.content, block.mentions, block.marks, block.links, block.emojis),
          });
        }
        break;
      }

      case 'image': {
        if (block.media?.src) {
          content.push({
            type: 'image',
            attrs: {
              src: block.media.src,
              alt: block.media.alt || '',
              title: block.media.caption || '',
            },
          });
        }
        break;
      }

      case 'video': {
        if (block.media?.src) {
          content.push({
            type: 'video',
            attrs: {
              src: block.media.src,
              alt: block.media.alt || '',
              title: block.media.caption || '',
            },
          });
        }
        break;
      }

      case 'audio': {
        if (block.media?.src) {
          content.push({
            type: 'audio',
            attrs: {
              src: block.media.src,
              alt: block.media.alt || '',
              title: block.media.caption || '',
            },
          });
        }
        break;
      }

      case 'asset': {
        // Convert asset block to asset node
        if (block.media?.assetId) {
          content.push({
            type: 'asset',
            attrs: {
              assetId: block.media.assetId,
              type: block.media.type || 'image',
              src: block.media.src || '',
              alt: block.media.alt || '',
              title: block.media.caption || '',
            },
          });
        }
        break;
      }

      default: {
        // Fallback: any unknown type becomes a paragraph
        content.push({
          type: 'paragraph',
          content: parseBlockContent(block.content, block.mentions, block.marks, block.links, block.emojis),
        });
      }
    }

    i++;
  }

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph', content: [] }],
  };
}

/**
 * Parse block content string with embedded mentions into TipTap content nodes.
 * Mentions are marked with @title and have indices tracked in the mentions array.
 */
function parseBlockContent(
  content: string,
  mentions?: NoteMention[],
  marks?: any[],
  links?: any[],
  emojis?: InlineEmoji[]
): JSONContent[] {
  if (!content) return [];

  const contentNodes: JSONContent[] = [];

  // Build breakpoints from mentions, marks, and links
  const breaks = new Set<number>();
  breaks.add(0);
  breaks.add(content.length);

  (mentions || []).forEach((m) => { breaks.add(m.start); breaks.add(m.end); });
  (marks || []).forEach((m) => { breaks.add(m.start); breaks.add(m.end); });
  (links || []).forEach((l) => { breaks.add(l.start); breaks.add(l.end); });
  (emojis || []).forEach((e) => { breaks.add(e.start); breaks.add(e.end); });

  const points = Array.from(breaks).sort((a, b) => a - b);

  // Helper to find a mention covering a range
  const findMention = (start: number, end: number) => {
    return (mentions || []).find((m) => m.start <= start && m.end >= end);
  };

  // Helper to find an emoji covering a range
  const findEmoji = (start: number, end: number) => {
    return (emojis || []).find((e) => e.start <= start && e.end >= end);
  };

  // Helper to get marks covering a range
  const getMarksForRange = (start: number, end: number) => {
    const active = (marks || []).filter((m) => m.start <= start && m.end >= end);
    return active.map((m) => ({ type: m.type, attrs: m.attrs }));
  };

  // Helper to get link covering range
  const getLinkForRange = (start: number, end: number) => {
    return (links || []).find((l) => l.start <= start && l.end >= end);
  }

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    if (start === end) continue;

    const mention = findMention(start, end);
    if (mention) {
      contentNodes.push({ type: 'mention', attrs: { id: mention.noteId, label: mention.title } });
      continue;
    }

    // Emoji nodes were disappearing because custom emoji attrs were lost in text-only serialization.
    // We reconstruct emoji nodes from stored inline emoji metadata to keep round-trip integrity.
    const emoji = findEmoji(start, end);
    if (emoji && emoji.attrs && Object.keys(emoji.attrs).length > 0) {
      // Preserve emoji nodes instead of flattening to text (prevents custom emoji loss).
      contentNodes.push({ type: 'emoji', attrs: { ...emoji.attrs } });
      continue;
    }

    let slice = content.slice(start, end);
    // Replace emoji shortcodes like :smile: with their unicode equivalent where possible
    try {
      const { replaceShortcodesWithEmoji } = require('./emojiMap')
      slice = replaceShortcodesWithEmoji(slice)
    } catch (err) {
      // ignore if module cannot be imported
    }

    const node: any = { type: 'text', text: slice };

    const activeMarks = getMarksForRange(start, end);
    const link = getLinkForRange(start, end);

    const appliedMarks: any[] = [];
    if (link) appliedMarks.push({ type: 'link', attrs: { href: link.href, title: link.title } });
    for (const m of activeMarks) appliedMarks.push({ type: m.type, attrs: m.attrs || {} });

    if (appliedMarks.length > 0) node.marks = appliedMarks;

    contentNodes.push(node);
  }

  return contentNodes.length > 0 ? contentNodes : [];
}

/**
 * Helper to convert PulmNotes list type to TipTap list type.
 */
function getLipTapListType(
  blockType: 'bullet-list' | 'numbered-list' | 'todo'
): 'bulletList' | 'orderedList' | 'taskList' {
  if (blockType === 'bullet-list') return 'bulletList';
  if (blockType === 'numbered-list') return 'orderedList';
  return 'taskList';
}

/**
 * Build a proper TipTap table node from stored table data.
 */
function buildTableNode(tableData: any): JSONContent | null {
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return null;
  }

  const rows: JSONContent[] = [];

  tableData.rows.forEach((row: any, rowIndex: number) => {
    const cells: JSONContent[] = [];

    row.cells?.forEach((cellContent: string, cellIndex: number) => {
      const isHeader = tableData.headerRowIndex === rowIndex;
      const cellType = isHeader ? 'tableHeader' : 'tableCell';

      cells.push({
        type: cellType,
        content: [{
          type: 'paragraph',
          content: cellContent ? [{ type: 'text', text: cellContent }] : [],
        }],
      });
    });

    rows.push({
      type: 'tableRow',
      content: cells,
    });
  });

  return {
    type: 'table',
    content: rows,
  };
}
