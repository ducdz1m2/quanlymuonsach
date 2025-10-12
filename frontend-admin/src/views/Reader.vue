<template>
    <div class="p-4">
        <h1 class="mb-4">📚 Quản lý độc giả</h1>

        <!-- Thanh công cụ -->
        <div class="row g-2 align-items-center mb-3">
            <div class="col">
                <input type="text" class="form-control" placeholder="🔍 Tìm kiếm độc giả..." v-model="searchQuery" />
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="selectedGender">
                    <option value="">👥 Tất cả phái</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Không rõ">Không rõ</option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="selectedYear">
                    <option value="">📅 Tất cả năm sinh</option>
                    <option v-for="y in uniqueYears" :key="y" :value="y">{{ y }}</option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="sortBy">
                    <option value="">🔀 Không sắp xếp</option>
                    <option value="collected">Sắp xếp theo tiền đã thu</option>
                    <option value="pending">Sắp xếp theo tiền sắp thu</option>
                </select>
            </div>

            <div class="col-auto">
                <select class="form-select" v-model="sortOrder" :disabled="!sortBy">
                    <option value="desc">⬇️ Lớn → Bé</option>
                    <option value="asc">⬆️ Bé → Lớn</option>
                </select>
            </div>
            <div class="col-auto">
                <select class="form-select" v-model="selectedUnreadFilter">
                    <option value="">Tất cả độc giả</option>
                    <option value="unread">Chỉ tin nhắn mới</option>
                </select>
            </div>


            <div class="col-auto">
                <button class="btn btn-secondary" @click="resetFilters">↺ Reset</button>
            </div>
            <div class="col-auto">
                <button class="btn btn-primary" @click="openAddModal">+ Thêm độc giả</button>
            </div>
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
                            reader.totalCollected.toLocaleString() + ' ₫' : '-' }}</td>
                        <td class="text-warning">{{ reader.totalPending != null ? reader.totalPending.toLocaleString() +
                            ' ₫' : '-' }}</td>
                        <td>
                            <img :src="reader.anh || '/images/default-reader.png'" width="60" height="80"
                                class="rounded shadow-sm" />
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(reader)">Sửa</button>
                            <button class="btn btn-sm btn-danger" @click="confirmDelete(reader)">Xóa</button>

                            <button class="btn btn-sm btn-secondary position-relative" @click="openChat(reader)">
                                💬 Chat
                                <span v-if="chatNotifications && chatNotifications[reader._id]"
                                    class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                </span>
                            </button>


                        </td>
                    </tr>

                    <tr v-if="!loading && paginatedReaders.length === 0">
                        <td colspan="11">Không có độc giả phù hợp</td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="11">⏳ Đang tải dữ liệu...</td>
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
    <ChatBox v-if="showChat" :target="selectedReader" :sender="sender" @close="closeChat"
        @new-message="handleNewMessage" />


</template>

