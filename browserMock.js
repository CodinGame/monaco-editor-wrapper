/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetch as fetchPolyfill } from 'whatwg-fetch'
import fs from 'fs/promises'
import { performance } from 'perf_hooks'

Object.defineProperty(document, 'queryCommandSupported', {
  value: jest.fn().mockImplementation(() => true)
})

window.process = undefined

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

Object.defineProperty(window, 'fetch', {
  value: jest.fn(async (url, options) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (url.startsWith('file:')) {
      const content = await fs.readFile(new URL(url).pathname)
      return {
        json: async () => JSON.stringify(JSON.parse(content.toString())),
        arrayBuffer: async () => content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength),
        status: 200
      }
    } else {
      return fetchPolyfill(url, options)
    }
  })
})

Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn((blob) => {
    return 'blob:not-working'
  })
})

Object.defineProperty(window, 'Worker', {
  value: class Worker {
    constructor (stringUrl) {}
    postMessage (msg) {}
    terminate () {}
    removeEventListener () {}
  }
})

Object.defineProperty(window, 'ResizeObserver', {
  value: class ResizeObserver {
    constructor (stringUrl) {}
    observe () {}
  }
})

// These 2 classes come from https://gist.github.com/Yaffle/5458286
Object.defineProperty(window, 'TextEncoder', {
  value: class TextEncoder {
    encode (string) {
      const octets = []
      const length = string.length
      let i = 0
      while (i < length) {
        const codePoint = string.codePointAt(i)
        let c = 0
        let bits = 0
        if (codePoint <= 0x0000007F) {
          c = 0
          bits = 0x00
        } else if (codePoint <= 0x000007FF) {
          c = 6
          bits = 0xC0
        } else if (codePoint <= 0x0000FFFF) {
          c = 12
          bits = 0xE0
        } else if (codePoint <= 0x001FFFFF) {
          c = 18
          bits = 0xF0
        }
        octets.push(bits | (codePoint >> c))
        c -= 6
        while (c >= 0) {
          octets.push(0x80 | ((codePoint >> c) & 0x3F))
          c -= 6
        }
        i += codePoint >= 0x10000 ? 2 : 1
      }
      return Uint8Array.from(octets)
    }
  }
})
Object.defineProperty(window, 'TextDecoder', {
  value: class TextDecoder {
    decode (octets) {
      if (octets == null) {
        return ''
      }
      let string = ''
      let i = 0
      while (i < octets.length) {
        let octet = octets[i]
        let bytesNeeded = 0
        let codePoint = 0
        if (octet <= 0x7F) {
          bytesNeeded = 0
          codePoint = octet & 0xFF
        } else if (octet <= 0xDF) {
          bytesNeeded = 1
          codePoint = octet & 0x1F
        } else if (octet <= 0xEF) {
          bytesNeeded = 2
          codePoint = octet & 0x0F
        } else if (octet <= 0xF4) {
          bytesNeeded = 3
          codePoint = octet & 0x07
        }
        if (octets.length - i - bytesNeeded > 0) {
          let k = 0
          while (k < bytesNeeded) {
            octet = octets[i + k + 1]
            codePoint = (codePoint << 6) | (octet & 0x3F)
            k += 1
          }
        } else {
          codePoint = 0xFFFD
          bytesNeeded = octets.length - i
        }
        string += String.fromCodePoint(codePoint)
        i += bytesNeeded + 1
      }
      return string
    }
  }
})

Object.defineProperty(window, 'Buffer', {
  value: undefined
})

// Force override performance, for some reason the implementation is empty otherwise
const _performance = performance
Object.defineProperty(global, 'performance', {
  get () { return _performance },
  set (v) {
    // ignore
  }
})

global.CSS = {
  escape: v => v
}

Element.prototype.scrollIntoView = jest.fn()
