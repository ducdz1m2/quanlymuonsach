<template>
    <div class="p-4">
        <h1 class="mb-4">📚 Quản lý sách</h1>

        <!-- Thanh công cụ -->
        <div class="d-flex justify-content-between mb-3">
            <input type="text" class="form-control w-25" placeholder="🔍 Tìm kiếm sách hoặc tác giả..."
                v-model="searchQuery" />
            <button class="btn btn-primary" @click="openAddModal">+ Thêm sách</button>
        </div>

        <!-- Bảng danh sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Tên sách</th>
                        <th>Tác giả</th>
                        <th>Số lượng</th>
                        <th>Năm xuất bản</th>
                        <th>Đơn giá</th>
                        <th>Mô tả</th>
                        <th>Ảnh bìa</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="book in paginatedBooks" :key="book._id">
                        <td class="text-start">{{ book.tenSach }}</td>
                        <td class="text-start">{{ book.tacGia || "Không rõ" }}</td>
                        <td>{{ book.soQuyen }}</td>
                        <td>{{ book.namXuatBan }}</td>
                        <td>{{ book.donGia != null ? book.donGia.toLocaleString() + ' ₫' : '-' }}</td>
                        <td class="text-start">{{ book.moTa || "Chưa có mô tả" }}</td>
                        <td>
                            <img :src="book.anhBia || '/images/default-book.png'" width="60" height="80"
                                class="rounded shadow-sm" />
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(book)">Sửa</button>
                            <button class="btn btn-sm btn-danger" @click="deleteBook(book._id)">Xóa</button>
                        </td>
                    </tr>
                    <tr v-if="!loading && paginatedBooks.length === 0">
                        <td colspan="8">Không có sách phù hợp</td>
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

        <!-- Modal thêm/sửa -->
        <div v-if="showForm" class="modal-backdrop">
            <div class="modal-content p-4">
                <h5>{{ editingBook ? "✏️ Sửa sách" : "➕ Thêm sách" }}</h5>
                <BookForm :book="editingBook" @save="handleSave" @cancel="closeForm" />
            </div>
        </div>
    </div>
</template>
<script>
import BookService from "@/services/book.service";
import BookForm from "@/components/books/BookForm.vue";

export default {
    components: { BookForm },

    data() {
        return {
            books: [],
            searchQuery: "",
            loading: false,

            showForm: false,
            editingBook: null,

            // phân trang
            currentPage: 1,
            itemsPerPage: 5,
        };
    },

    computed: {
        filteredBooks() {
            const q = this.searchQuery.trim().toLowerCase();
            if (!q) return this.books;
            return this.books.filter((b) => {
                const name = b.tenSach ? b.tenSach.toLowerCase() : "";
                const author = b.tacGia ? b.tacGia.toLowerCase() : "";
                return name.includes(q) || author.includes(q);
            });
        },

        totalPages() {
            return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        },

        paginatedBooks() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredBooks.slice(start, end);
        },
    },

    watch: {
        searchQuery() {
            this.currentPage = 1;
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
            } catch (err) {
                console.error("Lỗi lưu sách:", err);
            }
        },

        async deleteBook(id) {
            if (confirm("Bạn có chắc muốn xóa sách này không?")) {
                try {
                    await BookService.delete(id);
                    await this.fetchBooks();
                } catch (err) {
                    console.error("Lỗi khi xóa:", err);
                    alert("❌ Xóa thất bại!");
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
    /* nhỏ hơn */
    max-height: 80vh;
    /* không quá cao */
    overflow-y: auto;
    /* có cuộn nếu nhiều input */
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
