import { Block, BlockType, InlineEmoji, NoteMention } from '@/editor/schema/types';
import { JSONContent } from '@tiptap/core';
import { generateId } from '@/editor/core/utils';

/**
 * Converts TipTap JSONContent format back to an array of Block objects (PulmNotes format).
 *
 * Handles:
 * - TipTap heading nodes → PulmNotes h1, h2, h3 blocks
 * - TipTap paragraph nodes → PulmNotes text blocks
 * - TipTap bulletList/orderedList → PulmNotes bullet-list/numbered-list blocks
 * - TipTap taskList → PulmNotes todo blocks
 * - TipTap codeBlock → PulmNotes code blocks
 * - TipTap blockquote → PulmNotes quote blocks
 * - TipTap horizontalRule → PulmNotes divider blocks
 * - TipTap mention nodes → Inline mentions with noteId and title
 * - TipTap table → PulmNotes table blocks
 *
 * Returns an array of Block objects ready for persistence.
 */
export function convertTipTapToBlocks(content: JSONContent | undefined): Block[] {
  if (!content || !content.content || content.content.length === 0) {
    // Return a single empty text block
    return [
      {
        id: generateId(),
        type: 'text',
        content: '',
      },
    ];
  }

  const blocks: Block[] = [];

  for (const node of content.content) {
    const convertedBlocks = convertNode(node);
    blocks.push(...convertedBlocks);
  }

  // Ensure at least one block
  if (blocks.length === 0) {
    blocks.push({
      id: generateId(),
      type: 'text',
      content: '',
    });
  }

  return blocks;
}

/**
 * Convert a single TipTap node to one or more PulmNotes blocks.
 */
