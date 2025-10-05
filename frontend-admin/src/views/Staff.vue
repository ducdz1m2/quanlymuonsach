<template>
    <div class="p-4">
        <h1 class="mb-4">👨‍💼 Quản lý nhân viên</h1>

        <!-- Thanh công cụ -->
        <div class="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
            <input type="text" class="form-control w-25" placeholder="🔍 Tìm kiếm nhân viên..." v-model="searchQuery" />

            <!-- Lọc theo chức vụ -->
            <select class="form-select w-auto" v-model="selectedPosition">
                <option value="">📌 Tất cả chức vụ</option>
                <option v-for="p in uniquePositions" :key="p" :value="p">{{ p }}</option>
            </select>

            <!-- Lọc theo giới tính -->
            <select class="form-select w-auto" v-model="selectedGender">
                <option value="">👥 Tất cả phái</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Không rõ">Không rõ</option>

            </select>

            <!-- Lọc theo năm sinh -->
            <select class="form-select w-auto" v-model="selectedYear">
                <option value="">📅 Tất cả năm sinh</option>
                <option v-for="y in uniqueYears" :key="y" :value="y">{{ y }}</option>
            </select>

            <!-- 🔄 Nút reset -->
            <button class="btn btn-secondary" @click="resetFilters">↺ Reset</button>

            <button class="btn btn-primary" @click="openAddModal">+ Thêm nhân viên</button>
        </div>


        <!-- Bảng danh sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Mã nhân viên</th>
                        <th>Họ tên</th>
                        <th>Chức vụ</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Địa chỉ</th>
                        <th>Giới tính</th>
                        <th>Ngày sinh</th>
                        <th>Ảnh</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="staff in paginatedStaffs" :key="staff._id">
                        <td class="text-start">{{ staff.maNV }}</td>
                        <td class="text-start">{{ staff.hoTenNV }}</td>
                        <td class="text-start">{{ staff.chucVu }}</td>
                        <td>{{ staff.email }}</td>
                        <td>{{ staff.soDienThoai }}</td>
                        <td class="text-start">{{ staff.diaChi }}</td>
                        <td>{{ staff.phai }}</td>
                        <td>{{ staff.ngaySinh }}</td>
                        <td>
                            <img :src="staff.anh || '/images/default-staff.png'" width="60" height="80"
                                class="rounded shadow-sm" />
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(staff)">Sửa</button>
                            <button class="btn btn-sm btn-danger" @click="deleteStaff(staff._id)">Xóa</button>
                        </td>
                    </tr>
                    <tr v-if="!loading && paginatedStaffs.length === 0">
                        <td colspan="9">Không có nhân viên phù hợp</td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="9">⏳ Đang tải dữ liệu...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Phân trang -->
        <div class="d-flex justify-content-center mt-3 gap-2" v-if="totalPages > 1">
            <button class="btn btn-outline-primary" :disabled="currentPage === 1" @click="prevPage">◀ Trước</button>
            <span class="align-self-center">Trang {{ currentPage }} / {{ totalPages || 1 }}</span>
            <button class="btn btn-outline-primary" :disabled="currentPage === totalPages" @click="nextPage">Sau
                ▶</button>
        </div>

        <!-- Modal -->
        <div v-if="showForm" class="modal-backdrop">
            <div class="modal-content p-4">
                <h5>{{ editingStaff ? "✏️ Sửa nhân viên" : "➕ Thêm nhân viên" }}</h5>
                <StaffForm :staff="editingStaff" @save="handleSave" @cancel="closeForm" @delete="handleDelete" />
            </div>
        </div>
    </div>
</template>
<script>
import staffService from '@/services/staff.service';
import StaffForm from '@/components/staffs/StaffForm.vue';
import Swal from 'sweetalert2';

