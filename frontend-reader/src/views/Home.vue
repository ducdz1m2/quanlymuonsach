<template>
    <div class="p-4">
        <h1 class="mb-4">📚 Thư viện Online</h1>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    :class="{ active: activeTab === 'books' }"
                    @click="activeTab = 'books'"
                    type="button"
                >
                    Sách
                </button>
            </li>

            <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    :class="{ active: activeTab === 'borrows' }"
                    @click="activeTab = 'borrows'"
                    type="button"
                >
                    Mượn sách
                </button>
            </li>

            <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    :class="{ active: activeTab === 'payments' }"
                    @click="openPaymentsTab"
                    type="button"
                >
                    Chi tiêu
                </button>
            </li>

            <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    :class="{ active: activeTab === 'contact' }"
                    @click="activeTab = 'contact'"
                    type="button"
                >
                    Liên hệ
                </button>
            </li>
        </ul>

        <!-- --- BOOKS TAB --- -->
        <div v-show="activeTab === 'books'">
            <!-- Toolbar: search + filters -->
            <div class="row g-2 mb-2 align-items-center">
                <div class="col-12 col-md-6">
                    <input
                        type="text"
                        class="form-control"
                        placeholder="🔍 Tìm sách, tác giả hoặc mã..."
                        v-model="searchQuery"
                    />
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
                        <option
                            v-for="p in uniquePublishers"
                            :key="p"
                            :value="p"
                        >
                            {{ p }}
                        </option>
                    </select>
                </div>

                <div class="col-auto">
                    <select class="form-select" v-model="sortBy">
                        <option value="">🔀 Không sắp xếp</option>
                        <option value="price">💰 Theo đơn giá</option>
                        <option value="quantity">📦 Theo số lượng</option>
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

                <div class="col-auto">
                    <button class="btn btn-secondary" @click="resetFilters">
                        ↺ Reset
                    </button>
                </div>

                <div v-if="isLoggedIn" class="col-auto ms-auto">
                    <button
                        class="btn btn-outline-info"
                        @click="openPaymentsTab"
                    >
                        💳 Xem đã tiêu
                    </button>
                </div>
            </div>

            <!-- Category tabs (per-request: hiển thị theo thể loại + phân trang theo thể loại) -->
            <div class="mb-3">
                <div class="btn-group" role="group" aria-label="categories">
                    <button
                        class="btn"
                        :class="{
                            'btn-primary text-white': selectedCategory === '',
                            'btn-outline-primary': selectedCategory !== '',
                        }"
                        @click="setCategory('')"
                    >
                        Tất cả
                    </button>
                    <button
                        v-for="c in uniqueCategories"
                        :key="c"
                        class="btn"
                        :class="{
                            'btn-primary text-white': selectedCategory === c,
                            'btn-outline-primary': selectedCategory !== c,
                        }"
                        @click="setCategory(c)"
                    >
                        {{ c }}
                    </button>
                </div>
            </div>

            <!-- Cards grid -->
            <div v-if="loading" class="text-center py-5">
                ⏳ Đang tải dữ liệu...
            </div>

            <div v-else>
                <div
                    v-if="filteredBooksByCategory.length === 0"
                    class="text-center py-5"
                >
                    Không có sách phù hợp
                </div>

                <div class="row g-3">
                    <div
                        class="col-12 col-sm-6 col-md-4 col-lg-3"
                        v-for="book in paginatedBooksByCategory"
                        :key="book._id"
                    >
                        <div class="card h-100">
                            <img
                                class="card-img-top book-img"
                                :src="book.anhBia || '/images/default-book.png'"
                                :alt="book.tenSach"
                            />

                            <div class="card-body d-flex flex-column">
                                <h6
                                    class="card-title mb-1 text-truncate"
                                    :title="book.tenSach"
                                >
                                    {{ book.tenSach }}
                                </h6>
                                <p
                                    class="mb-1 small text-muted text-truncate"
                                    :title="book.tacGia"
                                >
                                    {{ book.tacGia || "Không rõ" }}
                                </p>
                                <p class="mb-1 small">
                                    <span
                                        class="badge bg-light text-dark me-1"
                                        >{{ book.theLoai || "Chưa có" }}</span
                                    >
                                    <small class="text-muted">{{
                                        book.namXuatBan || "-"
                                    }}</small>
                                </p>

                                <p class="mb-2 mt-auto">
                                    <strong>
                                        {{
                                            book.donGia != null
                                                ? book.donGia.toLocaleString() +
                                                  " ₫"
                                                : "-"
                                        }}
                                    </strong>
                                </p>

                                <div
                                    class="d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <button
                                            v-if="
                                                book.soQuyen > 0 && isLoggedIn
                                            "
                                            class="btn btn-sm btn-primary"
                                            @click="borrowBook(book)"
                                        >
                                            Mượn
                                        </button>

                                        <button
                                            v-else-if="
                                                book.soQuyen > 0 && !isLoggedIn
                                            "
                                            class="btn btn-sm btn-outline-primary"
                                            @click="goToLogin"
                                            title="Bạn cần đăng nhập để mượn"
                                        >
                                            Đăng nhập
                                        </button>

                                        <span v-else class="text-muted small"
                                            >Hết sách</span
                                        >
                                    </div>

                                    <button
                                        class="btn btn-sm btn-info"
                                        @click="viewBookDetail(book)"
                                    >
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination (per-category) -->
                <div
                    class="d-flex justify-content-center mt-4 gap-2"
                    v-if="categoryTotalPages > 1"
                >
                    <button
                        class="btn btn-outline-primary"
                        :disabled="categoryPage === 1"
                        @click="categoryPrev"
                    >
                        ◀ Trước
                    </button>
                    <span class="align-self-center"
                        >Trang {{ categoryPage }} /
                        {{ categoryTotalPages || 1 }}</span
                    >
                    <button
                        class="btn btn-outline-primary"
                        :disabled="categoryPage === categoryTotalPages"
                        @click="categoryNext"
                    >
                        Sau ▶
                    </button>
                </div>
            </div>
        </div>

        <!-- --- BORROWS TAB --- -->
        <div v-show="activeTab === 'borrows'">
            <div v-if="!isLoggedIn" class="alert alert-info">
                Vui lòng đăng nhập để xem và quản lý các phiếu mượn.
            </div>

            <div v-else>
                <h5 class="mb-3">🔍 Tìm kiếm phiếu mượn</h5>

                <div class="row g-2 mb-3 align-items-center">
                    <div class="col-12 col-md-5">
                        <input
                            type="text"
                            class="form-control"
                            placeholder="Tìm theo mã mượn hoặc tên sách..."
                            v-model="borrowSearchQuery"
                        />
                    </div>

                    <div class="col-auto">
                        <select
                            class="form-select"
                            v-model="borrowSelectedStatus"
                        >
                            <option value="">📌 Tất cả trạng thái</option>
                            <option
                                v-for="s in uniqueBorrowStatuses"
                                :key="s"
                                :value="s"
                            >
                                {{ s }}
                            </option>
                        </select>
                    </div>

                    <div class="col-auto">
                        <select
                            class="form-select"
                            v-model="borrowSelectedYear"
                        >
                            <option value="">📅 Tất cả năm mượn</option>
                            <option
                                v-for="y in uniqueBorrowYears"
                                :key="y"
                                :value="y"
                            >
                                {{ y }}
                            </option>
                        </select>
                    </div>

                    <div class="col-auto">
                        <button
                            class="btn btn-secondary"
                            @click="resetBorrowFilters"
                        >
                            ↺ Reset
                        </button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table
                        class="table table-bordered table-hover text-center align-middle"
                    >
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
                            <tr v-if="borrowLoading">
                                <td colspan="6">⏳ Đang tải...</td>
                            </tr>
                            <tr v-else-if="filteredBorrows.length === 0">
                                <td colspan="6">
                                    Không có phiếu mượn phù hợp.
                                </td>
                            </tr>
                            <tr v-for="b in filteredBorrows" :key="b._id">
                                <td class="text-start">
                                    {{ b.maMuon || "(Không có mã)" }}
                                </td>
                                <td class="text-start">
                                    {{ b.bookInfo?.tenSach || "Không rõ" }}
                                </td>
                                <td>{{ b.ngayMuon }}</td>
                                <td>{{ b.ngayTra }}</td>
                                <td>
                                    <span :class="getBadgeClass(b.trangThai)">{{
                                        b.trangThai
                                    }}</span>
                                </td>
                                <td>
                                    {{
                                        formatMoney(
                                            b.totalPayment ||
                                                (b.rentalFee || 0) +
                                                    (b.penalty || 0),
                                        )
                                    }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- --- PAYMENTS TAB --- -->
        <div v-show="activeTab === 'payments'">
            <div v-if="!isLoggedIn" class="alert alert-info">
                Vui lòng đăng nhập để xem chi tiết chi tiêu.
            </div>

            <div v-else>
                <h5
                    class="mb-3 d-flex justify-content-between align-items-center"
                >
                    <span>💳 Thông tin chi tiêu</span>
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        @click="refreshPayments"
                    >
                        Làm mới
                    </button>
                </h5>

                <div v-if="paymentLoading">⏳ Đang tải...</div>

                <div v-else>
                    <p>
                        <strong>Độc giả:</strong>
                        {{ readerInfo?.hoTen || readerInfo?.ten || "—" }}
                    </p>

                    <!-- computePaymentsFromBorrows() đảm bảo thống kê khớp với tab mượn -->
                    <p>
                        <strong>Đã trả:</strong>
                        {{ formatMoney(paymentComputed.totalCollected) }}
                    </p>
                    <p>
                        <strong>Đang chờ xử lý:</strong>
                        {{ formatMoney(paymentComputed.totalPending) }}
                    </p>
                    <p class="fw-bold border-top pt-2">
                        <strong>Tổng cộng:</strong>
                        {{
                            formatMoney(
                                paymentComputed.totalCollected +
                                    paymentComputed.totalPending,
                            )
                        }}
                    </p>

                    <hr />
                    <h6>📘 Chi tiết mượn sách</h6>
                    <div
                        v-if="
                            paymentComputed.borrows &&
                            paymentComputed.borrows.length
                        "
                    >
                        <ul class="list-unstyled">
                            <li
                                v-for="b in paymentComputed.borrows"
                                :key="b._id"
                                class="mb-2"
                            >
                                <strong>{{ b.maMuon }}</strong> —
                                {{ b.trangThai }}
                                <span v-if="b.penalty > 0">
                                    (Phạt: {{ formatMoney(b.penalty) }})</span
                                >
                                <span v-if="b.rentalFee != null">
                                    | Phí thuê:
                                    {{ formatMoney(b.rentalFee) }}</span
                                >
                                <span v-if="b.totalPayment != null">
                                    | Tổng cộng:
                                    {{ formatMoney(b.totalPayment) }}</span
                                >
                                <br />
                                <small
                                    >Ngày mượn: {{ b.ngayMuon }} | Hạn trả:
                                    {{ b.ngayTra }}</small
                                >
                            </li>
                        </ul>
                    </div>
                    <div v-else>Không có dữ liệu chi tiết.</div>
                </div>
            </div>
        </div>

        <!-- --- CONTACT/CHAT TAB --- -->
        <div v-show="activeTab === 'contact'">
            <div v-if="!isLoggedIn" class="alert alert-info">
                Vui lòng đăng nhập để liên hệ thủ thư.
            </div>

            <div v-else>
                <div
                    class="d-flex justify-content-between align-items-center mb-3"
                >
                    <h5 class="mb-0">💬 Liên hệ với thủ thư</h5>
                    <div>
                        <button
                            class="btn btn-sm btn-outline-secondary me-2"
                            @click="openChatPanel"
                            v-if="!showChatPanel"
                        >
                            Mở chat
                        </button>
                        <button
                            class="btn btn-sm btn-secondary"
                            @click="closeChatFromTab"
                            v-if="showChatPanel"
                        >
                            Đóng chat
                        </button>
                    </div>
                </div>

                <div class="mb-3">
                    <small class="text-muted"
                        >Phòng chat trực tiếp với thủ thư của thư viện.</small
                    >
                </div>

                <div v-if="showChatPanel">
                    <ChatBox
                        :room-id="readerInfo._id"
                        :sender="readerInfo"
                        @close="closeChatFromTab"
                    />
                </div>
            </div>
        </div>

        <!-- Book Detail Modal (unchanged) -->
        <div
            v-if="showDetailModal"
            class="modal-backdrop"
            @click.self="closeDetailModal"
        >
            <div class="modal-dialog">
                <div class="modal-content p-4">
                    <h5>🔎 Chi tiết sách</h5>
                    <div v-if="detailLoading">⏳ Đang tải...</div>
                    <div v-else-if="selectedBook">
                        <p>
                            <strong>{{ selectedBook.tenSach }}</strong>
                        </p>
                        <img
                            :src="
                                selectedBook.anhBia ||
                                '/images/default-book.png'
                            "
                            alt=""
                            width="150px"
                        />
                        <p>{{ selectedBook.moTa || "Không có mô tả" }}</p>
                        <p>
                            <strong>Số lượng:</strong>
                            {{ selectedBook.soQuyen ?? 0 }}
                        </p>
                        <p>
                            <strong>Đơn giá:</strong>
                            {{ formatMoney(selectedBook.donGia) }}
                        </p>
                    </div>
                    <div class="text-end mt-3">
                        <button
                            class="btn btn-secondary"
                            @click="closeDetailModal"
                        >
                            Đóng
                        </button>
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
import ChatBox from "@/components/ChatBox.vue";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

export default {
    name: "ReaderHome",
    components: { ChatBox },
    data() {
        return {
            activeTab: "books",

            // chat panel state
            showChatPanel: false,
            selectedReader: null,
            chatNotifications: {},

            // borrows
            borrowedBooks: [],
            borrowLoading: false,
            borrowSearchQuery: "",
            borrowSelectedStatus: "",
            borrowSelectedYear: "",

            // books
            books: [],
            searchQuery: "",
            selectedCategory: "",
            selectedYear: "",
            selectedPublisher: "",
            sortBy: "",
            sortOrder: "desc",
            loading: false,

            // per-category pagination
            categoryPage: 1,
            itemsPerPage: 8,

            // payments
            payment: null,
            paymentLoading: false,

            // detail modal
            showDetailModal: false,
            selectedBook: null,
            detailLoading: false,

            // user
            readerInfo: null,
            isLoggedIn: false,

            socket: null,
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

        // filtered overall (keeps original filters)
        filteredBooks() {
            const q = this.searchQuery.trim().toLowerCase();
            return this.books
                .filter((b) => {
                    const name = b.tenSach?.toLowerCase() || "";
                    const author = b.tacGia?.toLowerCase() || "";
                    const code = b.maSach?.toLowerCase() || "";
                    const matchesSearch =
                        !q ||
                        name.includes(q) ||
                        author.includes(q) ||
                        code.includes(q);
                    const matchesYear =
                        !this.selectedYear || b.namXuatBan == this.selectedYear;
                    const matchesPublisher =
                        !this.selectedPublisher ||
                        b.tenNXB === this.selectedPublisher;
                    return matchesSearch && matchesYear && matchesPublisher;
                })
                .sort(this._bookSortFn);
        },

        // filtered *by category* (used for category-specific pagination)
        filteredBooksByCategory() {
            const cat = this.selectedCategory;
            const list = this.filteredBooks.filter((b) =>
                cat ? b.theLoai === cat : true,
            );
            return list;
        },

        // per-category pagination helpers
        categoryTotalPages() {
            return Math.max(
                1,
                Math.ceil(
                    this.filteredBooksByCategory.length / this.itemsPerPage,
                ),
            );
        },
        paginatedBooksByCategory() {
            const start = (this.categoryPage - 1) * this.itemsPerPage;
            return this.filteredBooksByCategory.slice(
                start,
                start + this.itemsPerPage,
            );
        },

        // borrows computed
        uniqueBorrowStatuses() {
            return [
                ...new Set(
                    this.borrowedBooks.map((b) => b.trangThai).filter(Boolean),
                ),
            ];
        },
        uniqueBorrowYears() {
            return [
                ...new Set(
                    this.borrowedBooks
                        .map((b) =>
                            b.ngayMuon
                                ? new Date(b.ngayMuon).getFullYear()
                                : null,
                        )
                        .filter(Boolean),
                ),
            ].sort((a, b) => b - a);
        },
        filteredBorrows() {
            const q = this.borrowSearchQuery.trim().toLowerCase();
            return this.borrowedBooks.filter((b) => {
                const ma = b.maMuon?.toLowerCase() || "";
                const name = b.bookInfo?.tenSach?.toLowerCase() || "";
                const matchesSearch = !q || ma.includes(q) || name.includes(q);
                const matchesStatus =
                    !this.borrowSelectedStatus ||
                    b.trangThai === this.borrowSelectedStatus;
                const year = b.ngayMuon
                    ? new Date(b.ngayMuon).getFullYear()
                    : null;
                const matchesYear =
                    !this.borrowSelectedYear || year == this.borrowSelectedYear;
                return matchesSearch && matchesStatus && matchesYear;
            });
        },

        // computed payment built from borrowedBooks to match borrows tab
        paymentComputed() {
            const borrows = (this.borrowedBooks || []).map((b) => {
                const rentalFee = Number(b.rentalFee || 0);
                const penalty = Number(b.penalty || 0);
                const totalPayment = Number(
                    b.totalPayment ?? rentalFee + penalty,
                );
                return { ...b, rentalFee, penalty, totalPayment };
            });

            let totalCollected = 0;
            let totalPending = 0;
            for (const b of borrows) {
                if (b.trangThai === "Đã trả")
                    totalCollected += Number(b.totalPayment || 0);
                else
                    totalPending += Number(
                        b.totalPayment || (b.rentalFee || 0) + (b.penalty || 0),
                    );
            }

            return {
                totalCollected,
                totalPending,
                borrows,
            };
        },
    },
    methods: {
        // --- category pagination & controls ---
        setCategory(cat) {
            this.selectedCategory = cat;
            this.categoryPage = 1;
        },
        categoryPrev() {
            if (this.categoryPage > 1) this.categoryPage--;
        },
        categoryNext() {
            if (this.categoryPage < this.categoryTotalPages)
                this.categoryPage++;
        },

        // reset filters + reset category pagination
        resetFilters() {
            this.searchQuery = "";
            this.selectedCategory = "";
            this.selectedYear = "";
            this.selectedPublisher = "";
            this.sortBy = "";
            this.sortOrder = "desc";
            this.categoryPage = 1;
        },

        // --- borrows ---
        resetBorrowFilters() {
            this.borrowSearchQuery = "";
            this.borrowSelectedStatus = "";
            this.borrowSelectedYear = "";
        },

        // open chat panel in contact tab
        openChat(readerInfo) {
            this.activeTab = "contact";
            this.showChatPanel = true;
            this.selectedReader = readerInfo;
        },
        openChatPanel() {
            this.showChatPanel = true;
        },
        closeChatFromTab() {
            this.showChatPanel = false;
            this.selectedReader = null;
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

        // --- fetchers ---
        async fetchBorrowedBooks() {
            if (!this.isLoggedIn || !this.readerInfo?._id) return;
            this.borrowLoading = true;
            try {
                this.borrowedBooks = await BorrowService.getByReader(
                    this.readerInfo._id,
                );
            } catch (err) {
                Swal.fire("❌ Lỗi!", "Lỗi khi tải sách mượn.", "error");
                this.borrowedBooks = [];
            } finally {
                this.borrowLoading = false;
            }
        },

        async fetchBooks() {
            this.loading = true;
            try {
                this.books = await BookService.getAll();
            } catch (err) {
                Swal.fire("❌ Lỗi!", "Lỗi khi tải sách.", "error");
                this.books = [];
            } finally {
                this.loading = false;
            }
        },

        // prev/next for main pagination (kept for backward compatibility if needed)
        prevPage() {
            /* not used for category pagination */
        },
        nextPage() {
            /* not used for category pagination */
        },

        goToLogin() {
            this.$router.push("/login");
        },

        async checkNearlyExpiredBooks() {
            if (!this.isLoggedIn || !this.borrowedBooks.length) return;
            const today = new Date();
            const almostExpired = this.borrowedBooks.filter((b) => {
                if (!b.ngayTra) return false;
                const returnDate = new Date(b.ngayTra);
                const diffDays = Math.ceil(
                    (returnDate - today) / (1000 * 60 * 60 * 24),
                );
                return (
                    diffDays > 0 && diffDays <= 3 && b.trangThai !== "Đã trả"
                );
            });
            if (almostExpired.length) {
                const list = almostExpired
                    .map(
                        (b) =>
                            `📘 <b>${b.bookInfo?.tenSach || "Không rõ"}</b> — hạn trả: <b>${b.ngayTra}</b>`,
                    )
                    .join("<br>");
                Swal.fire({
                    title: "⏰ Sách sắp đến hạn trả!",
                    html: `<p>Bạn có <b>${almostExpired.length}</b> sách gần hết hạn trả:</p><div style="text-align:left">${list}</div><hr><small>Vui lòng trả đúng hạn để tránh bị phạt nhé.</small>`,
                    icon: "warning",
                    confirmButtonText: "Đã hiểu",
                    confirmButtonColor: "#f59e0b",
                });
            }
        },

        async borrowBook(book) {
            if (!this.isLoggedIn || !this.readerInfo?._id) {
                Swal.fire(
                    "Bạn cần đăng nhập",
                    "Vui lòng đăng nhập để mượn sách.",
                    "info",
                );
                this.goToLogin();
                return;
            }
            if (book.soQuyen <= 0) {
                Swal.fire("Hết sách", "Sách này hiện đã hết.", "warning");
                return;
            }

            const { value: returnDate } = await Swal.fire({
                title: `Mượn sách: ${book.tenSach}`,
                html: `<p>Chọn ngày trả sách:</p><input type="date" id="return-date" class="swal2-input" min="${new Date().toISOString().split("T")[0]}">`,
                showCancelButton: true,
                confirmButtonText: "Mượn",
                cancelButtonText: "Hủy",
                preConfirm: () => {
                    const date = document.getElementById("return-date").value;
                    if (!date)
                        Swal.showValidationMessage(
                            "Bạn phải chọn ngày trả sách!",
                        );
                    return date;
                },
            });
            if (!returnDate) return;

            try {
                await BorrowService.create({
                    readerId: this.readerInfo._id,
                    bookId: book._id,
                    quantity: 1,
                    ngayTra: returnDate,
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
                if (
                    err.response &&
                    err.response.data &&
                    err.response.data.message
                )
                    Swal.fire("Lỗi", err.response.data.message, "error");
                else Swal.fire("Lỗi", "Không thể mượn sách lúc này.", "error");
            }
        },

        // --- payments: fetch borrows first then compute locally to ensure consistency with borrows tab ---
        async openPaymentsTab() {
            if (!this.isLoggedIn || !this.readerInfo?._id) {
                Swal.fire(
                    "Bạn cần đăng nhập",
                    "Vui lòng đăng nhập để xem số tiền đã tiêu.",
                    "info",
                );
                this.goToLogin();
                return;
            }
            this.activeTab = "payments";
            await this.refreshPayments();
        },

        async refreshPayments() {
            if (!this.isLoggedIn || !this.readerInfo?._id) return;
            this.paymentLoading = true;
            try {
                // ensure borrows are fresh (so stats match borrows tab)
                await this.fetchBorrowedBooks();
                // optionally merge with server-side ReaderService.getPayment if needed
                // const res = await ReaderService.getPayment(this.readerInfo._id);
                // this.payment = res; // kept but reports below come from computed paymentComputed (based on borrowedBooks)
            } catch (err) {
                Swal.fire("Lỗi", "Không thể tải thông tin chi tiêu.", "error");
            } finally {
                this.paymentLoading = false;
            }
        },

        formatMoney(value) {
            if (value == null) return "-";
            return (Number(value) || 0).toLocaleString() + " ₫";
        },

        viewBookDetail(book) {
            this.selectedBook = { ...book };
            this.showDetailModal = true;
        },
        closeDetailModal() {
            this.showDetailModal = false;
            this.selectedBook = null;
        },

        loadReaderFromLocalStorage() {
            const token = localStorage.getItem("readerToken");
            this.isLoggedIn = !!token;
            try {
                const info = JSON.parse(
                    localStorage.getItem("readerInfo") || "null",
                );
                this.readerInfo = info || null;
            } catch (e) {
                this.readerInfo = null;
            }
        },

        // helper sort fn used by filteredBooks
        _bookSortFn(a, b) {
            if (this.sortBy === "price") {
                const va = Number(a.donGia || 0),
                    vb = Number(b.donGia || 0);
                return this.sortOrder === "asc" ? va - vb : vb - va;
            } else if (this.sortBy === "quantity") {
                const va = Number(a.soQuyen || 0),
                    vb = Number(b.soQuyen || 0);
                return this.sortOrder === "asc" ? va - vb : vb - va;
            }
            return 0;
        },
    },

    watch: {
        // reset category page on filters change so pagination matches current filter set
        searchQuery() {
            this.categoryPage = 1;
        },
        selectedYear() {
            this.categoryPage = 1;
        },
        selectedPublisher() {
            this.categoryPage = 1;
        },
        sortBy() {
            this.categoryPage = 1;
        },
        sortOrder() {
            this.categoryPage = 1;
        },
        selectedCategory() {
            this.categoryPage = 1;
        },
    },

    async mounted() {
        window.addEventListener("storage", this.loadReaderFromLocalStorage);

        this.loadReaderFromLocalStorage();
        await this.fetchBooks();
        await this.fetchBorrowedBooks();
        this.checkNearlyExpiredBooks();

        this.socket = io("http://localhost:3000");
        this.socket.on("receiveMessage", (msg) => {
            if (msg.sender != this.readerInfo?.ten) {
                this.chatNotifications[msg.room] = true;
            }
        });
    },

    beforeUnmount() {
        window.removeEventListener("storage", this.loadReaderFromLocalStorage);
        if (this.socket) this.socket.disconnect();
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

.book-img {
    height: 220px;
    object-fit: cover;
}

/* truncate long titles/authors */
.card-title,
.card p {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .modal-dialog {
        width: 100%;
        padding: 12px;
    }
    .book-img {
        height: 180px;
    }
}
</style>
