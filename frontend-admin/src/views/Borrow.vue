<template>
    <div class="p-4">
        <h1 class="mb-4">📖 Quản lý phiếu mượn</h1>

        <!-- Thanh công cụ -->
        <div class="d-flex justify-content-between mb-3">
            <input type="text" class="form-control w-25" placeholder="🔍 Tìm kiếm theo tên sách hoặc tên độc giả..."
                v-model="searchQuery" />
            <button class="btn btn-primary" @click="openAddModal">+ Thêm phiếu mượn</button>
        </div>

        <!-- Bảng danh sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Tên sách</th>
                        <th>Độc giả</th>
                        <th>Ngày mượn</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="borrow in paginatedBorrows" :key="borrow._id">
                        <td class="text-start">{{ borrow.bookInfo?.tenSach || borrow.bookId }}</td>
                        <td class="text-start">
                            {{ borrow.docGiaInfo ? borrow.docGiaInfo.hoLot + ' ' + borrow.docGiaInfo.ten :
                                borrow.docGiaId }}
                        </td>
                        <td>{{ borrow.ngayMuon }}</td>
                        <td>{{ borrow.ngayTra }}</td>
                        <td>
                            <span :class="statusClass(borrow.trangThai)">
                                {{ statusLabel(borrow.trangThai) }}
                            </span>
                        </td>

                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(borrow)">Sửa</button>
                            <button class="btn btn-sm btn-danger" @click="deleteBorrow(borrow._id)">Xóa</button>
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

        <!-- Modal -->
        <div v-if="showForm" class="modal-backdrop">
            <div class="modal-content p-4">
                <h5>{{ editingBorrow ? "✏️ Sửa phiếu mượn" : "➕ Thêm phiếu mượn" }}</h5>
                <BorrowForm :borrow="editingBorrow" @save="handleSave" @cancel="closeForm" />
            </div>
        </div>
    </div>
</template>

<script>
import BorrowForm from "@/components/borrows/BorrowForm.vue";
import borrowService from "@/services/borrow.service";

export default {
    components: { BorrowForm },

    data() {
        return {
            borrows: [],
            searchQuery: "",
            loading: false,

            showForm: false,
            editingBorrow: null,

            currentPage: 1,
            itemsPerPage: 5,
        };
    },

    computed: {
        filteredBorrows() {
            const q = this.searchQuery.trim().toLowerCase();
            if (!q) return this.borrows;

            return this.borrows.filter((b) => {
                const tenSach = b.bookInfo?.tenSach?.toLowerCase() || "";
                const docGia = b.docGiaInfo ? (b.docGiaInfo.hoLot + " " + b.docGiaInfo.ten).toLowerCase() : "";
                return tenSach.includes(q) || docGia.includes(q);
            });
        },

        totalPages() {
            return Math.ceil(this.filteredBorrows.length / this.itemsPerPage);
        },

        paginatedBorrows() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredBorrows.slice(start, end);
        },
    },

    methods: {
        statusLabel(status) {
            switch (status) {
                case "san_sang": return "Sẵn sàng";
                case "cho_duyet": return "Chờ duyệt";
                case "da_duyet": return "Đã duyệt";
                case "dang_muon": return "Đang mượn";
                case "da_tra": return "Đã trả";
                default: return status;
            }
        },
        statusClass(status) {
            switch (status) {
                case "san_sang": return "badge bg-secondary";
                case "cho_duyet": return "badge bg-warning text-dark";
                case "da_duyet": return "badge bg-info text-dark";
                case "dang_muon": return "badge bg-danger";
                case "da_tra": return "badge bg-success";
                default: return "badge bg-light";
            }
        },
        async fetchBorrows() {
            this.loading = true;
            try {
                // Lấy danh sách có kèm detail (nếu backend hỗ trợ endpoint /api/borrows/detail/all thì tốt hơn)
                const data = await borrowService.getAll();
                // Sau đó load thêm detail từng cái
                const details = await Promise.all(data.map(item => borrowService.getDetail(item._id)));
                this.borrows = details;
            } catch (err) {
                this.borrows = [];
                console.error("Lỗi tải borrow:", err);
            } finally {
                this.loading = false;
            }
        },

        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },

        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },

        openAddModal() {
            this.editingBorrow = null;
            this.showForm = true;
        },

        openEditModal(borrow) {
            this.editingBorrow = { ...borrow };
            this.showForm = true;
        },

        closeForm() {
            this.showForm = false;
            this.editingBorrow = null;
        },

        async handleSave(borrow) {
            try {
                if (borrow._id) {
                    await borrowService.update(borrow._id, borrow);
                } else {
                    await borrowService.create(borrow);
                }
            } catch (err) {
                console.error("Lỗi lưu borrow:", err);
            } finally {
                this.closeForm();
                this.fetchBorrows();
            }
        },

        async deleteBorrow(id) {
            try {
                await borrowService.delete(id);
                await this.fetchBorrows();
            } catch (err) {
                console.error("Lỗi xóa borrow:", err);
                alert("❌ Xóa thất bại!");
            }
        },
    },

    mounted() {
        this.fetchBorrows();
    },
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
