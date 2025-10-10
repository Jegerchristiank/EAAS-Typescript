import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { ensureDataFileExists, loadEnvironment } from './env'
import { TokenAuthenticator } from './auth/tokenAuth'
import { FileRepository } from './persistence/fileRepository'
import { WizardPersistenceService } from './persistence/wizardService'
import type { PersistedWizardStorage, WizardPersistenceSnapshot } from '@org/shared'

async function readJsonBody<T>(req: IncomingMessage): Promise<T | null> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk as Buffer)
  }
  if (chunks.length === 0) {
    return null
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8')) as T
  } catch (error) {
    throw new Error('Request body is not valid JSON')
  }
}

function respond(res: ServerResponse, statusCode: number, payload: unknown): void {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

const environment = loadEnvironment()
ensureDataFileExists(environment.dataFile)
const authenticator = new TokenAuthenticator(environment)
const repository = new FileRepository(environment.dataFile)
const service = new WizardPersistenceService(repository)

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    respond(res, 400, { error: 'Ugyldig forespørgsel' })
    return
  }

  if (req.url === '/health' && req.method === 'GET') {
    respond(res, 200, { status: 'ok' })
    return
  }

  const auth = authenticator.authenticate(req.headers)
  if (!auth) {
    respond(res, 401, { error: 'Uautoriseret' })
    return
  }

  if (req.url === '/wizard/snapshot' && req.method === 'GET') {
    const document = service.load()
    const payload: WizardPersistenceSnapshot = {
      storage: document.storage,
      auditLog: document.auditLog,
      permissions: auth.permissions,
      user: auth.user,
    }
    respond(res, 200, payload)
    return
  }

  if (req.url === '/wizard/snapshot' && req.method === 'PUT') {
    if (!auth.permissions.canEdit) {
      respond(res, 403, { error: 'Mangler rettigheder til at redigere' })
      return
    }

    try {
      const body = await readJsonBody<{ storage: PersistedWizardStorage }>(req)
      if (!body?.storage) {
        respond(res, 400, { error: 'Request mangler storage-objekt' })
        return
      }
      const document = service.save(body.storage, auth.user.id)
      const payload: WizardPersistenceSnapshot = {
        storage: document.storage,
        auditLog: document.auditLog,
        permissions: auth.permissions,
        user: auth.user,
      }
      respond(res, 200, payload)
    } catch (error) {
      respond(res, 400, { error: (error as Error).message })
    }
    return
  }

  respond(res, 404, { error: 'Ikke fundet' })
})

server.listen(environment.port, () => {
  console.log(`Wizard persistence API lytter på http://localhost:${environment.port}`)
})
