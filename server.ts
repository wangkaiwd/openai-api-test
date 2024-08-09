import 'dotenv/config'
import http from 'http'
import fsp from 'fs/promises'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com'
})
const server = http.createServer(async (req: any, res: any) => {
  if (req.url === '/') {
    const data = await fsp.readFile('./index.html', 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
    return
  }
  if (req.url === '/api/chat') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
    })
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Who are you' }],
      stream: true,
    })
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`)
    }
    req.on('close', () => {
      console.log('req close ...')
    })
    res.end()
    return
  }
  res.end('other route')
})

const PORT = 3008
server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}/`))
