<template>
    <div class="p-4">
        <h1 class="mb-4">📚 Quản lý sách</h1>

        <!-- Thanh công cụ -->
        <div class="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
            <input type="text" class="form-control w-25" placeholder="🔍 Tìm kiếm sách hoặc tác giả..."
                v-model="searchQuery" />

            <!-- Filter -->
            <select class="form-select w-auto" v-model="selectedCategory">
                <option value="">📂 Tất cả thể loại</option>
                <option v-for="c in uniqueCategories" :key="c" :value="c">{{ c }}</option>
            </select>

            <select class="form-select w-auto" v-model="selectedYear">
                <option value="">📅 Tất cả năm</option>
                <option v-for="y in uniqueYears" :key="y" :value="y">{{ y }}</option>
            </select>

            <select class="form-select w-auto" v-model="selectedPublisher">
                <option value="">🏢 Tất cả NXB</option>
                <option v-for="p in uniquePublishers" :key="p" :value="p">{{ p }}</option>
            </select>

            <button class="btn btn-primary" @click="openAddModal">+ Thêm sách</button>
        </div>


        <!-- Bảng danh sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Mã sách</th>
                        <th>Tên sách</th>
                        <th>Thể loại</th>
                        <th>Tác giả</th>
                        <th>Số lượng</th>
                        <th>Năm xuất bản</th>
                        <th>Đơn giá</th>
                        <th>Mô tả</th>
                        <th>Nhà xuất bản</th>
                        <th>Ảnh bìa</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="book in paginatedBooks" :key="book._id">

                        <td class="text-start">{{ book.maSach }}</td>
                        <td class="text-start">{{ book.tenSach }}</td>
                        <td class="text-start">{{ book.theLoai || "Chưa có" }}</td>
                        <td class="text-start">{{ book.tacGia || "Không rõ" }}</td>
                        <td>{{ book.soQuyen }}</td>
                        <td>{{ book.namXuatBan }}</td>
                        <td>{{ book.donGia != null ? book.donGia.toLocaleString() + ' ₫' : '-' }}</td>
                        <td class="text-start">{{ book.moTa || "Chưa có mô tả" }}</td>
                        <td class="text-start">{{ book.tenNXB || "Không xác định" }}</td>
                        <td>
                            <img :src="book.anhBia || '/images/default-book.png'" width="60" height="80"
                                class="rounded shadow-sm" />
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(book)">
                                Sửa
                            </button>
                            <button class="btn btn-sm btn-danger" @click="deleteBook(book._id)">
                                Xóa
                            </button>
                        </td>
                    </tr>

                    <tr v-if="!loading && paginatedBooks.length === 0">
                        <td colspan="10">Không có sách phù hợp</td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="10">⏳ Đang tải dữ liệu...</td>
                    </tr>
                </tbody>

            </table>
        </div>

        <!-- Phân trang -->
        <div class="d-flex justify-content-center mt-3 gap-2" v-if="totalPages > 1">
            <button class="btn btn-outline-primary" :disabled="currentPage === 1" @click="prevPage">
                ◀ Trước
            </button>
            <span class="align-self-center">Trang {{ currentPage }} / {{ totalPages || 1 }}</span>
            <button class="btn btn-outline-primary" :disabled="currentPage === totalPages" @click="nextPage">
                Sau ▶
            </button>
        </div>

        <!-- Modal thêm/sửa -->
        <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
            <div class="modal-content p-4">
                <h5>{{ editingBook ? "✏️ Sửa sách" : "➕ Thêm sách" }}</h5>
                <BookForm :book="editingBook" @save="handleSave" @delete="handleDelete" @cancel="closeForm" />
            </div>
        </div>
    </div>
</template>

<script>
import BookService from "@/services/book.service";
import BookForm from "@/components/books/BookForm.vue";
import Swal from "sweetalert2";