function convertNode(node: JSONContent): Block[] {
  const blocks: Block[] = [];

  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level || 1;
      const headingType = (`h${level}` as any) as BlockType;
      const meta = nodesToTextWithMeta(node.content);
      const mentions = extractMentions(node.content);

      blocks.push({
        id: generateId(),
        type: headingType,
        content: meta.text,
        mentions: mentions.length > 0 ? mentions : undefined,
        marks: meta.marks.length > 0 ? meta.marks : undefined,
        links: meta.links.length > 0 ? meta.links : undefined,
        emojis: meta.emojis.length > 0 ? meta.emojis : undefined,
        textAlign: node.attrs?.textAlign || node.attrs?.align || undefined,
      });
      break;
    }

    case 'paragraph': {
      const meta = nodesToTextWithMeta(node.content);
      const mentions = extractMentions(node.content);

      blocks.push({
        id: generateId(),
        type: 'text',
        content: meta.text,
        mentions: mentions.length > 0 ? mentions : undefined,
        marks: meta.marks.length > 0 ? meta.marks : undefined,
        links: meta.links.length > 0 ? meta.links : undefined,
        emojis: meta.emojis.length > 0 ? meta.emojis : undefined,
        textAlign: node.attrs?.textAlign || node.attrs?.align || undefined,
      });
      break;
    }

    case 'bulletList': {
      if (node.content) {
        for (const listItem of node.content) {
          if (listItem.type === 'listItem' && listItem.content) {
            // Extract text from paragraph inside listItem
            const paraNode = listItem.content.find((n) => n.type === 'paragraph');
            const meta = paraNode ? nodesToTextWithMeta(paraNode.content) : { text: '', marks: [], links: [], emojis: [] };
            const mentions = paraNode ? extractMentions(paraNode.content) : [];

            blocks.push({
              id: generateId(),
              type: 'bullet-list',
              content: meta.text,
              mentions: mentions.length > 0 ? mentions : undefined,
              marks: meta.marks.length > 0 ? meta.marks : undefined,
              links: meta.links.length > 0 ? meta.links : undefined,
              emojis: meta.emojis.length > 0 ? meta.emojis : undefined,
            });
          }
        }
      }
      break;
    }

    case 'orderedList': {
      if (node.content) {
        for (const listItem of node.content) {
          if (listItem.type === 'listItem' && listItem.content) {
            const paraNode = listItem.content.find((n) => n.type === 'paragraph');
            const meta = paraNode ? nodesToTextWithMeta(paraNode.content) : { text: '', marks: [], links: [], emojis: [] };
            const mentions = paraNode ? extractMentions(paraNode.content) : [];

            blocks.push({
              id: generateId(),
              type: 'numbered-list',
              content: meta.text,
              mentions: mentions.length > 0 ? mentions : undefined,
              marks: meta.marks.length > 0 ? meta.marks : undefined,
              links: meta.links.length > 0 ? meta.links : undefined,
              emojis: meta.emojis.length > 0 ? meta.emojis : undefined,
            });
          }
        }
      }
      break;
    }

    case 'taskList': {
      if (node.content) {
        for (const taskItem of node.content) {
          if (taskItem.type === 'taskItem' && taskItem.content) {
            const paraNode = taskItem.content.find((n) => n.type === 'paragraph');
            const meta = paraNode ? nodesToTextWithMeta(paraNode.content) : { text: '', marks: [], links: [], emojis: [] };
            const mentions = paraNode ? extractMentions(paraNode.content) : [];
            const checked = taskItem.attrs?.checked ?? false;

            blocks.push({
              id: generateId(),
              type: 'todo',
              content: meta.text,
              checked,
              mentions: mentions.length > 0 ? mentions : undefined,
              marks: meta.marks.length > 0 ? meta.marks : undefined,
              links: meta.links.length > 0 ? meta.links : undefined,
              emojis: meta.emojis.length > 0 ? meta.emojis : undefined,
            });
          }
        }
      }
      break;
    }

    case 'blockquote': {
      // Extract text from first paragraph in blockquote
      if (node.content) {
        const paraNode = node.content.find((n) => n.type === 'paragraph');
        const meta = paraNode ? nodesToTextWithMeta(paraNode.content) : { text: '', marks: [], links: [], emojis: [] };
        const mentions = paraNode ? extractMentions(paraNode.content) : [];

        blocks.push({
          id: generateId(),
          type: 'quote',
          content: meta.text,
          mentions: mentions.length > 0 ? mentions : undefined,
          emojis: meta.emojis.length > 0 ? meta.emojis : undefined,
        });
      }
      break;
    }

    case 'codeBlock': {
      // Check language attribute to detect if this is a table marker
      const language = node.attrs?.language;
      const content = nodesToText(node.content);

      // Handle old table format stored as codeBlock
      if (language === 'table') {
        // Convert old string format to new JSON format
        const tableData = convertLegacyTableFormat(content);
        blocks.push({
          id: generateId(),
          type: 'table',
          content: JSON.stringify(tableData),
        });
      } else {
        blocks.push({
          id: generateId(),
          type: 'code',
          content,
        });
      }
      break;
    }

    case 'horizontalRule': {
      blocks.push({
        id: generateId(),
        type: 'divider',
        content: '',
      });
      break;
    }

    case 'image': {
      blocks.push({
        id: generateId(),
        type: 'image',
        content: node.attrs?.alt || '',
        media: {
          type: 'image',
          src: node.attrs?.src || '',
          alt: node.attrs?.alt || '',
          caption: node.attrs?.title || '',
        },
      });
      break;
    }

    case 'video': {
      blocks.push({
        id: generateId(),
        type: 'video',
        content: node.attrs?.title || '',
        media: {
          type: 'video',
          src: node.attrs?.src || '',
          alt: node.attrs?.alt || '',
          caption: node.attrs?.title || '',
        },
      });
      break;
    }

    case 'audio': {
      blocks.push({
        id: generateId(),
        type: 'audio',
        content: node.attrs?.title || '',
        media: {
          type: 'audio',
          src: node.attrs?.src || '',
          alt: node.attrs?.alt || '',
          caption: node.attrs?.title || '',
        },
      });
      break;
    }

    case 'asset': {
      // Convert asset node to asset reference block
      const { assetId, type, alt, title, src } = node.attrs || {};
      blocks.push({
        id: generateId(),
        type: 'asset',
        content: `{{asset:${assetId}}}`,
        media: {
          type: type || 'image',
          src: src || `/assets/${assetId}`,
          alt: alt || '',
          caption: title || '',
          assetId,
        },
      });
      break;
    }

    case 'table': {
      // Convert table to structured JSON format for proper persistence
      const tableData = extractTableStructure(node);
      try {
        blocks.push({
          id: generateId(),
          type: 'table',
          content: JSON.stringify(tableData),
        });
      } catch (err) {
        console.error('[Table Conversion] Failed to serialize table data', err);
        // Fallback to string representation
        const tableContent = nodeTableToString(node);
        blocks.push({
          id: generateId(),
          type: 'table',
          content: tableContent,
        });
      }
      break;
    }

    case 'doc':
    case 'tableRow':
    case 'tableHeader':
    case 'tableCell': {
      // These are container nodes; process their content recursively
      if (node.content) {
        for (const childNode of node.content) {
          const childBlocks = convertNode(childNode);
          blocks.push(...childBlocks);
        }
      }
      break;
    }

    default: {
      // Unknown node type; try to extract text if present
      const content = nodesToText(node.content);
      if (content) {
        blocks.push({
          id: generateId(),
          type: 'text',
          content,
        });
      }
      break;
    }
  }

  return blocks;
}

