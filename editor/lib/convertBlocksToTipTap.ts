import { Block, NoteMention } from '@/editor/schema/types';
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

        const listItemContent = parseBlockContent(currentBlock.content, currentBlock.mentions);

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
          attrs: { level },
          content: parseBlockContent(block.content, block.mentions),
        });
        break;
      }

      case 'text': {
        content.push({
          type: 'paragraph',
          content: parseBlockContent(block.content, block.mentions),
        });
        break;
      }

      case 'quote': {
        content.push({
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: parseBlockContent(block.content, block.mentions),
            },
          ],
        });
        break;
      }

      case 'code': {
        content.push({
          type: 'codeBlock',
          attrs: { language: 'javascript' }, // Default language; could be enhanced
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
        // For now, store table as a code block with table marker
        // A full table implementation would parse block.content as structured table data
        content.push({
          type: 'codeBlock',
          attrs: { language: 'table' },
          content: [{ type: 'text', text: block.content }],
        });
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
          content: parseBlockContent(block.content, block.mentions),
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
function parseBlockContent(content: string, mentions?: NoteMention[]): JSONContent[] {
  if (!content) return [];
  if (!mentions || mentions.length === 0) {
    // No mentions; just return text node
    return [{ type: 'text', text: content }];
  }

  const contentNodes: JSONContent[] = [];
  let lastEnd = 0;

  // Sort mentions by start position
  const sortedMentions = [...mentions].sort((a, b) => a.start - b.start);

  for (const mention of sortedMentions) {
    // Add text before mention
    if (mention.start > lastEnd) {
      contentNodes.push({
        type: 'text',
        text: content.slice(lastEnd, mention.start),
      });
    }

    // Add mention node
    contentNodes.push({
      type: 'mention',
      attrs: {
        id: mention.noteId,
        label: mention.title,
      },
    });

    lastEnd = mention.end;
  }

  // Add remaining text
  if (lastEnd < content.length) {
    contentNodes.push({
      type: 'text',
      text: content.slice(lastEnd),
    });
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
