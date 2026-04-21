'use strict'

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    try {
      const msg = request.body
      const savedOrder = await fastify.sendMessage(msg)

      return reply.code(201).send(savedOrder)
    } catch (error) {
      fastify.log.error(error, 'Failed to create order')
      return reply.code(500).send({ error: 'Failed to create order' })
    }
  })

  fastify.get('/health', async function (request, reply) {
    const appVersion = process.env.APP_VERSION || '0.1.0'
    return { status: 'ok', version: appVersion }
  })

  fastify.get('/hugs', async function (request, reply) {
    return { hugs: fastify.someSupport() }
  })
}