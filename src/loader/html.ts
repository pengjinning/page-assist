import { BaseDocumentLoader } from "langchain/document_loaders/base"
// import { Document } from "@langchain/core/documents"
import { Document } from "langchain/document"
import { compile } from "html-to-text"
import { chromeRunTime } from "~/libs/runtime"
import { YtTranscript } from "yt-transcript"

const YT_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)/

const isYoutubeLink = (url: string) => {
  return YT_REGEX.test(url)
}

const getTranscript = async (url: string) => {
  const ytTranscript = new YtTranscript({ url })
  return await ytTranscript.getTranscript()
}


export interface WebLoaderParams {
  html: string
  url: string
}

export class PageAssistHtmlLoader
  extends BaseDocumentLoader
  implements WebLoaderParams {
  html: string
  url: string

  constructor({ html, url }: WebLoaderParams) {
    super()
    this.html = html
    this.url = url
  }

  async load(): Promise<Document<Record<string, any>>[]> {
    if (isYoutubeLink(this.url)) {
      const transcript = await getTranscript(this.url)
      if (!transcript) {
        throw new Error("Transcript not found for this video.")
      }

      let text = ""

      transcript.forEach((item) => {
        text += item.text + " "
      })


      return [
        {
          metadata: {
            source: this.url,
            audio: { chunks: transcript }
          },
          pageContent: text
        }
      ]
    }
    const htmlCompiler = compile({
      wordwrap: false
    })
    const text = htmlCompiler(this.html)
    const metadata = { source: this.url }
    return [new Document({ pageContent: text, metadata })]
  }

  async loadByURL(): Promise<Document<Record<string, any>>[]> {
    if (isYoutubeLink(this.url)) {
      const transcript = await getTranscript(this.url)
      if (!transcript) {
        throw new Error("Transcript not found for this video.")
      }

      let text = ""

      transcript.forEach((item) => {
        text += item.text + " "
      })


      return [
        {
          metadata: {
            source: this.url,
            audio: { chunks: transcript }
          },
          pageContent: text
        }
      ]
    }
    await chromeRunTime(this.url)
    const fetchHTML = await fetch(this.url)
    const html = await fetchHTML.text()
    const htmlCompiler = compile({
      wordwrap: false,
      selectors: [
        { selector: "img", format: "skip" },
        { selector: "script", format: "skip" }
      ]
    })
    const text = htmlCompiler(html)
    const metadata = { url: this.url }
    return [new Document({ pageContent: text, metadata })]
  }
}
