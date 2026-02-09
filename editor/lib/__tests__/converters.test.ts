import { describe, it, expect } from 'vitest';
import { convertBlocksToTipTap } from '@/editor/lib/convertBlocksToTipTap';
import { convertTipTapToBlocks } from '@/editor/lib/convertTipTapToBlocks';
import { Block } from '@/editor/schema/types';

/**
 * Round-trip conversion tests: Block[] → TipTap → Block[]
 * Validates that data is preserved (or transformed reasonably) through the conversion cycle.
 */

describe('Block ↔ TipTap Converters', () => {
  describe('Simple text blocks', () => {
    it('converts single text block round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'text',
          content: 'Hello world',
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('text');
      expect(converted[0].content).toBe('Hello world');
    });

    it('converts multiple text blocks round-trip', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'text', content: 'First paragraph' },
        { id: 'block-2', type: 'text', content: 'Second paragraph' },
        { id: 'block-3', type: 'text', content: 'Third paragraph' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(3);
      expect(converted[0].content).toBe('First paragraph');
      expect(converted[1].content).toBe('Second paragraph');
      expect(converted[2].content).toBe('Third paragraph');
    });

    it('handles empty text', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'text', content: '' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].content).toBe('');
    });
  });

  describe('Headings', () => {
    it('converts h1, h2, h3 headings round-trip', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'h1', content: 'Main Title' },
        { id: 'block-2', type: 'h2', content: 'Subtitle' },
        { id: 'block-3', type: 'h3', content: 'Minor Title' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(3);
      expect(converted[0].type).toBe('h1');
      expect(converted[0].content).toBe('Main Title');
      expect(converted[1].type).toBe('h2');
      expect(converted[1].content).toBe('Subtitle');
      expect(converted[2].type).toBe('h3');
      expect(converted[2].content).toBe('Minor Title');
    });
  });

  describe('Lists', () => {
    it('converts bullet list round-trip', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'bullet-list', content: 'Item 1' },
        { id: 'block-2', type: 'bullet-list', content: 'Item 2' },
        { id: 'block-3', type: 'bullet-list', content: 'Item 3' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(3);
      expect(converted[0].type).toBe('bullet-list');
      expect(converted[0].content).toBe('Item 1');
      expect(converted[1].type).toBe('bullet-list');
      expect(converted[1].content).toBe('Item 2');
      expect(converted[2].type).toBe('bullet-list');
      expect(converted[2].content).toBe('Item 3');
    });

    it('converts numbered list round-trip', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'numbered-list', content: 'First step' },
        { id: 'block-2', type: 'numbered-list', content: 'Second step' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(2);
      expect(converted[0].type).toBe('numbered-list');
      expect(converted[1].type).toBe('numbered-list');
    });

    it('converts todo list with checked state round-trip', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'todo', content: 'Task 1', checked: false },
        { id: 'block-2', type: 'todo', content: 'Task 2', checked: true },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(2);
      expect(converted[0].type).toBe('todo');
      expect(converted[0].checked).toBe(false);
      expect(converted[1].type).toBe('todo');
      expect(converted[1].checked).toBe(true);
    });
  });

  describe('Code and quotes', () => {
    it('converts code block round-trip', () => {
      const originalBlocks: Block[] = [
        { 
          id: 'block-1', 
          type: 'code', 
          content: 'const x = 42;\nconsole.log(x);' 
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('code');
      expect(converted[0].content).toBe('const x = 42;\nconsole.log(x);');
    });

    it('converts blockquote round-trip', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'quote', content: 'The quick brown fox...' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('quote');
      expect(converted[0].content).toBe('The quick brown fox...');
    });
  });

  describe('Dividers', () => {
    it('converts divider round-trip', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'text', content: 'Before divider' },
        { id: 'block-2', type: 'divider', content: '' },
        { id: 'block-3', type: 'text', content: 'After divider' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(3);
      expect(converted[0].content).toBe('Before divider');
      expect(converted[1].type).toBe('divider');
      expect(converted[2].content).toBe('After divider');
    });
  });

  describe('Mentions', () => {
    it('converts text with mention round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'text',
          content: 'Check with @Alice about the project',
          mentions: [
            { noteId: 'note-123', title: '@Alice', start: 11, end: 17 },
          ],
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].content).toBe('Check with @Alice about the project');
      expect(converted[0].mentions).toBeDefined();
      expect(converted[0].mentions![0].title).toBe('@Alice');
      expect(converted[0].mentions![0].noteId).toBe('note-123');
    });

    it('converts multiple mentions round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'text',
          content: '@Alice and @Bob agree on this',
          mentions: [
            { noteId: 'note-1', title: '@Alice', start: 0, end: 6 },
            { noteId: 'note-2', title: '@Bob', start: 11, end: 15 },
          ],
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].mentions).toHaveLength(2);
      expect(converted[0].mentions![0].title).toBe('@Alice');
      expect(converted[0].mentions![1].title).toBe('@Bob');
    });

    it('preserves mention positions in converted blocks', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'text',
          content: 'Start @Middle end',
          mentions: [
            { noteId: 'note-x', title: '@Middle', start: 6, end: 13 },
          ],
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted[0].mentions![0].start).toBe(6);
      expect(converted[0].mentions![0].end).toBe(13);
    });
  });

  describe('Mixed content document', () => {
    it('handles complex document with mixed block types', () => {
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'h1', content: 'Project Plan' },
        { id: 'block-2', type: 'text', content: 'Overview of the project' },
        { id: 'block-3', type: 'h2', content: 'Tasks' },
        { id: 'block-4', type: 'bullet-list', content: 'Design mockups' },
        { id: 'block-5', type: 'bullet-list', content: 'Implement features' },
        { id: 'block-6', type: 'h2', content: 'Implementation' },
        {
          id: 'block-7',
          type: 'text',
          content: 'Assign to @Developer for review',
          mentions: [{ noteId: 'dev-1', title: '@Developer', start: 10, end: 20 }],
        },
        { id: 'block-8', type: 'code', content: 'console.log("Starting");' },
        { id: 'block-9', type: 'divider', content: '' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(originalBlocks.length);
      expect(converted[0].type).toBe('h1');
      expect(converted[2].type).toBe('h2');
      expect(converted[3].type).toBe('bullet-list');
      expect(converted[6].mentions).toBeDefined();
      expect(converted[7].type).toBe('code');
      expect(converted[8].type).toBe('divider');
    });
  });

  describe('Edge cases', () => {
    it('handles empty blocks array', () => {
      const tiptapJson = convertBlocksToTipTap([]);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted.length).toBeGreaterThan(0);
      expect(converted[0].type).toBe('text');
    });

    it('handles undefined tiptap content', () => {
      const converted = convertTipTapToBlocks(undefined);

      expect(converted.length).toBeGreaterThan(0);
      expect(converted[0].type).toBe('text');
    });

    it('preserves block order through conversions', () => {
      const originalBlocks: Block[] = [
        { id: 'a', type: 'text', content: 'First' },
        { id: 'b', type: 'h1', content: 'Second' },
        { id: 'c', type: 'bullet-list', content: 'Third' },
        { id: 'd', type: 'code', content: 'Fourth' },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted[0].content).toBe('First');
      expect(converted[1].content).toBe('Second');
      expect(converted[2].content).toBe('Third');
      expect(converted[3].content).toBe('Fourth');
    });

    it('handles text with special characters', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'text',
          content: 'Special chars: !@#$%^&*()',
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted[0].content).toBe('Special chars: !@#$%^&*()');
    });

    it('handles long text blocks', () => {
      const longContent = 'Lorem ipsum '.repeat(100);
      const originalBlocks: Block[] = [
        { id: 'block-1', type: 'text', content: longContent },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted[0].content).toBe(longContent);
    });
  });

  describe('Assets', () => {
    it('converts image asset round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'asset',
          content: '',
          media: {
            type: 'image',
            src: '/assets/photo.jpg',
            assetId: 'asset-123',
            alt: 'A photo',
          },
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('asset');
      expect(converted[0].media).toBeDefined();
      expect(converted[0].media!.type).toBe('image');
      expect(converted[0].media!.assetId).toBe('asset-123');
      expect(converted[0].media!.src).toBe('/assets/photo.jpg');
      expect(converted[0].media!.alt).toBe('A photo');
    });

    it('converts video asset round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'asset',
          content: '',
          media: {
            type: 'video',
            src: '/assets/video.mp4',
            assetId: 'asset-456',
          },
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('asset');
      expect(converted[0].media!.type).toBe('video');
      expect(converted[0].media!.assetId).toBe('asset-456');
    });

    it('converts audio asset round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'asset',
          content: '',
          media: {
            type: 'audio',
            src: '/assets/audio.mp3',
            assetId: 'asset-789',
          },
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('asset');
      expect(converted[0].media!.type).toBe('audio');
      expect(converted[0].media!.assetId).toBe('asset-789');
    });

    it('preserves asset IDs and metadata through conversions', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-image',
          type: 'asset',
          content: '',
          media: {
            type: 'image',
            src: '/img.jpg',
            assetId: 'my-unique-asset-id',
            alt: 'Important image',
            caption: 'Image Caption',
          },
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted[0].media!.assetId).toBe('my-unique-asset-id');
      expect(converted[0].media!.alt).toBe('Important image');
      expect(converted[0].media!.caption).toBe('Image Caption');
    });
  });

  describe('Tables', () => {
    it('converts table block round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'table',
          content: JSON.stringify({
            rows: [
              { cells: ['Header 1', 'Header 2'] },
              { cells: ['Cell 1', 'Cell 2'] },
            ],
            headerRowIndex: 0,
          }),
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('table');
    });
  });

  describe('Media blocks (image, video, audio)', () => {
    it('converts image block round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'image',
          content: '',
          media: { type: 'image', src: '/image.jpg', alt: 'Test image' },
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('image');
      expect(converted[0].media!.type).toBe('image');
    });

    it('converts video block round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'video',
          content: '',
          media: { type: 'video', src: '/video.mp4' },
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('video');
      expect(converted[0].media!.type).toBe('video');
    });

    it('converts audio block round-trip', () => {
      const originalBlocks: Block[] = [
        {
          id: 'block-1',
          type: 'audio',
          content: '',
          media: { type: 'audio', src: '/audio.mp3' },
        },
      ];

      const tiptapJson = convertBlocksToTipTap(originalBlocks);
      const converted = convertTipTapToBlocks(tiptapJson);

      expect(converted).toHaveLength(1);
      expect(converted[0].type).toBe('audio');
      expect(converted[0].media!.type).toBe('audio');
    });
  });
});
