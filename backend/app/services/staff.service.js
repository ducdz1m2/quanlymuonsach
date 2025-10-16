const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const { generateToken } = require("../middlewares/auth.middleware");
class StaffService {
  constructor(client) {
    this.Staff = client.db().collection("staff");
  }

  async extractStaffData(payload) {
    let maNV = payload.maNV;

    // Nếu không có mã nhân viên, tạo tự động
    if (!maNV) {
      maNV = await this.generateMaNV(); // hàm tự tăng
    }

    const staff = {
      maNV,
      hoTenNV: payload.hoTenNV,
      email: payload.email,
      password: payload.password
        ? bcrypt.hashSync(payload.password, 10)
        : undefined,
      chucVu: payload.chucVu,
      diaChi: payload.diaChi,
      soDienThoai: payload.soDienThoai,
      phai: payload.phai || "",
      ngaySinh: payload.ngaySinh || "",
      anh: payload.anh || "/images/default-staff.png",
    };

    Object.keys(staff).forEach(
      (key) => staff[key] === undefined && delete staff[key]
    );

    return staff;
  }

  async generateMaNV() {
    const lastStaff = await this.Staff.find({
      maNV: { $regex: /^NV-\d{4}$/ },
    }).toArray();

    if (lastStaff.length === 0) return "NV-0001";

    // Tìm số lớn nhất
    let maxNumber = 0;
    lastStaff.forEach((s) => {
      const parts = s.maNV.split("-");
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxNumber) maxNumber = num;
    });

    const newNumber = maxNumber + 1;
    return `NV-${newNumber.toString().padStart(4, "0")}`;
  }

  async create(payload) {
    const staff = await this.extractStaffData(payload); // async
    const result = await this.Staff.findOneAndUpdate(
      { hoTenNV: staff.hoTenNV, soDienThoai: staff.soDienThoai },
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
    const update = await this.extractStaffData(payload);
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
  async login(email, password) {
    const staff = await this.Staff.findOne({ email });
    if (!staff) return null;

    const isValid = await bcrypt.compare(password, staff.password);
    if (!isValid) return null;

    delete staff.password;

    const token = generateToken({ ...staff, role: "staff" });

    return { ...staff, token };
  }
}

module.exports = StaffService;