export default {
    components: { StaffForm },

    data() {
        return {
            staffs: [],
            searchQuery: "",
            selectedPosition: "",
            selectedGender: "",
            selectedYear: "",
            loading: false,

            showForm: false,
            editingStaff: null,

            currentPage: 1,
            itemsPerPage: 5,
        };
    },

    computed: {
        uniquePositions() {
            return [...new Set(this.staffs.map(s => s.chucVu).filter(Boolean))];
        },
        uniqueYears() {
            return [...new Set(this.staffs
                .map(s => s.ngaySinh ? new Date(s.ngaySinh).getFullYear() : null)
                .filter(Boolean)
            )].sort((a, b) => b - a); // năm mới trước
        },

        filteredStaffs() {
            const q = this.searchQuery.trim().toLowerCase();
            return this.staffs.filter(s => {
                const ma = s.maNV?.toLowerCase() || "";
                const name = s.hoTenNV?.toLowerCase() || "";
                const position = s.chucVu?.toLowerCase() || "";
                const email = s.email?.toLowerCase() || "";
                const phone = s.soDienThoai?.toLowerCase() || "";
                const address = s.diaChi?.toLowerCase() || "";
                const gender = s.phai || "";
                const birthYear = s.ngaySinh ? new Date(s.ngaySinh).getFullYear() : "";

                const matchesSearch = !q || ma.includes(q) || name.includes(q) ||
                    position.includes(q) || email.includes(q) ||
                    phone.includes(q) || address.includes(q);

                const matchesPosition = !this.selectedPosition || s.chucVu === this.selectedPosition;
                const matchesGender = !this.selectedGender || gender === this.selectedGender;
                const matchesYear = !this.selectedYear || birthYear == this.selectedYear;

                return matchesSearch && matchesPosition && matchesGender && matchesYear;
            });
        },

        totalPages() { return Math.ceil(this.filteredStaffs.length / this.itemsPerPage); },
        paginatedStaffs() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredStaffs.slice(start, start + this.itemsPerPage);
        },
    },

    methods: {
        resetFilters() {
            this.searchQuery = "";
            this.selectedPosition = "";
            this.selectedGender = "";
            this.selectedYear = "";
            this.currentPage = 1;
        },
        async fetchStaffs() {
            this.loading = true;
            try { this.staffs = await staffService.getAll(); }
            catch { this.staffs = []; }
            finally { this.loading = false; }
        },

        prevPage() { if (this.currentPage > 1) this.currentPage--; },
        nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },

        openAddModal() { this.editingStaff = null; this.showForm = true; },
        openEditModal(staff) { this.editingStaff = { ...staff }; this.showForm = true; },
        closeForm() { this.showForm = false; this.editingStaff = null; },

        async handleSave(staff) {
            try {
                if (staff._id) await staffService.update(staff._id, staff);
                else await staffService.create(staff);
                await this.fetchStaffs();
            } catch (err) {
                console.error("Lỗi lưu nhân viên:", err);
                Swal.fire("❌ Lỗi!", "Không thể lưu nhân viên.", "error");
            } finally {
                this.fetchStaffs();
                this.closeForm();
            }
        },

        async handleDelete(staff) {
            const result = await Swal.fire({
                title: "Bạn chắc chắn muốn xóa?",
                text: `Nhân viên: ${staff.hoTenNV}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            });

            if (result.isConfirmed) {
                try {
                    await staffService.delete(staff._id);
                    await this.fetchStaffs();
                    this.closeForm();
                    Swal.fire({
                        icon: "success",
                        title: "Đã xóa nhân viên!",
                        timer: 1500,
                        showConfirmButton: false,
                        toast: true,
                        position: "top-end",
                    });
                } catch (err) {
                    console.error(err);
                    Swal.fire("❌ Xóa thất bại!", "", "error");
                }
            }
        },

        async deleteStaff(id) {
            const staff = this.staffs.find(s => s._id === id);
            if (staff) await this.handleDelete(staff);
        },
    },

    mounted() { this.fetchStaffs(); },
};
</script>


<style scoped>
.table img {
    object-fit: cover;
}

.text-start {
    text-align: left;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
</style>
