<template>
    <div class="p-4">
        <h1 class="mb-4">📚 Danh sách sách</h1>

        <!-- Thanh công cụ tìm kiếm và lọc -->
        <div class="row g-2 mb-3 align-items-center">
            <div class="col-auto">
                <input
                    type="text"
                    class="form-control"
                    placeholder="🔍 Tìm kiếm sách hoặc tác giả..."
                    v-model="searchQuery"
                />
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="selectedCategory">
                    <option value="">📂 Tất cả thể loại</option>
                    <option v-for="c in uniqueCategories" :key="c" :value="c">
                        {{ c }}
                    </option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="selectedYear">
                    <option value="">📅 Tất cả năm</option>
                    <option v-for="y in uniqueYears" :key="y" :value="y">
                        {{ y }}
                    </option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="selectedPublisher">
                    <option value="">🏢 Tất cả NXB</option>
                    <option v-for="p in uniquePublishers" :key="p" :value="p">
                        {{ p }}
                    </option>
                </select>
            </div>

            <!-- Sắp xếp theo đơn giá -->
            <div class="col-auto">
                <select class="form-select" v-model="sortBy">
                    <option value="">🔀 Không sắp xếp</option>
                    <option value="price">💰 Sắp xếp theo đơn giá</option>
                </select>
            </div>

            <div class="col-auto">
                <select
                    class="form-select"
                    v-model="sortOrder"
                    :disabled="!sortBy"
                >
                    <option value="desc">⬇️ Cao → Thấp</option>
                    <option value="asc">⬆️ Thấp → Cao</option>
                </select>
            </div>

            <!-- Nút reset -->
            <div class="col-auto">
                <button class="btn btn-secondary" @click="resetFilters">
                    ↺ Reset
                </button>
            </div>
        </div>

        <!-- Bảng danh sách sách -->
        <div class="table-responsive">
            <table
                class="table table-bordered table-hover text-center align-middle"
            >
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
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="book in paginatedBooks" :key="book._id">
                        <td class="text-start">{{ book.maSach }}</td>
                        <td class="text-start">{{ book.tenSach }}</td>
                        <td class="text-start">
                            {{ book.theLoai || "Chưa có" }}
                        </td>
                        <td class="text-start">
                            {{ book.tacGia || "Không rõ" }}
                        </td>
                        <td>{{ book.soQuyen }}</td>
                        <td>{{ book.namXuatBan }}</td>
                        <td>
                            {{
                                book.donGia != null
                                    ? book.donGia.toLocaleString() + " ₫"
                                    : "-"
                            }}
                        </td>
                        <td class="text-start">
                            {{ book.moTa || "Chưa có mô tả" }}
                        </td>
                        <td class="text-start">
                            {{ book.tenNXB || "Không xác định" }}
                        </td>
                        <td>
                            <img
                                :src="book.anhBia || '/images/default-book.png'"
                                width="60"
                                height="80"
                                class="rounded shadow-sm"
                            />
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
        <div
            class="d-flex justify-content-center mt-3 gap-2"
            v-if="totalPages > 1"
        >
            <button
                class="btn btn-outline-primary"
                :disabled="currentPage === 1"
                @click="prevPage"
            >
                ◀ Trước
            </button>
            <span class="align-self-center"
                >Trang {{ currentPage }} / {{ totalPages || 1 }}</span
            >
            <button
                class="btn btn-outline-primary"
                :disabled="currentPage === totalPages"
                @click="nextPage"
            >
                Sau ▶
            </button>
        </div>
    </div>
</template>

<script>
import BookService from "@/services/book.service"; // Giả sử BookService đã có sẵn và phù hợp

export default {
    data() {
        return {
            books: [],
            searchQuery: "",
            selectedCategory: "",
            selectedYear: "",
            selectedPublisher: "",
            sortBy: "", // "price"
            sortOrder: "desc", // "asc" | "desc"
            loading: false,
            currentPage: 1,
            itemsPerPage: 5,
        };
    },
    computed: {
        uniqueCategories() {
            return [
                ...new Set(this.books.map((b) => b.theLoai).filter(Boolean)),
            ];
        },
        uniqueYears() {
            return [
                ...new Set(this.books.map((b) => b.namXuatBan).filter(Boolean)),
            ].sort((a, b) => b - a);
        },
        uniquePublishers() {
            return [
                ...new Set(this.books.map((b) => b.tenNXB).filter(Boolean)),
            ];
        },
        filteredBooks() {
            const q = this.searchQuery.trim().toLowerCase();

            let result = this.books.filter((b) => {
                const name = b.tenSach?.toLowerCase() || "";
                const author = b.tacGia?.toLowerCase() || "";
                const code = b.maSach?.toLowerCase() || "";

                const matchesSearch =
                    !q ||
                    name.includes(q) ||
                    author.includes(q) ||
                    code.includes(q);
                const matchesCategory =
                    !this.selectedCategory ||
                    b.theLoai === this.selectedCategory;
                const matchesYear =
                    !this.selectedYear || b.namXuatBan == this.selectedYear;
                const matchesPublisher =
                    !this.selectedPublisher ||
                    b.tenNXB === this.selectedPublisher;

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesYear &&
                    matchesPublisher
                );
            });

            // Sắp xếp theo đơn giá
            if (this.sortBy === "price") {
                result.sort((a, b) => {
                    const valA = a.donGia || 0;
                    const valB = b.donGia || 0;
                    return this.sortOrder === "asc" ? valA - valB : valB - valA;
                });
            }

            return result;
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
        resetFilters() {
            this.searchQuery = "";
            this.selectedCategory = "";
            this.selectedYear = "";
            this.selectedPublisher = "";
            this.sortBy = "";
            this.sortOrder = "desc";
            this.currentPage = 1;
        },
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
</style>