export default {
    components: { BookForm },

    data() {
        return {
            books: [],
            searchQuery: "",
            selectedCategory: "",   // lọc theo thể loại
            selectedYear: "",       // lọc theo năm xuất bản
            selectedPublisher: "",  // lọc theo NXB
            loading: false,
            showForm: false,
            editingBook: null,
            currentPage: 1,
            itemsPerPage: 5,
        };
    },


    computed: {
        uniqueCategories() {
            return [...new Set(this.books.map(b => b.theLoai).filter(Boolean))];
        },
        uniqueYears() {
            return [...new Set(this.books.map(b => b.namXuatBan).filter(Boolean))].sort((a, b) => b - a);
        },
        uniquePublishers() {
            return [...new Set(this.books.map(b => b.tenNXB).filter(Boolean))];
        },

        filteredBooks() {
            const q = this.searchQuery.trim().toLowerCase();

            return this.books.filter((b) => {
                const name = b.tenSach?.toLowerCase() || "";
                const author = b.tacGia?.toLowerCase() || "";
                const code = b.maSach?.toLowerCase() || "";

                // ✅ filter text
                const matchesSearch = !q || name.includes(q) || author.includes(q) || code.includes(q);

                // ✅ filter theo dropdown
                const matchesCategory = !this.selectedCategory || b.theLoai === this.selectedCategory;
                const matchesYear = !this.selectedYear || b.namXuatBan == this.selectedYear;
                const matchesPublisher = !this.selectedPublisher || b.tenNXB === this.selectedPublisher;

                return matchesSearch && matchesCategory && matchesYear && matchesPublisher;
            });
        },

        totalPages() {
            return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        },
        paginatedBooks() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredBooks.slice(start, start + this.itemsPerPage);
        },
    },


    methods: {
        async fetchBooks() {
            this.loading = true;
            try {
                this.books = await BookService.getAll();
            } catch (err) {
                console.error("Lỗi tải sách:", err);
                this.books = [];
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
            this.editingBook = null;
            this.showForm = true;
        },
        openEditModal(book) {
            this.editingBook = { ...book };
            this.showForm = true;
        },
        closeForm() {
            this.showForm = false;
            this.editingBook = null;
        },

        async handleSave(book) {
            try {
                if (book._id) {
                    await BookService.update(book._id, book);
                } else {
                    await BookService.create(book);
                }
                await this.fetchBooks();
                this.closeForm();

                Swal.fire({
                    icon: "success",
                    title: book._id ? "Cập nhật thành công!" : "Thêm thành công!",
                    text: book.tenSach,
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: "top-end",
                    customClass: { popup: "swal-popup-responsive" },
                });
            } catch (err) {
                console.error("Lỗi lưu sách:", err);
                Swal.fire("❌ Lỗi!", "Không thể lưu sách.", "error");
            }
        },

        async deleteBook(id) {
            const book = this.books.find((b) => b._id === id);
            const result = await Swal.fire({
                title: "Bạn có chắc muốn xóa?",
                text: `Sách: ${book.tenSach}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                customClass: { popup: "swal-popup-responsive" },
            });

            if (result.isConfirmed) {
                try {
                    await BookService.delete(id);
                    await this.fetchBooks();
                    Swal.fire({
                        icon: "success",
                        title: "Đã xóa!",
                        timer: 1500,
                        showConfirmButton: false,
                        toast: true,
                        position: "top-end",
                        customClass: { popup: "swal-popup-responsive" },
                    });
                } catch (err) {
                    console.error("Lỗi khi xóa:", err);

                    // ✅ Thêm check lỗi từ backend
                    if (err.response && err.response.data && err.response.data.message) {
                        Swal.fire("❌ Không thể xóa!", err.response.data.message, "warning");
                    } else {
                        Swal.fire("❌ Lỗi!", "Không thể xóa sách.", "error");
                    }
                }
            }
        },

        async handleDelete(book) {
            try {
                await BookService.delete(book._id);
                await this.fetchBooks();
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

                if (err.response && err.response.data && err.response.data.message) {
                    Swal.fire("❌ Không thể xóa!", err.response.data.message, "warning");
                } else {
                    Swal.fire("❌ Lỗi!", "Không thể xóa sách.", "error");
                }
            }
        },
    },

    mounted() {
        this.fetchBooks();
    },
};
</script>

<style scoped>
.text-start {
    text-align: left;
}

.table img {
    object-fit: cover;
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

@media (max-width: 768px) {
    .modal-content {
        width: 100%;
        padding: 20px;
    }
}

/* SweetAlert responsive */
.swal-popup-responsive {
    width: 90% !important;
    max-width: 400px !important;
    font-size: 14px !important;
}

@media (min-width: 768px) {
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

@media (max-width: 480px) {
    .swal2-toast {
        font-size: 12px !important;
        min-width: 150px !important;
    }
}
</style>
