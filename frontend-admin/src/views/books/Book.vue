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

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import BookService from "@/services/book.service";
import BookForm from "@/components/Book/BookForm.vue";

const books = ref([]);
const searchQuery = ref("");
const loading = ref(false);

const showForm = ref(false);
const editingBook = ref(null);

// === Phân trang ===
const currentPage = ref(1);
const itemsPerPage = 5;

const filteredBooks = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return books.value;
    return books.value.filter((b) => {
        const name = b.tenSach ? b.tenSach.toLowerCase() : "";
        const author = b.tacGia ? b.tacGia.toLowerCase() : "";
        return name.includes(q) || author.includes(q);
    });
});

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / itemsPerPage));

const paginatedBooks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredBooks.value.slice(start, end);
});

// search reset về trang 1
watch(searchQuery, () => { currentPage.value = 1; });

function prevPage() { if (currentPage.value > 1) currentPage.value--; }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++; }

// === API CRUD ===
async function fetchBooks() {
    loading.value = true;
    try {
        books.value = await BookService.getAll();
    } catch (err) {
        console.error("Lỗi tải sách:", err);
        books.value = [];
    } finally {
        loading.value = false;
    }
}

function openAddModal() {
    editingBook.value = null;
    showForm.value = true;
}
function openEditModal(book) {
    editingBook.value = { ...book };
    showForm.value = true;
}
function closeForm() {
    showForm.value = false;
    editingBook.value = null;
}

async function handleSave(book) {
    try {
        if (book._id) {
            await BookService.update(book._id, book);
        } else {
            await BookService.create(book);
        }
        await fetchBooks();
        closeForm();
    } catch (err) {
        console.error("Lỗi lưu sách:", err);
    }
}

async function deleteBook(id) {
    if (confirm("Bạn có chắc muốn xóa sách này không?")) {
        try {
            await BookService.delete(id);
            await fetchBooks();
        } catch (err) {
            console.error("Lỗi khi xóa:", err);
            alert("❌ Xóa thất bại!");
        }
    }
}

onMounted(fetchBooks);
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
