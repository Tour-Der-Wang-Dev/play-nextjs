import { describe, it, expect } from 'vitest'
import { NotionBlockTransformer } from './transformer'

const paragraph = {
  type: 'paragraph',
  paragraph: { rich_text: [{ plain_text: 'Hello', annotations: { bold: true } }] },
}
const h2 = { type: 'heading_2', heading_2: { rich_text: [{ plain_text: 'Title' }] } }
const bullet = { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ plain_text: 'Item' }] } }
const code = { type: 'code', code: { language: 'ts', rich_text: [{ plain_text: 'const x=1' }] } }
const image = { type: 'image', image: { type: 'external', external: { url: 'https://example.com/img.png' }, caption: [{ plain_text: 'alt' }] } }
const divider = { type: 'divider', divider: {} }
const quote = { type: 'quote', quote: { rich_text: [{ plain_text: 'Quote' }] } }
const callout = { type: 'callout', callout: { rich_text: [{ plain_text: 'Note' }] } }

const page = {
  object: 'page',
  id: 'page123',
  properties: {
    Name: { id: 'title', type: 'title', title: [{ plain_text: 'My Page' }] },
    Tags: { id: 'tags', type: 'multi_select', multi_select: [{ name: 'a' }, { name: 'b' }] },
    URL: { id: 'url', type: 'url', url: 'https://example.com' },
    Done: { id: 'checkbox', type: 'checkbox', checkbox: true },
  },
}

describe('NotionBlockTransformer', () => {
  it('transforms blocks to content body', () => {
    const t = new NotionBlockTransformer()
    const body = t.transform([paragraph, h2, bullet, code, image, divider, quote, callout])
    expect(body.blocks.length).toBe(8)
    expect(body.blocks[0].type).toBe('paragraph')
    expect(Array.isArray(body.blocks[0].content)).toBe(true)
    expect((body.blocks[3].metadata as any).language).toBe('ts')
    expect((body.blocks[4].metadata as any).url).toContain('example.com')
  })

  it('extracts title and metadata', () => {
    const t = new NotionBlockTransformer()
    expect(t.extractTitle(page as any)).toBe('My Page')
    const meta = t.extractMetadata(page as any)
    expect(meta.Tags).toEqual(['a', 'b'])
    expect(meta.URL).toBe('https://example.com')
    expect(meta.Done).toBe(true)
  })

  it('renders plain text and HTML', () => {
    const t = new NotionBlockTransformer()
    const body = t.transform([paragraph, h2])
    const text = t.toPlainText(body)
    expect(text).toContain('Hello')
    const html = t.toHTML(body)
    expect(html).toContain('<h2>')
  })
})
