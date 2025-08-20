import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.IMPORT_SECRET
  const provided = request.headers.get('x-import-secret') || new URL(request.url).searchParams.get('secret')
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const isWin = process.platform === 'win32'
    const cmd = isWin ? 'npx.cmd' : 'npx'
    const args = ['ts-node', '--transpile-only', 'scripts/import-data.ts']

    const child = spawn(cmd, args, { cwd: process.cwd(), env: process.env })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))

    const exitCode: number = await new Promise((resolve) => {
      child.on('close', (code) => resolve(code ?? 0))
    })

    if (exitCode !== 0) {
      return NextResponse.json({ ok: false, exitCode, stdout, stderr }, { status: 500 })
    }

    return NextResponse.json({ ok: true, stdout })
  } catch (error: any) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