/**
 * Extract plain text from an array of TipTap nodes, handling mentions and other inline elements.
 */
function nodesToTextWithMeta(nodes: JSONContent[] | undefined): { text: string; marks: any[]; links: any[]; emojis: InlineEmoji[] } {
  if (!nodes) return { text: '', marks: [], links: [], emojis: [] };

  let text = '';
  const marks: any[] = [];
  const links: any[] = [];
  const emojis: InlineEmoji[] = [];

  // Emoji nodes were disappearing because we only serialized inline text.
  // Custom emojis often omit unicode, so they were flattened to an empty string.
  // We preserve emoji attrs + positions to ensure round-trip integrity.
  const getEmojiDisplayText = (attrs?: Record<string, any>) => {
    if (!attrs) return '';
    if (typeof attrs.emoji === 'string' && attrs.emoji.length > 0) return attrs.emoji;
    if (typeof attrs.unicode === 'string' && attrs.unicode.length > 0) return attrs.unicode;
    if (Array.isArray(attrs.shortcodes) && attrs.shortcodes.length > 0) return attrs.shortcodes[0];
    if (typeof attrs.shortcode === 'string' && attrs.shortcode.length > 0) return attrs.shortcode;
    if (typeof attrs.name === 'string' && attrs.name.length > 0) return `:${attrs.name}:`;
    return ':emoji:';
  };

  const walk = (n: JSONContent) => {
    if (n.type === 'text') {
      const start = text.length;
      const t = n.text || '';
      text += t;
      const end = text.length;

      if (n.marks && Array.isArray(n.marks)) {
        for (const m of n.marks) {
          if (m.type === 'bold' || m.type === 'italic' || m.type === 'underline' || m.type === 'strike' || m.type === 'code' || m.type === 'superscript' || m.type === 'subscript' || m.type === 'highlight' || m.type === 'color') {
            marks.push({ type: m.type, start, end, attrs: m.attrs });
          } else if (m.type === 'link') {
            links.push({ href: m.attrs?.href, start, end, title: m.attrs?.title });
          }
        }
      }
    } else if (n.type === 'mention') {
      const start = text.length;
      const label = n.attrs?.label || '@unknown';
      text += label;
      const end = text.length;
    } else if (n.type === 'emoji') {
      // TipTap emoji node - preserve attrs and track positions for round-trip
      const start = text.length;
      const displayText = getEmojiDisplayText(n.attrs);
      text += displayText;
      const end = text.length;
      emojis.push({
        start,
        end,
        attrs: { ...(n.attrs || {}) },
        text: displayText,
      });
    } else if (n.content) {
      for (const child of n.content) walk(child as JSONContent);
    }
  };

  for (const n of nodes) walk(n as JSONContent);

  return { text, marks, links, emojis };
}

// Backwards-compatible helper that returns just the text portion
function nodesToText(nodes: JSONContent[] | undefined): string {
  return nodesToTextWithMeta(nodes).text;
}

