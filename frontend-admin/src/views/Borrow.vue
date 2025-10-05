<template>
    <div class="p-4">
        <h1 class="mb-4">📖 Quản lý phiếu mượn</h1>

        <!-- Thanh công cụ -->
        <div class="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
            <input type="text" class="form-control w-25" placeholder="🔍 Tìm kiếm theo tên sách hoặc tên độc giả..."
                v-model="searchQuery" />

            <!-- Lọc theo trạng thái -->
            <select class="form-select w-auto" v-model="selectedStatus">
                <option value="">📌 Tất cả trạng thái</option>
                <option v-for="s in uniqueStatuses" :key="s" :value="s">{{ s }}</option>
            </select>

            <!-- Lọc theo năm mượn -->
            <select class="form-select w-auto" v-model="selectedYear">
                <option value="">📅 Tất cả năm mượn</option>
                <option v-for="y in uniqueYears" :key="y" :value="y">{{ y }}</option>
            </select>

            <!-- 🔄 Nút reset -->
            <button class="btn btn-secondary" @click="resetFilters">↺ Reset</button>

            <button class="btn btn-primary" @click="openAddModal">+ Thêm phiếu mượn</button>
        </div>



        <!-- Bảng danh sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Mã mượn</th>
                        <th>Tên sách</th>
                        <th>Độc giả</th>
                        <th>Ngày mượn</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                        <th>Tổng tiền</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="borrow in paginatedBorrows" :key="borrow._id" @click="openDetailModal(borrow)"
                        style="cursor: pointer;">
                        <td class="text-start">{{ borrow.maMuon }}</td>
                        <td class="text-start">{{ borrow.bookInfo?.tenSach || borrow.bookId }}</td>
                        <td class="text-start">
                            {{ borrow.docGiaInfo ? borrow.docGiaInfo.hoLot + ' ' + borrow.docGiaInfo.ten :
                                borrow.docGiaId }}
                        </td>
                        <td>{{ borrow.ngayMuon }}</td>
                        <td>{{ borrow.ngayTra }}</td>
                        <td>
                            <span :class="statusClass(borrow.trangThai)">
                                {{ borrow.trangThai }}
                            </span>
                        </td>
                        <td>
                            {{ borrow.totalPayment != null ? borrow.totalPayment.toLocaleString() + ' ₫' : '-' }}
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click.stop="openEditModal(borrow)">Sửa</button>
                            <button v-if="borrow.trangThai !== 'Chờ duyệt' && borrow.trangThai !== 'Đang mượn'"
                                class="btn btn-sm btn-danger" @click.stop="deleteBorrow(borrow._id)">
                                Xóa
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!loading && paginatedBorrows.length === 0">
                        <td colspan="6">Không có phiếu mượn phù hợp</td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="6">⏳ Đang tải dữ liệu...</td>
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

        <!-- Modal Form -->
        <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
            <div class="modal-content p-4">
                <h5>{{ editingBorrow ? "✏️ Sửa phiếu mượn" : "➕ Thêm phiếu mượn" }}</h5>
                <BorrowForm :borrow="editingBorrow" @save="handleSave" @cancel="closeForm" @delete="handleDelete" />
            </div>
        </div>

        <!-- Modal Chi tiết -->
        <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
            <div class="modal-content p-4 detail-modal">
                <h5 class="mb-3">📄 Chi tiết phiếu mượn</h5>

                <div class="detail-grid">
                    <!-- Thông tin sách -->
                    <div class="detail-section">
                        <h6>📚 Thông tin sách</h6>

                        <p><b>Tên sách:</b> {{ selectedBorrow.bookInfo?.tenSach }}</p>
                        <p><b>Tác giả:</b> {{ selectedBorrow.bookInfo?.tacGia }}</p>
                        <p><b>Năm xuất bản:</b> {{ selectedBorrow.bookInfo?.namXuatBan }}</p>
                        <p><b>Số lượng:</b> {{ selectedBorrow.bookInfo?.soQuyen }}</p>
                        <p><b>Đơn giá:</b> {{ selectedBorrow.bookInfo?.donGia }}</p>
                        <p><b>Mô tả:</b> {{ selectedBorrow.bookInfo?.moTa }}</p>
                    </div>

                    <!-- Thông tin độc giả -->
                    <div class="detail-section">
                        <h6>👤 Thông tin độc giả</h6>
                        <p><b>Họ và tên:</b> {{ selectedBorrow.docGiaInfo?.hoLot }} {{ selectedBorrow.docGiaInfo?.ten }}
                        </p>
                        <p><b>Ngày sinh:</b> {{ selectedBorrow.docGiaInfo?.ngaySinh }}</p>
                        <p><b>Giới tính:</b> {{ selectedBorrow.docGiaInfo?.phai }}</p>
                        <p><b>Địa chỉ:</b> {{ selectedBorrow.docGiaInfo?.diaChi }}</p>
                        <p><b>Điện thoại:</b> {{ selectedBorrow.docGiaInfo?.dienThoai }}</p>
                    </div>
                </div>

                <!-- Thông tin mượn -->
                <div class="mt-3">
                    <h6>📅 Thông tin mượn</h6>
                    <p><b>Ngày mượn:</b> {{ selectedBorrow.ngayMuon }}</p>
                    <p><b>Ngày trả:</b> {{ selectedBorrow.ngayTra }}</p>
                    <p><b>Trạng thái:</b>
                        <span :class="statusClass(selectedBorrow.trangThai)">
                            {{ selectedBorrow.trangThai }}
                        </span>
                    </p>
                </div>

                <div class="text-end mt-3">
                    <button class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Swal from "sweetalert2";
