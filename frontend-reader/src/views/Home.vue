<template>
    <div class="p-4">
        <h1 class="mb-4">📚 Trang chủ - Thư viện</h1>

        <!-- Toolbar: search + filters + xem đã tiêu -->
        <div class="row g-2 mb-3 align-items-center">
            <div class="col-auto">
                <input type="text" class="form-control" placeholder="🔍 Tìm sách, tác giả hoặc mã..."
                    v-model="searchQuery" />
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="selectedCategory">
                    <option value="">📂 Tất cả thể loại</option>
                    <option v-for="c in uniqueCategories" :key="c" :value="c">{{ c }}</option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="selectedYear">
                    <option value="">📅 Tất cả năm</option>
                    <option v-for="y in uniqueYears" :key="y" :value="y">{{ y }}</option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="selectedPublisher">
                    <option value="">🏢 Tất cả NXB</option>
                    <option v-for="p in uniquePublishers" :key="p" :value="p">{{ p }}</option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="sortBy">
                    <option value="">🔀 Không sắp xếp</option>
                    <option value="price">💰 Sắp xếp theo đơn giá</option>
                    <option value="quantity">📦 Sắp xếp theo số lượng</option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="sortOrder" :disabled="!sortBy">
                    <option value="desc">⬇️ Cao → Thấp</option>
                    <option value="asc">⬆️ Thấp → Cao</option>
                </select>
            </div>

            <div class="col-auto">
                <button class="btn btn-secondary" @click="resetFilters">↺ Reset</button>
            </div>

            <div class="col-auto ms-auto">
                <button class="btn btn-outline-info" @click="openPaymentModal" :disabled="!isLoggedIn">
                    💳 Xem đã tiêu
                </button>
            </div>
        </div>

        <!-- Table sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Mã sách</th>
                        <th>Tên sách</th>
                        <th>Thể loại</th>
                        <th>Tác giả</th>
                        <th>Số lượng</th>
                        <th>Năm</th>
                        <th>Đơn giá</th>
                        <th>Mô tả</th>
                        <th>NXB</th>
                        <th>Ảnh</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="book in paginatedBooks" :key="book._id">
                        <td class="text-start">{{ book.maSach }}</td>
                        <td class="text-start">{{ book.tenSach }}</td>
                        <td class="text-start">{{ book.theLoai || "Chưa có" }}</td>
                        <td class="text-start">{{ book.tacGia || "Không rõ" }}</td>
                        <td>{{ book.soQuyen ?? 0 }}</td>
                        <td>{{ book.namXuatBan || "-" }}</td>
                        <td>{{ book.donGia != null ? book.donGia.toLocaleString() + ' ₫' : '-' }}</td>
                        <td class="text-start">{{ book.moTa || "-" }}</td>
                        <td class="text-start">{{ book.tenNXB || "-" }}</td>
                        <td>
                            <img :src="book.anhBia || '/images/default-book.png'" width="60" height="80"
                                class="rounded" />
                        </td>
                        <td>
                            <!-- Nút mượn: chỉ hiển thị khi có sách và đã login -->
                            <button v-if="book.soQuyen > 0 && isLoggedIn" class="btn btn-sm btn-primary me-2"
                                @click="borrowBook(book)">
                                Mượn
                            </button>

                            <!-- Nếu có sách nhưng chưa login -> khuyến khích login -->
                            <button v-else-if="book.soQuyen > 0 && !isLoggedIn"
                                class="btn btn-sm btn-outline-primary me-2" @click="goToLogin"
                                title="Bạn cần đăng nhập để mượn">
                                Đăng nhập để mượn
                            </button>

                            <!-- Hết sách -->
                            <span v-else class="text-muted">Hết sách</span>

                            <!-- nút xem chi tiết mượn (tuỳ chọn) -->
                            <button class="btn btn-sm btn-info ms-2" @click="viewBookDetail(book)">Chi tiết</button>
                        </td>
                    </tr>

                    <tr v-if="!loading && paginatedBooks.length === 0">
                        <td colspan="11">Không có sách phù hợp</td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="11">⏳ Đang tải dữ liệu...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-center mt-3 gap-2" v-if="totalPages > 1">
            <button class="btn btn-outline-primary" :disabled="currentPage === 1" @click="prevPage">◀ Trước</button>
            <span class="align-self-center">Trang {{ currentPage }} / {{ totalPages || 1 }}</span>
            <button class="btn btn-outline-primary" :disabled="currentPage === totalPages" @click="nextPage">Sau
                ▶</button>
        </div>

        <!-- Modal xem đã tiêu -->
        <div v-if="showPaymentModal" class="modal-backdrop" @click.self="closePaymentModal">
            <<div class="modal-dialog">
                <div class="modal-content p-4">
                    <h5>💳 Thông tin chi tiêu</h5>

                    <div v-if="paymentLoading">⏳ Đang tải...</div>
                    <div v-else>
                        <p><strong>Độc giả:</strong> {{ readerInfo?.hoTen || readerInfo?.ten || '—' }}</p>

                        <p><strong>Đã trả:</strong> {{ formatMoney(payment?.totalCollected) }}</p>
                        <p><strong>Đang chờ xử lý:</strong> {{ formatMoney(payment?.totalPending) }}</p>
                        <p class="fw-bold border-top pt-2">
                            <strong>Tổng cộng:</strong>
                            {{ formatMoney((payment?.totalCollected || 0) + (payment?.totalPending || 0)) }}
                        </p>

                        <hr />
                        <h6>📘 Chi tiết mượn sách</h6>
                        <div v-if="payment?.borrows && payment.borrows.length">
                            <ul class="list-unstyled">
                                <li v-for="b in payment.borrows" :key="b._id" class="mb-2">
                                    <strong>{{ b.maMuon }}</strong> — {{ b.trangThai }}
                                    <span v-if="b.penalty > 0"> (Phạt: {{ formatMoney(b.penalty) }})</span>
                                    <br />
                                    <small>Ngày mượn: {{ b.ngayMuon }} | Hạn trả: {{ b.ngayTra }}</small>
                                </li>
                            </ul>
                        </div>
                        <div v-else>Không có dữ liệu chi tiết.</div>
                    </div>

                    <div class="text-end mt-3">
                        <button class="btn btn-secondary" @click="closePaymentModal">Đóng</button>
                    </div>
                </div>
        </div>

    </div>
    <!-- Bảng sách đang mượn -->
    <div v-if="isLoggedIn" class="mt-5">
        <h4 class="mb-3">📘 Sách bạn đang mượn</h4>

        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-secondary">
                    <tr>
                        <th>#</th>
                        <th>Tên sách</th>
                        <th>Ngày mượn</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                        <th>Tổng tiền</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="borrowLoading">
                        <td colspan="6">⏳ Đang tải...</td>
                    </tr>

                    <tr v-else-if="!borrowedBooks.length">
                        <td colspan="6">Bạn chưa mượn sách nào.</td>
                    </tr>

                    <tr v-else v-for="(b, i) in borrowedBooks" :key="b._id">
                        <td>{{ i + 1 }}</td>
                        <td class="text-start">{{ b.bookInfo?.tenSach || 'Không rõ' }}</td>

                        <td>{{ b.ngayMuon }}</td>
                        <td>{{ b.ngayTra }}</td>
                        <td>
                            <span :class="getBadgeClass(b.trangThai)">
                                {{ b.trangThai }}
                            </span>
                        </td>
                        <td>
                            {{ b.totalPayment != null ? b.totalPayment.toLocaleString() + ' ₫' : '-' }}
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-info" @click="viewBookDetail(b.bookInfo)"
                                :disabled="!b.bookInfo">
                                Xem sách
                            </button>

                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Optional: Modal show book details -->
    <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
        <div class="modal-dialog">
            <div class="modal-content p-4">
                <h5>🔎 Chi tiết sách</h5>
                <div v-if="detailLoading">⏳ Đang tải...</div>
                <div v-else-if="selectedBook">
                    <p><strong>{{ selectedBook.tenSach }}</strong></p>
                    <p>{{ selectedBook.moTa || "Không có mô tả" }}</p>
                    <p><strong>Số lượng:</strong> {{ selectedBook.soQuyen ?? 0 }}</p>
                    <p><strong>Đơn giá:</strong> {{ formatMoney(selectedBook.donGia) }}</p>
                </div>
                <div class="text-end mt-3">
                    <button class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
                </div>
            </div>
        </div>
    </div>

    </div>