/**
 * Extract mention objects from an array of TipTap nodes, computing their positions.
 */
function extractMentions(nodes: JSONContent[] | undefined): NoteMention[] {
  if (!nodes) return [];

  const mentions: NoteMention[] = [];
  let currentPos = 0;

  for (const node of nodes) {
    if (node.type === 'text') {
      currentPos += node.text?.length || 0;
    } else if (node.type === 'mention') {
      const label = node.attrs?.label || '@unknown';
      const noteId = node.attrs?.id || '';

      mentions.push({
        noteId,
        title: label,
        start: currentPos,
        end: currentPos + label.length,
      });

      currentPos += label.length;
    } else if (node.type === 'emoji') {
      // Keep mention offsets aligned with text that includes emoji placeholders.
      const attrs = node.attrs || {};
      const displayText =
        (typeof attrs.emoji === 'string' && attrs.emoji.length > 0 && attrs.emoji) ||
        (typeof attrs.unicode === 'string' && attrs.unicode.length > 0 && attrs.unicode) ||
        (Array.isArray(attrs.shortcodes) && attrs.shortcodes.length > 0 && attrs.shortcodes[0]) ||
        (typeof attrs.shortcode === 'string' && attrs.shortcode.length > 0 && attrs.shortcode) ||
        (typeof attrs.name === 'string' && attrs.name.length > 0 && `:${attrs.name}:`) ||
        '';
      currentPos += displayText.length;
    } else if (node.content) {
      const childMentions = extractMentions(node.content);
      for (const mention of childMentions) {
        // Adjust positions relative to current position
        mentions.push({
          ...mention,
          start: mention.start + currentPos,
          end: mention.end + currentPos,
        });
      }

      const childText = nodesToText(node.content);
      currentPos += childText.length;
    }
  }

  return mentions;
}

/**
 * Extract table structure from TipTap table node into a JSON format.
 */
function extractTableStructure(tableNode: JSONContent): any {
  const rows: any[] = [];
  let headerRowIndex = -1;

  if (tableNode.content) {
    for (let rowIdx = 0; rowIdx < tableNode.content.length; rowIdx++) {
      const row = tableNode.content[rowIdx];
      if (row.type === 'tableRow' && row.content) {
        const cells: string[] = [];
        let isHeaderRow = false;

        for (const cell of row.content) {
          if (cell.type === 'tableCell' || cell.type === 'tableHeader') {
            if (cell.type === 'tableHeader') {
              isHeaderRow = true;
            }
            const cellText = nodesToText(cell.content);
            cells.push(cellText);
          }
        }

        if (isHeaderRow && headerRowIndex === -1) {
          headerRowIndex = rowIdx;
        }

        rows.push({ cells });
      }
    }
  }

  return {
    rows,
    headerRowIndex: headerRowIndex !== -1 ? headerRowIndex : 0,
  };
}

/**
 * Convert TipTap table node to a string representation (legacy format).
 * Used for fallback/older data compatibility.
 */
function nodeTableToString(tableNode: JSONContent): string {
  const rows: string[] = [];

  if (tableNode.content) {
    for (const row of tableNode.content) {
      if (row.type === 'tableRow' && row.content) {
        const cells: string[] = [];
        for (const cell of row.content) {
          if ((cell.type === 'tableCell' || cell.type === 'tableHeader') && cell.content) {
            const cellText = nodesToText(cell.content);
            cells.push(cellText);
          }
        }
        rows.push(cells.join(' | '));
      }
    }
  }

  return rows.join('\n');
}

/**
 * Convert legacy string-based table format to new JSON format.
 * Legacy format: "cell1 | cell2 | cell3\nrow1 | row2 | row3\n..."
 */
function convertLegacyTableFormat(tableString: string): any {
  const lines = tableString.trim().split('\n');
  const rows: any[] = [];

  lines.forEach((line) => {
    const cells = line.split('|').map((cell) => cell.trim());
    rows.push({ cells });
  });

  return {
    rows,
    headerRowIndex: 0, // First row is assumed to be header
  };
}
