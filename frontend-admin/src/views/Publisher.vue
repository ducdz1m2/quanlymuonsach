<template>
    <div class="p-4">
        <h1 class="mb-4">👨‍💼 Quản lý Nhà xuất bản</h1>

        <!-- Thanh công cụ -->
        <div class="d-flex justify-content-between mb-3">
            <input type="text" class="form-control w-25" placeholder="🔍 Tìm kiếm nhà xuất bản..."
                v-model="searchQuery" />
            <button class="btn btn-primary" @click="openAddModal">+ Thêm nhà xuất bản</button>
        </div>

        <!-- Bảng danh sách -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Tên NXB</th>
                        <th>Địa chỉ</th>
                        <th>Ảnh</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="publisher in paginatedPublishers" :key="publisher._id">
                        <td class="text-start">{{ publisher.tenNXB }}</td>
                        <td class="text-start">{{ publisher.diaChi }}</td>

                        <td>
                            <img :src="publisher.anh || '/images/default-publisher.png'" width="60" height="80"
                                class="rounded shadow-sm" />
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(publisher)">Sửa</button>
                            <button class="btn btn-sm btn-danger" @click="deletePublisher(publisher._id)">Xóa</button>
                        </td>
                    </tr>
                    <tr v-if="!loading && paginatedPublishers.length === 0">
                        <td colspan="9">Không có NXB phù hợp</td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="9">⏳ Đang tải dữ liệu...</td>
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

        <div v-if="showForm" class="modal-backdrop">
            <div class="modal-content p-4">
                <h5>{{ editingPublisher ? "✏️ Sửa NXB" : "➕ Thêm NXB" }}</h5>
                <PublisherForm :publisher="editingPublisher" @save="handleSave" @cancel="closeForm" />
            </div>
        </div>
    </div>
</template>

<script>
import PublisherForm from '@/components/publishers/PublisherForm.vue';
import publisherService from '@/services/publisher.service';
export default {

    components: {
        PublisherForm
    },

    data() {

        return {

            publishers: [],
            searchQuery: "",
            loading: false,

            showForm: false,
            editingPublisher: null,

            currentPage: 1,
            itemsPerPage: 5,
        };
    },

    computed: {
        filteredPublishers() {
            const q = this.searchQuery.trim().toLowerCase();
            if (!q) return this.publishers;

            return this.publishers.filter(b => {
                const name = b.tenNXB ? b.tenNXB.toLowerCase() : "";
                const address = b.diaChi ? b.diaChi.toLowerCase() : "";

                return (
                    name.includes(q) ||
                    address.includes(q)
                );
            });
        },

        totalPages() {
            return Math.ceil(this.filteredPublishers.length / this.itemsPerPage);
        },
        paginatedPublishers() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredPublishers.slice(start, end);
        },
    },

    methods: {
        async fetchPublishers() {
            this.loading = true;
            try {
                this.publishers = await publisherService.getAll();

            } catch (err) {
                this.publishers = []
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
            this.editingPublisher = null;
            this.showForm = true;
        },
        openEditModal(publisher) {
            this.editingPublisher = { ...publisher };
            this.showForm = true;
        },
        closeForm() {
            this.showForm = false;
            this.editingPublisher = null;
        },
        async handleSave(publisher) {
            try {

                if (publisher._id) {

                    await publisherService.update(publisher._id, publisher);


                } else {
                    await publisherService.create(publisher);
                }

            } catch (err) {
                console.error("Lỗi lưu NXB:", err);
            } finally {
                this.closeForm();
                this.fetchPublishers();
            }
        },
        async deletePublisher(id) {
            try {
                await publisherService.delete(id);
                await this.fetchPublishers();
            } catch (err) {
                console.error("Lỗi xóa NXB:", err);
                alert("❌ Xóa thất bại!");
            }
        },
    },

    mounted() {
        this.fetchPublishers();
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
