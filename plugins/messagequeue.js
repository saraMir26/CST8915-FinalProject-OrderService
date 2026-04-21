'use strict'

const crypto = require('crypto')
if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto
}

const fp = require('fastify-plugin')
const { MongoClient, ObjectId } = require('mongodb')

module.exports = fp(async function (fastify, opts) {
  const mongoUri =
    process.env.ORDER_DB_URI ||
    process.env.MONGO_URL ||
    'mongodb://localhost:27017'

  const dbName = process.env.ORDER_DB_NAME || 'orderdb'
  const collectionName = process.env.ORDER_DB_COLLECTION_NAME || 'orders'

  const client = new MongoClient(mongoUri)
  await client.connect()

  const db = client.db(dbName)
  const ordersCollection = db.collection(collectionName)

  fastify.decorate('sendMessage', async function (message) {
    try {
      const parsedMessage =
        typeof message === 'string' ? JSON.parse(message) : message

      const objectId = new ObjectId()

      const order = {
        _id: objectId,
        orderId: objectId.toString(),
        customerId: parsedMessage.customerId || '1',
        items: Array.isArray(parsedMessage.items) ? parsedMessage.items : [],
        status: parsedMessage.status ?? 0,
        createdAt: new Date()
      }

      await ordersCollection.insertOne(order)

      fastify.log.info(`Order saved to MongoDB with id ${order.orderId}`)

      return order
    } catch (error) {
      fastify.log.error(error, 'Failed to save order to MongoDB')
      throw error
    }
  })

  fastify.addHook('onClose', async function () {
    await client.close()
  })
})