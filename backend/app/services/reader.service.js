const { ObjectId } = require("mongodb");

class ReaderService {
    constructor(client) {
        this.Reader = client.db().collection("reader");
    }

    extractReaderData(payload) {
        const reader = {
            hoLot: payload.hoLot,
            ten: payload.ten,
            ngaySinh: payload.ngaySinh,
            phai: payload.phai,
            diaChi: payload.diaChi,
            dienThoai: payload.dienThoai,
        };
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    }

    async create(payload) {
        const reader = this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            { hoLot: reader.hoLot, ten: reader.ten, ngaySinh: reader.ngaySinh }, // tránh trùng độc giả
            { $set: reader },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Reader.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.Reader.findOne({ _id: new ObjectId(id) });
    }

    async update(id, payload) {
        if (!ObjectId.isValid(id)) return null;
        const filter = { _id: new ObjectId(id) };
        const update = this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) return null;
        const result = await this.Reader.findOneAndDelete({
            _id: new ObjectId(id),
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.Reader.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ReaderService;