import BorrowForm from "@/components/borrows/BorrowForm.vue";
import borrowService from "@/services/borrow.service";

export default {
    components: { BorrowForm },
    data() {
        return {
            borrows: [],
            searchQuery: "",
            selectedStatus: "",   // lọc theo trạng thái
            selectedYear: "",     // lọc theo năm mượn
            selectedReader: "",   // lọc theo độc giả (optional)

            loading: false,
            showForm: false,
            editingBorrow: null,
            currentPage: 1,
            itemsPerPage: 5,

            selectedBorrow: null,
            showDetailModal: false,
        };
    },

    computed: {
        uniqueStatuses() {
            return [...new Set(this.borrows.map(b => b.trangThai).filter(Boolean))];
        },
        uniqueYears() {
            return [...new Set(this.borrows.map(b => {
                if (!b.ngayMuon) return null;
                return new Date(b.ngayMuon).getFullYear();
            }).filter(Boolean))].sort((a, b) => b - a);
        },

        filteredBorrows() {
            const q = this.searchQuery.trim().toLowerCase();

            return this.borrows.filter((b) => {
                const maMuon = b.maMuon || "";
                const tenSach = b.bookInfo?.tenSach?.toLowerCase() || "";
                const docGia = b.docGiaInfo ? (b.docGiaInfo.hoLot + " " + b.docGiaInfo.ten).toLowerCase() : "";

                // ✅ lọc theo từ khóa
                const matchesSearch = !q || maMuon.includes(q) || tenSach.includes(q) || docGia.includes(q);

                // ✅ lọc theo trạng thái
                const matchesStatus = !this.selectedStatus || b.trangThai === this.selectedStatus;

                // ✅ lọc theo năm mượn
                const borrowYear = b.ngayMuon ? new Date(b.ngayMuon).getFullYear() : null;
                const matchesYear = !this.selectedYear || borrowYear == this.selectedYear;

                return matchesSearch && matchesStatus && matchesYear;
            });
        },

        totalPages() {
            return Math.ceil(this.filteredBorrows.length / this.itemsPerPage);
        },
        paginatedBorrows() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredBorrows.slice(start, start + this.itemsPerPage);
        },
    },

    methods: {
        resetFilters() {
            this.searchQuery = "";
            this.selectedStatus = "";
            this.selectedYear = "";
            this.currentPage = 1;
        },

        statusClass(status) {
            switch (status) {
                case "Sẵn sàng": return "badge bg-secondary";
                case "Chờ duyệt": return "badge bg-warning text-dark";
                case "Đã duyệt": return "badge bg-info text-dark";
                case "Đang mượn": return "badge bg-primary text-light";
                case "Đã trả": return "badge bg-success";
                case "Quá hạn": return "badge bg-danger"; // <--- mới
                default: return "badge bg-light";
            }
        }
        ,
        async fetchBorrows() {
            this.loading = true;
            try {
                this.borrows = await borrowService.getAllDetails();
            } catch (err) {
                this.borrows = [];
                console.error("Lỗi tải borrow:", err);
            } finally {
                this.loading = false;
            }
        },
        prevPage() { if (this.currentPage > 1) this.currentPage--; },
        nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
        openAddModal() { this.editingBorrow = null; this.showForm = true; },
        openEditModal(borrow) { this.editingBorrow = { ...borrow }; this.showForm = true; },
        closeForm() { this.showForm = false; this.editingBorrow = null; },

        async handleSave(borrow) {
            try {
                if (borrow._id) {
                    await borrowService.update(borrow._id, borrow);
                    this.showSwal("✅ Thành công", "Cập nhật phiếu mượn thành công!", "success");
                } else {
                    await borrowService.create(borrow);
                    this.showSwal("✅ Thành công", "Thêm phiếu mượn mới!", "success");
                }
            } catch (err) {
                const message = err.response?.data?.message || "Không thể lưu phiếu mượn!";
                console.log(message)
                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: message,
                    toast: true,
                    position: "top-end",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
            finally {
                this.closeForm();
                this.fetchBorrows();
            }
        }


        ,
        async deleteBorrow(id) {
            const borrow = this.borrows.find(b => b._id === id);
            if (!borrow) return;

            if (borrow.trangThai === "Chờ duyệt" || borrow.trangThai === "Đang mượn") {
                return this.showSwal("⚠️ Không thể xóa",
                    "Phiếu mượn đang chờ duyệt hoặc đang mượn không thể xóa.",
                    "warning");
            }

            const result = await Swal.fire({
                title: "Bạn có chắc chắn?",
                text: "Phiếu mượn sẽ bị xóa và không thể khôi phục!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                customClass: { popup: "swal-popup-responsive" },
            });

            if (!result.isConfirmed) return;

            try {
                const response = await borrowService.delete(id);
                this.showSwal("🗑️ Đã xóa!", "Phiếu mượn đã được xóa.", "success");

            } catch (err) {
                console.error("Lỗi khi xóa phiếu mượn:", err);

                const errorMessage =
                    err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi xóa phiếu mượn.";

                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: errorMessage,
                    toast: true,
                    position: "top-end",
                });
            } finally {
                this.fetchBorrows();
            }
        }

        ,
        async openDetailModal(borrow) {
            try {
                this.selectedBorrow = await borrowService.getDetail(borrow._id);
                this.showDetailModal = true;
            } catch (err) {
                console.error(err);
                this.showSwal("❌ Lỗi", "Không thể tải chi tiết phiếu mượn!", "error");
            }
        },
        // Trong methods
        async handleDelete(borrow) {
            try {
                await borrowService.delete(borrow._id);
                await this.fetchBorrows();
                this.closeForm();
                Swal.fire({
                    icon: "success",
                    title: "Đã xóa!",
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });
            } catch (err) {
                console.error(err);
                Swal.fire("❌ Lỗi!", "Không thể xóa phiếu mượn.", "error");
            }
        }
        ,
        closeDetailModal() { this.selectedBorrow = null; this.showDetailModal = false; },
        showSwal(title, text, icon) {
            Swal.fire({
                title,
                text,
                icon,
                confirmButtonText: "OK",
                customClass: { popup: "swal-popup-responsive" },
            });
        },
    },
    mounted() { this.fetchBorrows(); },
};
</script>

<style scoped>
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
    padding: 10px;
}

.modal-content {
    background: white;
    border-radius: 10px;
    width: 600px;
    max-width: 95%;
    max-height: 80vh;
    overflow-y: auto;
    padding: 25px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.detail-grid {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 15px;
}

.detail-section {
    flex: 1 1 45%;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #ddd;
}

.detail-section h6 {
    margin-bottom: 10px;
    font-weight: 600;
    color: #333;
}

.detail-section p {
    margin: 4px 0;
}

@media (max-width: 768px) {
    .modal-content {
        width: 100%;
        padding: 20px;
    }

    .detail-grid {
        flex-direction: column;
    }

    .detail-section {
        flex: 1 1 100%;
    }
}

/* SweetAlert responsive */
.swal-popup-responsive {
    width: 90% !important;
    max-width: 400px !important;
    font-size: 14px !important;
}

@media(min-width:768px) {
    .swal-popup-responsive {
        width: 400px !important;
        font-size: 16px !important;
    }
}

/* Toast nhỏ cho mobile */
.swal2-toast {
    font-size: 13px !important;
    min-width: 180px !important;
}

@media (max-width:480px) {
    .swal2-toast {
        font-size: 12px !important;
        min-width: 150px !important;
    }
}
</style>
