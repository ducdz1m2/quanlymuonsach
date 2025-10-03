<template>
    <div class="p-4">
        <h1 class="mb-4">👨‍💼 Quản lý Nhà xuất bản</h1>

        <div class="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
            <input type="text" class="form-control w-25" placeholder="🔍 Tìm kiếm nhà xuất bản..."
                v-model="searchQuery" />

            <!-- Lọc theo địa chỉ -->
            <select class="form-select w-auto" v-model="selectedCity">
                <option value="">🏙️ Tất cả địa chỉ</option>
                <option v-for="c in uniqueCities" :key="c" :value="c">{{ c }}</option>
            </select>

            <!-- Nút reset -->
            <button class="btn btn-secondary" @click="resetFilters">↺ Reset</button>

            <button class="btn btn-primary" @click="openAddModal">+ Thêm NXB</button>
        </div>



        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Mã NXB</th>
                        <th>Tên NXB</th>
                        <th>Địa chỉ</th>
                        <th>Ảnh</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="publisher in paginatedPublishers" :key="publisher._id">
                        <td class="text-start">{{ publisher.maNXB }}</td>
                        <td class="text-start">{{ publisher.tenNXB }}</td>
                        <td class="text-start">{{ publisher.diaChi }}</td>
                        <td>
                            <img :src="publisher.anh || '/images/default-publisher.png'" width="60" height="80"
                                class="rounded shadow-sm" />
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(publisher)">Sửa</button>
                            <button class="btn btn-sm btn-danger" @click="confirmDelete(publisher)">Xóa</button>
                        </td>
                    </tr>
                    <tr v-if="!loading && paginatedPublishers.length === 0">
                        <td colspan="4">Không có NXB phù hợp</td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="4">⏳ Đang tải dữ liệu...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="d-flex justify-content-center mt-3 gap-2" v-if="totalPages > 1">
            <button class="btn btn-outline-primary" :disabled="currentPage === 1" @click="prevPage">◀ Trước</button>
            <span class="align-self-center">Trang {{ currentPage }} / {{ totalPages || 1 }}</span>
            <button class="btn btn-outline-primary" :disabled="currentPage === totalPages" @click="nextPage">Sau
                ▶</button>
        </div>

        <div v-if="showForm" class="modal-backdrop">
            <div class="modal-content p-4">
                <h5>{{ editingPublisher ? "✏️ Sửa NXB" : "➕ Thêm NXB" }}</h5>
                <PublisherForm :publisher="editingPublisher" @save="handleSave" @cancel="closeForm"
                    @delete="handleDelete" />
            </div>
        </div>
    </div>
</template>

<script>
import PublisherForm from '@/components/publishers/PublisherForm.vue';
import publisherService from '@/services/publisher.service';
import Swal from "sweetalert2";

export default {
    components: { PublisherForm },
    data() {
        return {
            publishers: [],
            searchQuery: "",
            selectedCity: "",   // lọc theo địa chỉ (tỉnh/thành phố)


            loading: false,
            showForm: false,
            editingPublisher: null,
            currentPage: 1,
            itemsPerPage: 5,
        };
    },

    computed: {
        uniqueCities() {
            return [...new Set(this.publishers.map(p => p.diaChi).filter(Boolean))];
        },

        filteredPublishers() {
            const q = this.searchQuery.trim().toLowerCase();

            return this.publishers.filter((p) => {
                const code = p.maNXB?.toLowerCase() || "";
                const name = p.tenNXB?.toLowerCase() || "";
                const address = p.diaChi?.toLowerCase() || "";

                // ✅ lọc theo search
                const matchesSearch = !q || code.includes(q) || name.includes(q) || address.includes(q);

                // ✅ lọc theo địa chỉ
                const matchesCity = !this.selectedCity || p.diaChi === this.selectedCity;

                // ✅ lọc theo tình trạng ảnh


                return matchesSearch && matchesCity;
            });
        },

        totalPages() {
            return Math.ceil(this.filteredPublishers.length / this.itemsPerPage);
        },
        paginatedPublishers() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredPublishers.slice(start, start + this.itemsPerPage);
        },
    },

    methods: {
        resetFilters() {
            this.searchQuery = "";
            this.selectedCity = "";
            this.currentPage = 1;
        },

        async fetchPublishers() {
            this.loading = true;
            try { this.publishers = await publisherService.getAll(); }
            catch (err) { this.publishers = []; }
            finally { this.loading = false; }
        },
        prevPage() { if (this.currentPage > 1) this.currentPage--; },
        nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
        openAddModal() { this.editingPublisher = null; this.showForm = true; },
        openEditModal(publisher) { this.editingPublisher = { ...publisher }; this.showForm = true; },
        closeForm() { this.showForm = false; this.editingPublisher = null; },
        async handleSave(publisher) {
            try {
                if (publisher._id) await publisherService.update(publisher._id, publisher);
                else await publisherService.create(publisher);
                await this.fetchPublishers();
            } catch (err) { console.error("Lỗi lưu NXB:", err); }
            finally { this.closeForm(); }
        },
        async handleDelete(publisher) {
            try {
                const response = await publisherService.delete(publisher._id);

                // Xóa thành công
                await this.fetchPublishers();
                this.closeForm();

                Swal.fire({
                    icon: "success",
                    title: "Đã xóa NXB",
                    text: (response?.data?.message || response?.message || "Xóa nhà xuất bản thành công."),
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });
            } catch (err) {
                console.error("Lỗi khi xóa NXB:", err);

                // Xử lý lỗi từ backend
                const errorMessage =
                    err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi xóa NXB. Vui lòng thử lại.";

                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: errorMessage,
                    toast: true,
                    position: "top-end",
                });
            } finally {
                await this.fetchPublishers(); // Luôn làm mới danh sách
            }
        },

        async confirmDelete(publisher) {
            const result = await Swal.fire({
                title: "Bạn có chắc muốn xóa?",
                text: `NXB: ${publisher.tenNXB}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            });

            if (!result.isConfirmed) return;

            await this.handleDelete(publisher);
        }







    },
    mounted() { this.fetchPublishers(); },
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