</template>

<script>
import BookService from "@/services/book.service";
import BorrowService from "@/services/borrow.service";
import ReaderService from "@/services/reader.service";
import Swal from "sweetalert2";

export default {
    name: "ReaderHome",
    data() {
        return {
            borrowedBooks: [],
            borrowLoading: false,

            books: [],
            searchQuery: "",
            selectedCategory: "",
            selectedYear: "",
            selectedPublisher: "",
            sortBy: "",
            sortOrder: "desc",
            loading: false,
            currentPage: 1,
            itemsPerPage: 8,

            // payment modal
            showPaymentModal: false,
            payment: null,
            paymentLoading: false,

            // book detail modal
            showDetailModal: false,
            selectedBook: null,
            detailLoading: false,

            // reader state
            readerInfo: null,
            isLoggedIn: false,
        };
    },
    computed: {
        uniqueCategories() {
            return [...new Set(this.books.map((b) => b.theLoai).filter(Boolean))];
        },
        uniqueYears() {
            return [...new Set(this.books.map((b) => b.namXuatBan).filter(Boolean))].sort((a, b) => b - a);
        },
        uniquePublishers() {
            return [...new Set(this.books.map((b) => b.tenNXB).filter(Boolean))];
        },
        filteredBooks() {
            const q = this.searchQuery.trim().toLowerCase();
            let result = this.books.filter((b) => {
                const name = b.tenSach?.toLowerCase() || "";
                const author = b.tacGia?.toLowerCase() || "";
                const code = b.maSach?.toLowerCase() || "";

                const matchesSearch = !q || name.includes(q) || author.includes(q) || code.includes(q);
                const matchesCategory = !this.selectedCategory || b.theLoai === this.selectedCategory;
                const matchesYear = !this.selectedYear || b.namXuatBan == this.selectedYear;
                const matchesPublisher = !this.selectedPublisher || b.tenNXB === this.selectedPublisher;

                return matchesSearch && matchesCategory && matchesYear && matchesPublisher;
            });

            if (this.sortBy === "price") {
                result.sort((a, b) => {
                    const va = a.donGia || 0;
                    const vb = b.donGia || 0;
                    return this.sortOrder === "asc" ? va - vb : vb - va;
                });
            } else if (this.sortBy === "quantity") {
                result.sort((a, b) => {
                    const va = a.soQuyen || 0;
                    const vb = b.soQuyen || 0;
                    return this.sortOrder === "asc" ? va - vb : vb - va;
                });
            }

            return result;
        },
        totalPages() {
            return Math.ceil(this.filteredBooks.length / this.itemsPerPage) || 1;
        },
        paginatedBooks() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredBooks.slice(start, start + this.itemsPerPage);
        },
    },
    methods: {
        getBadgeClass(status) {
            switch (status) {
                case "Sẵn sàng":
                    return "badge bg-secondary";
                case "Chờ duyệt":
                    return "badge bg-warning text-dark";
                case "Đã duyệt":
                    return "badge bg-info text-dark";
                case "Đang mượn":
                    return "badge bg-primary text-light";
                case "Đã trả":
                    return "badge bg-success";
                case "Quá hạn":
                    return "badge bg-danger";
                default:
                    return "badge bg-light text-dark";
            }
        },

        async fetchBorrowedBooks() {
            if (!this.isLoggedIn || !this.readerInfo?._id) return;
            this.borrowLoading = true;
            try {
                this.borrowedBooks = await BorrowService.getByReader(this.readerInfo._id);
            } catch (err) {
                console.error("Lỗi tải sách đang mượn:", err);
                this.borrowedBooks = [];
            } finally {
                this.borrowLoading = false;
            }
        },


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

        goToLogin() {
            this.$router.push("/login");
        },

        async borrowBook(book) {
            if (!this.isLoggedIn || !this.readerInfo?._id) {
                Swal.fire("Bạn cần đăng nhập", "Vui lòng đăng nhập để mượn sách.", "info");
                return;
            }

            if (book.soQuyen <= 0) {
                Swal.fire("Hết sách", "Sách này hiện đã hết.", "warning");
                return;
            }

            const result = await Swal.fire({
                title: `Mượn sách: ${book.tenSach}`,
                text: "Bạn có chắc muốn mượn 1 cuốn sách này?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Mượn",
                cancelButtonText: "Hủy",
            });

            if (!result.isConfirmed) return;

            try {
                // Gửi yêu cầu mượn. Backend mong muốn payload khác thì chỉnh lại
                await BorrowService.create({
                    readerId: this.readerInfo._id,
                    bookId: book._id,
                    quantity: 1,
                });

                Swal.fire({
                    icon: "success",
                    title: "Mượn thành công!",
                    text: book.tenSach,
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });

                await this.fetchBooks();
                await this.fetchBorrowedBooks();

            } catch (err) {
                console.error("Lỗi mượn sách:", err);
                if (err.response && err.response.data && err.response.data.message) {
                    Swal.fire("Lỗi", err.response.data.message, "error");
                } else {
                    Swal.fire("Lỗi", "Không thể mượn sách lúc này.", "error");
                }
            }
        },

        async openPaymentModal() {
            if (!this.isLoggedIn || !this.readerInfo?._id) {
                Swal.fire("Bạn cần đăng nhập", "Vui lòng đăng nhập để xem số tiền đã tiêu.", "info");
                return;
            }

            this.showPaymentModal = true;
            this.paymentLoading = true;
            this.payment = null;

            try {
                // Gọi API getPayment của reader service
                const res = await ReaderService.getPayment(this.readerInfo._id);
                this.payment = res;
            } catch (err) {
                console.error("Lỗi tải payment:", err);
                Swal.fire("Lỗi", "Không thể tải thông tin đã tiêu", "error");
            } finally {
                this.paymentLoading = false;
            }
        },

        closePaymentModal() {
            this.showPaymentModal = false;
            this.payment = null;
        },

        formatMoney(value) {
            if (value == null) return "-";
            return (Number(value) || 0).toLocaleString() + " ₫";
        },

        // Book detail modal
        viewBookDetail(book) {
            this.selectedBook = { ...book };
            this.showDetailModal = true;
        },
        closeDetailModal() {
            this.showDetailModal = false;
            this.selectedBook = null;
        },

        // load login state from localStorage
        loadReaderFromLocalStorage() {
            const token = localStorage.getItem("readerToken");
            this.isLoggedIn = !!token;
            try {
                const info = JSON.parse(localStorage.getItem("readerInfo") || "null");
                this.readerInfo = info || null;
            } catch (e) {
                this.readerInfo = null;
            }
        },
    },

    mounted() {
        this.fetchBooks();
        this.loadReaderFromLocalStorage();


        this.fetchBorrowedBooks();
        // Nghe event storage khi login/logout
        window.addEventListener("storage", this.loadReaderFromLocalStorage);
    },
    beforeUnmount() {
        window.removeEventListener("storage", this.loadReaderFromLocalStorage);
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
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: 10px;
}

.modal-dialog {
    background: white;
    border-radius: 10px;
    width: 640px;
    max-width: 95%;
    max-height: 85vh;
    overflow-y: auto;
    padding: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.modal-content {
    padding: 0;
}

@media (max-width: 768px) {
    .modal-dialog {
        width: 100%;
        padding: 12px;
    }
}
</style>