<script>
import ReaderForm from "@/components/readers/ReaderForm.vue";
import readerService from "@/services/reader.service";
import ChatBox from "@/components/ChatBox.vue";
import { inject } from "vue";
import Swal from "sweetalert2";
import { socket } from "@/services/socket";
export default {
    components: { ReaderForm, ChatBox },

    data() {
        return {
            selectedUnreadFilter: "",
            showChat: false,
            selectedReader: null,
            sender: null,

            readers: [],
            searchQuery: "",
            selectedGender: "",
            selectedYear: "",
            sortBy: "",
            sortOrder: "desc",
            loading: false,
            showForm: false,
            editingReader: null,
            currentPage: 1,
            itemsPerPage: 5,
        };
    },

    computed: {
        uniqueYears() {
            return [...new Set(
                this.readers.map(r => {
                    if (!r.ngaySinh) return null;
                    return new Date(r.ngaySinh).getFullYear();
                }).filter(Boolean)
            )].sort((a, b) => b - a);
        },

        filteredReaders() {
            const q = this.searchQuery.trim().toLowerCase();

            let result = this.readers.filter((r) => {
                const maDG = r.maDG?.toLowerCase() || "";
                const hoLot = r.hoLot?.toLowerCase() || "";
                const ten = r.ten?.toLowerCase() || "";
                const diaChi = r.diaChi?.toLowerCase() || "";
                const dienThoai = r.dienThoai?.toLowerCase() || "";

                const matchesSearch =
                    !q ||
                    maDG.includes(q) ||
                    hoLot.includes(q) ||
                    ten.includes(q) ||
                    diaChi.includes(q) ||
                    dienThoai.includes(q);

                const matchesGender = !this.selectedGender || r.phai === this.selectedGender;

                const year = r.ngaySinh ? new Date(r.ngaySinh).getFullYear() : null;
                const matchesYear = !this.selectedYear || year == this.selectedYear;

                const matchesUnread =
                    !this.selectedUnreadFilter ||
                    (this.selectedUnreadFilter === "unread" && this.chatNotifications[r._id]);

                return matchesSearch && matchesGender && matchesYear && matchesUnread;

            });


            if (this.sortBy) {
                result = result.sort((a, b) => {
                    const field = this.sortBy === "collected" ? "totalCollected" : "totalPending";
                    const valA = a[field] || 0;
                    const valB = b[field] || 0;

                    return this.sortOrder === "asc" ? valA - valB : valB - valA;
                });
            }

            return result;
        },

        totalPages() {
            return Math.ceil(this.filteredReaders.length / this.itemsPerPage);
        },

        paginatedReaders() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredReaders.slice(start, start + this.itemsPerPage);
        },
    },
    created() {
        // Inject chatNotifications và sender
        this.chatNotifications = inject("chatNotifications");
        this.sender = inject("sender");
    },
    methods: {
        openChat(reader) {
            this.selectedReader = reader;
            this.showChat = true;

            // Tắt badge ngay khi mở chat
            this.chatNotifications[reader._id] = false;
        },
        handleNewMessage(reader) {
            // Nếu muốn update thủ công
            this.chatNotifications[reader._id] = true;
        },
        closeChat() {
            this.showChat = false;
            this.selectedReader = null;
        },

        resetFilters() {
            this.searchQuery = "";
            this.selectedGender = "";
            this.selectedYear = "";
            this.sortBy = "";
            this.sortOrder = "desc";
            this.currentPage = 1;
        },

        async fetchReaders() {
            this.loading = true;
            try {
                const readers = await readerService.getAll();
                const readersWithPayment = await Promise.all(
                    readers.map(async (r) => {
                        try {
                            const payment = await readerService.getPayment(r._id);
                            return {
                                ...r,
                                totalCollected: payment.totalCollected,
                                totalPending: payment.totalPending,
                            };
                        } catch {
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
                    Swal.fire({ icon: "success", title: "Cập nhật độc giả thành công!", timer: 1500, toast: true, position: "top-end", showConfirmButton: false });
                } else {
                    await readerService.create(reader);
                    Swal.fire({ icon: "success", title: "Thêm độc giả thành công!", timer: 1500, toast: true, position: "top-end", showConfirmButton: false });
                }
            } catch (err) {

                Swal.fire("❌ Lỗi!", "Không thể lưu độc giả.", "error");
            } finally {
                this.closeForm();
                this.fetchReaders();
            }
        },

        async handleDelete(reader) {
            try {
                const response = await readerService.delete(reader._id);
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
                const errorMessage =
                    err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi xóa độc giả.";
                Swal.fire({ icon: "error", title: "Lỗi", text: errorMessage, toast: true, position: "top-end" });
            } finally {
                await this.fetchReaders();
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
            if (result.isConfirmed) await this.handleDelete(reader);
        },
    },

    mounted() {
        this.fetchReaders();
        this.sender = JSON.parse(localStorage.getItem("staffInfo"));

        const onMessage = (msg) => {
            if (msg.sender !== this.sender.hoTenNV) {
                this.chatNotifications[msg.room] = true;
            }
        };
        this._onMessage = onMessage;
        socket.on("receiveMessage", onMessage);
    },
    beforeUnmount() {
        if (this._onMessage) socket.off("receiveMessage", this._onMessage);
    }


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
