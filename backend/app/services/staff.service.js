const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class StaffService {
  constructor(client) {
    this.Staff = client.db().collection("staff");
  }

  extractStaffData(payload) {
    const staff = {
      hoTenNV: payload.hoTenNV,
      email: payload.email,
      password: payload.password
        ? bcrypt.hashSync(payload.password, 10) // hash trước khi lưu, 10 rounds
        : undefined,
      chucVu: payload.chucVu,
      diaChi: payload.diaChi,
      soDienThoai: payload.soDienThoai,
      phai: payload.phai || "", // giới tính, mặc định rỗng nếu không có
      ngaySinh: payload.ngaySinh || "", // ngày sinh, mặc định rỗng nếu không có
      anh: payload.anh || "/images/default-staff.png", // ảnh mặc định nếu không có
    };

    Object.keys(staff).forEach(
      (key) => staff[key] === undefined && delete staff[key]
    );
    return staff;
  }

  async create(payload) {
    const staff = this.extractStaffData(payload);
    const result = await this.Staff.findOneAndUpdate(
      { hoTenNV: staff.hoTenNV, soDienThoai: staff.soDienThoai }, // tránh trùng
      { $set: staff },
      { returnDocument: "after", upsert: true }
    );
    return result.value;
  }

  async find(filter) {
    const cursor = await this.Staff.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Staff.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;
    const filter = { _id: new ObjectId(id) };
    const update = this.extractStaffData(payload);
    const result = await this.Staff.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.Staff.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.Staff.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = StaffService;
