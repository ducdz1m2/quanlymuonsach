<template>
    <div class="p-4">
        <h1 class="mb-4">📚 Quản lý độc giả</h1>

        <!-- Thanh công cụ -->
        <div class="d-flex justify-content-between mb-3">
            <input type="text" class="form-control w-25" placeholder="🔍 Tìm kiếm độc giả..." v-model="searchQuery" />
            <button class="btn btn-primary" @click="openAddModal">+ Thêm độc giả</button>
        </div>

        <!-- Bảng danh sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Mã độc giả</th>
                        <th>Họ lót</th>
                        <th>Tên</th>
                        <th>Ngày sinh</th>
                        <th>Phái</th>
                        <th>Địa chỉ</th>
                        <th>Điện thoại</th>

                        <th>Tiền đã thu (VND)</th>
                        <th>Tiền sắp thu (VND)</th>

                        <th>Ảnh</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="reader in paginatedReaders" :key="reader._id">

                        <td class="text-start">{{ reader.maDG }}</td>
                        <td class="text-start">{{ reader.hoLot }}</td>
                        <td class="text-start">{{ reader.ten }}</td>
                        <td>{{ reader.ngaySinh }}</td>
                        <td>{{ reader.phai }}</td>
                        <td class="text-start">{{ reader.diaChi }}</td>
                        <td>{{ reader.dienThoai }}</td>

                        <td class="text-success">{{ reader.totalCollected != null ?
                            reader.totalCollected.toLocaleString() + ' ₫' : '-' }}
                        </td>
                        <td class="text-warning">{{ reader.totalPending != null ? reader.totalPending.toLocaleString() +
                            ' ₫' : '-' }}</td>

                        <td>
                            <img :src="reader.anh || '/images/default-reader.png'" width="60" height="80"
                                class="rounded shadow-sm" />
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(reader)">Sửa</button>
                            <button class="btn btn-sm btn-danger" @click="confirmDelete(reader)">Xóa</button>
                        </td>
                    </tr>
                    <tr v-if="!loading && paginatedReaders.length === 0">
                        <td colspan="8">Không có độc giả phù hợp</td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="8">⏳ Đang tải dữ liệu...</td>
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
                <h5>{{ editingReader ? "✏️ Sửa độc giả" : "➕ Thêm độc giả" }}</h5>
                <ReaderForm :reader="editingReader" @save="handleSave" @cancel="closeForm" @delete="handleDelete" />
            </div>
        </div>
    </div>
</template>

<script>
import ReaderForm from "@/components/readers/ReaderForm.vue";
import readerService from "@/services/reader.service";
import Swal from "sweetalert2";

export default {
    components: { ReaderForm },

    data() {
        return {
            readers: [],
            searchQuery: "",
            loading: false,

            showForm: false,
            editingReader: null,

            currentPage: 1,
            itemsPerPage: 5,
        };
    },

    computed: {
        filteredReaders() {
            const q = this.searchQuery.trim().toLowerCase();
            if (!q) return this.readers;

            return this.readers.filter((r) => {

                const maDG = r.maDG ? r.maDG.toLowerCase() : "";
                const hoLot = r.hoLot ? r.hoLot.toLowerCase() : "";
                const ten = r.ten ? r.ten.toLowerCase() : "";
                const diaChi = r.diaChi ? r.diaChi.toLowerCase() : "";
                const dienThoai = r.dienThoai ? r.dienThoai.toLowerCase() : "";

                return (
                    maDG.includes(q) ||
                    hoLot.includes(q) ||
                    ten.includes(q) ||
                    diaChi.includes(q) ||
                    dienThoai.includes(q)
                );
            });
        },

        totalPages() {
            return Math.ceil(this.filteredReaders.length / this.itemsPerPage);
        },

        paginatedReaders() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredReaders.slice(start, end);
        },
    },

    methods: {
        async fetchReaders() {
            this.loading = true;
            try {
                this.readers = await readerService.getAll();
            } catch (err) {
                this.readers = [];
                console.error("Lỗi tải độc giả:", err);
            } finally {
                this.loading = false;
            }
        },
        async fetchReaders() {
            this.loading = true;
            try {
                const readers = await readerService.getAll();

                // Lấy tiền cho từng độc giả
                const readersWithPayment = await Promise.all(
                    readers.map(async (r) => {
                        try {
                            const payment = await readerService.getPayment(r._id);
                            // payment = { totalCollected, totalPending }
                            return {
                                ...r,
                                totalCollected: payment.totalCollected,
                                totalPending: payment.totalPending
                            };
                        } catch (err) {
                            console.error(`Lỗi lấy tiền cho độc giả ${r._id}:`, err);
                            return { ...r, totalCollected: 0, totalPending: 0 };
                        }
                    })
                );

                this.readers = readersWithPayment;
            } catch (err) {
                this.readers = [];
                console.error("Lỗi tải độc giả:", err);
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
            this.editingReader = null;
            this.showForm = true;
        },

        openEditModal(reader) {
            this.editingReader = { ...reader };
            this.showForm = true;
        },

        closeForm() {
            this.showForm = false;
            this.editingReader = null;
        },

        async handleSave(reader) {
            try {
                if (reader._id) {
                    await readerService.update(reader._id, reader);
                    await Swal.fire({
                        icon: "success",
                        title: "Cập nhật độc giả thành công!",
                        showConfirmButton: false,
                        timer: 1500,
                        toast: true,
                        position: "top-end",
                    });
                } else {
                    await readerService.create(reader);
                    await Swal.fire({
                        icon: "success",
                        title: "Thêm độc giả thành công!",
                        showConfirmButton: false,
                        timer: 1500,
                        toast: true,
                        position: "top-end",
                    });
                }
            } catch (err) {
                console.error("Lỗi lưu độc giả:", err);
                await Swal.fire("❌ Lỗi!", "Không thể lưu độc giả.", "error");
            } finally {
                this.closeForm();
                this.fetchReaders();
            }
        },
        async handleDelete(reader) {
            try {
                const response = await readerService.delete(reader._id);

                // Xóa thành công
                await this.fetchReaders();
                this.closeForm();

                Swal.fire({
                    icon: "success",
                    title: "Đã xóa độc giả",
                    text: response?.message || "Xóa độc giả thành công.",
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });
            } catch (err) {
                console.error("Lỗi khi xóa độc giả:", err);

                // Xử lý lỗi từ backend
                const errorMessage =
                    err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi xóa độc giả. Vui lòng thử lại.";

                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: errorMessage,
                    toast: true,
                    position: "top-end",
                });
            } finally {
                await this.fetchReaders(); // Luôn làm mới danh sách
            }
        },

        async confirmDelete(reader) {
            const result = await Swal.fire({
                title: "Bạn có chắc muốn xóa?",
                text: `Độc giả: ${reader.hoLot} ${reader.ten}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            });

            if (!result.isConfirmed) return;

            await this.handleDelete(reader);
        },
    },

    mounted() {
        this.fetchReaders();
    },
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
