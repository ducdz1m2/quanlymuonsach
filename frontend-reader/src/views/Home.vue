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

            <div v-if="this.isLoggedIn" class="col-auto ms-auto">
                <button class="btn btn-outline-info" @click="openPaymentModal" :disabled="!isLoggedIn">
                    💳 Xem đã tiêu
                </button>
            </div>
        </div>

        <!-- Table sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="">
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
                            <span v-else class="text-out-of-stock">Hết sách</span>

                            <!-- nút xem chi tiết mượn (tuỳ chọn) -->
                            <button class=" btn btn-sm btn-info ms-2" @click="viewBookDetail(book)">Chi tiết</button>
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
    <!-- 🔍 Tìm kiếm phiếu mượn -->
    <div v-if="isLoggedIn" class="mt-5">
        <h4 class="mb-3">🔍 Tìm kiếm phiếu mượn</h4>

        <div class="row g-2 mb-3 align-items-center">
            <div class="col-auto">
                <input type="text" class="form-control" placeholder="Tìm theo mã mượn hoặc tên sách..."
                    v-model="borrowSearchQuery" />
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="borrowSelectedStatus">
                    <option value="">📌 Tất cả trạng thái</option>
                    <option v-for="s in uniqueBorrowStatuses" :key="s" :value="s">{{ s }}</option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="borrowSelectedYear">
                    <option value="">📅 Tất cả năm mượn</option>
                    <option v-for="y in uniqueBorrowYears" :key="y" :value="y">{{ y }}</option>
                </select>
            </div>

            <div class="col-auto">
                <button class="btn btn-secondary" @click="resetBorrowFilters">↺ Reset</button>
            </div>
        </div>

        <!-- Bảng kết quả tìm kiếm -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-secondary">
                    <tr>
                        <th>Mã mượn</th>
                        <th>Tên sách</th>
                        <th>Ngày mượn</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                        <th>Phí (₫)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="filteredBorrows.length === 0">
                        <td colspan="6">Không có phiếu mượn phù hợp.</td>
                    </tr>
                    <tr v-for="b in filteredBorrows" :key="b._id">
                        <td class="text-start">{{ b.maMuon || '(Không có mã)' }}</td>
                        <td class="text-start">{{ b.bookInfo?.tenSach || 'Không rõ' }}</td>
                        <td>{{ b.ngayMuon }}</td>
                        <td>{{ b.ngayTra }}</td>
                        <td><span :class="getBadgeClass(b.trangThai)">{{ b.trangThai }}</span></td>
                        <td>{{ formatMoney(b.bookInfo?.donGia || 0) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>



    <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
        <div class="modal-dialog">
            <div class="modal-content p-4">
                <h5>🔎 Chi tiết sách</h5>
                <div v-if="detailLoading">⏳ Đang tải...</div>
                <div v-else-if="selectedBook">
                    <p><strong>{{ selectedBook.tenSach }}</strong></p>
                    <img :src="selectedBook.anhBia" alt="" width="150px">
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

    <button v-if="isLoggedIn" class="btn btn-sm btn-primary position-relative" @click="openChat(readerInfo)">
        Liên hệ với thủ thư
        <span v-if="chatNotifications[readerInfo._id]"
            class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
        </span>
    </button>

    <ChatBox v-if="showChat" :room-id="readerInfo._id" :sender="readerInfo" @close="closeChat" />


    </div>
</template>

<script>
import BookService from "@/services/book.service";
import BorrowService from "@/services/borrow.service";
import ReaderService from "@/services/reader.service";
import ChatBox from "@/components/ChatBox.vue";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

export default {
    name: "ReaderHome",
    components: {
        ChatBox,
    },
    data() {
        return {
            showChat: false,
            selectedReader: null,
            // sender: null,
            chatNotifications: {},
            borrowedBooks: [],
            borrowLoading: false,
            borrowSearchQuery: "",
            borrowSelectedStatus: "",
            borrowSelectedYear: "",

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
        uniqueBorrowStatuses() {
            return [...new Set(this.borrowedBooks.map(b => b.trangThai).filter(Boolean))];
        },
        uniqueBorrowYears() {
            return [...new Set(
                this.borrowedBooks
                    .map(b => b.ngayMuon ? new Date(b.ngayMuon).getFullYear() : null)
                    .filter(Boolean)
            )].sort((a, b) => b - a);
        },
        filteredBorrows() {
            const q = this.borrowSearchQuery.trim().toLowerCase();

            return this.borrowedBooks.filter((b) => {
                const maMuon = b.maMuon?.toLowerCase() || "";
                const tenSach = b.bookInfo?.tenSach?.toLowerCase() || "";

                const matchesSearch = !q || maMuon.includes(q) || tenSach.includes(q);
                const matchesStatus = !this.borrowSelectedStatus || b.trangThai === this.borrowSelectedStatus;

                const year = b.ngayMuon ? new Date(b.ngayMuon).getFullYear() : null;
                const matchesYear = !this.borrowSelectedYear || year == this.borrowSelectedYear;

                return matchesSearch && matchesStatus && matchesYear;
            });
        },
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
        resetBorrowFilters() {
            this.borrowSearchQuery = "";
            this.borrowSelectedStatus = "";
            this.borrowSelectedYear = "";
        },
        openChat(readerInfo) {
            this.selectedReader = readerInfo;
            this.showChat = true;
            this.chatNotifications[readerInfo._id] = false;
        },

        closeChat() {
            this.showChat = false;
            this.selectedReader = null;
        },

        async loadMessages(readerId) {
            try {
                const notis = await notificationService.getByReceiver(readerId);
                this.messages = notis.map((n) => ({
                    senderName: n.senderName || "Hệ thống",
                    message: n.message,
                }));
            } catch (err) {

                Swal.fire("❌ Lỗi!", "Lỗi khi tải tin nhắn.", "error");
                this.messages = [
                    { senderName: "Hệ thống", message: "Không thể tải tin nhắn." },
                ];
            }
        },






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
                // console.error("Lỗi tải sách đang mượn:", err);

                Swal.fire("❌ Lỗi!", "Lỗi khi tải sách mượn.", "error");
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
                // console.error("Lỗi tải sách:", err);

                Swal.fire("❌ Lỗi!", "Lỗi khi tải sách.", "error");
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
        async checkNearlyExpiredBooks() {
            if (!this.isLoggedIn || !this.borrowedBooks.length) return;

            const today = new Date();
            const almostExpired = this.borrowedBooks.filter(b => {
                if (!b.ngayTra) return false;
                const returnDate = new Date(b.ngayTra);
                const diffDays = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= 3 && b.trangThai !== "Đã trả"; // còn <= 3 ngày
            });

            if (almostExpired.length) {
                const list = almostExpired
                    .map(b => `📘 <b>${b.bookInfo?.tenSach || 'Không rõ'}</b> — hạn trả: <b>${b.ngayTra}</b>`)
                    .join("<br>");

                Swal.fire({
                    title: "⏰ Sách sắp đến hạn trả!",
                    html: `
                <p>Bạn có <b>${almostExpired.length}</b> sách gần hết hạn trả:</p>
                <div style="text-align:left">${list}</div>
                <hr>
                <small>Vui lòng trả đúng hạn để tránh bị phạt nhé.</small>
            `,
                    icon: "warning",
                    confirmButtonText: "Đã hiểu",
                    confirmButtonColor: "#f59e0b",
                });
            }
        },

        async borrowBook(book) {
            if (!this.isLoggedIn || !this.readerInfo?._id) {
                Swal.fire("Bạn cần đăng nhập", "Vui lòng đăng nhập để mượn sách.", "info");
                this.goToLogin();
                return;
            }

            if (book.soQuyen <= 0) {
                Swal.fire("Hết sách", "Sách này hiện đã hết.", "warning");
                return;
            }

            // Popup chọn ngày trả
            const { value: returnDate } = await Swal.fire({
                title: `Mượn sách: ${book.tenSach}`,
                html: `
            <p>Chọn ngày trả sách:</p>
            <input type="date" id="return-date" class="swal2-input" min="${new Date().toISOString().split('T')[0]}">
        `,
                showCancelButton: true,
                confirmButtonText: "Mượn",
                cancelButtonText: "Hủy",
                preConfirm: () => {
                    const date = document.getElementById("return-date").value;
                    if (!date) Swal.showValidationMessage("Bạn phải chọn ngày trả sách!");
                    return date;
                },
            });

            if (!returnDate) return;

            try {
                await BorrowService.create({
                    readerId: this.readerInfo._id,
                    bookId: book._id,
                    quantity: 1,
                    ngayTra: returnDate,  // gửi ngày trả cho backend
                });

                Swal.fire({
                    icon: "success",
                    title: "Mượn thành công!",
                    text: `Bạn sẽ trả sách vào: ${returnDate}`,
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });

                await this.fetchBooks();
                await this.fetchBorrowedBooks();

            } catch (err) {
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
                this.goToLogin();
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
                // console.error("Lỗi tải payment:", err);
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

        window.addEventListener("storage", this.loadReaderFromLocalStorage);

        this.loadReaderFromLocalStorage();
        this.fetchBooks();
        this.fetchBorrowedBooks().then(() => {
            this.checkNearlyExpiredBooks();
        });

        this.socket = io("http://localhost:3000");

        this.socket.on("receiveMessage", (msg) => {

            if (msg.sender != this.readerInfo.ten) {

                this.chatNotifications[msg.room] = true;
            }


        });

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
