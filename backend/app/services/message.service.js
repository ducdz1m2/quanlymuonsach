const { ObjectId } = require("mongodb");

class MessageService {
  constructor(client) {
    this.Message = client.db().collection("messages");
  }

  extractMessageData(payload) {
    const message = {
      sender: payload.sender,
      room: payload.room || null,
      text: payload.text,
      createdAt: new Date(),
      status: payload.status || "sent",
    };

    Object.keys(message).forEach(
      (key) => message[key] === undefined && delete message[key]
    );

    return message;
  }

  async create(payload) {
    const message = this.extractMessageData(payload);
    const result = await this.Message.insertOne(message);
    return result.insertedId ? { ...message, _id: result.insertedId } : null;
  }

  async find(filter = {}) {
    const cursor = await this.Message.find(filter).sort({ createdAt: 1 });
    return await cursor.toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Message.findOne({ _id: new ObjectId(id) });
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.Message.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.Message.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = MessageService;
