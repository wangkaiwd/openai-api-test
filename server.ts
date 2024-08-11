import 'dotenv/config'
import http from 'http'
import OpenAI from 'openai'
import { createReadStream } from 'fs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com',
})
const server = http.createServer(async (req: any, res: any) => {
  // https://github.com/nodejs/node/issues/12682
  const { pathname, searchParams } = new URL(req.url,
    `http://${req.headers.host}`)
  // https://blog.adriaan.io/convert-url-searchparams-to-plain-javascript-object.html
  const query = Object.fromEntries(searchParams)

  if (pathname === '/') {
    createReadStream('./index.html').pipe(res)
    return
  }
  if (pathname === '/api/chat') {
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: query.prompt }],
      stream: true,
      max_tokens: 100,
    })
    res.writeHead(200, { 'Content-Type': 'text/event-stream' })
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`)
    }
    req.on('close', () => {
      console.log('req close ...')
      res.end()
    })
    return
  }
  res.end('other route')
})

const PORT = 3008
server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}/`))
