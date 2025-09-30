<template>
    <div>
        <form @submit.prevent="handleSubmit">
            <!-- Chọn sách -->
            <div class="mb-3">
                <label class="form-label">Sách</label>
                <select v-model="localBorrow.bookId" class="form-control" required>
                    <option disabled value="">-- Chọn sách --</option>
                    <option v-for="book in books" :key="book._id" :value="book._id">
                        {{ book.tenSach }}
                    </option>
                </select>
            </div>

            <!-- Chọn độc giả -->
            <div class="mb-3">
                <label class="form-label">Độc giả</label>
                <select v-model="localBorrow.docGiaId" class="form-control" required>
                    <option disabled value="">-- Chọn độc giả --</option>
                    <option v-for="reader in readers" :key="reader._id" :value="reader._id">
                        {{ reader.hoLot }} {{ reader.ten }}
                    </option>
                </select>
            </div>

            <!-- Ngày mượn -->
            <div class="mb-3">
                <label class="form-label">Ngày mượn</label>
                <input type="date" class="form-control" v-model="localBorrow.ngayMuon" />
            </div>

            <!-- Ngày trả -->
            <div class="mb-3">
                <label class="form-label">Ngày trả</label>
                <input type="date" class="form-control" v-model="localBorrow.ngayTra" />
            </div>

            <!-- Trạng thái -->
            <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select v-model="localBorrow.trangThai" class="form-control">
                    <option value="san_sang">Sẵn sàng</option>
                    <option value="cho_duyet">Chờ duyệt</option>
                    <option value="da_duyet">Đã duyệt</option>
                    <option value="dang_muon">Đang mượn</option>
                    <option value="da_tra">Đã trả</option>
                </select>
            </div>

            <!-- Nút -->
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="handleCancel">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    </div>
</template>

<script>
import bookService from "@/services/book.service";
import readerService from "@/services/reader.service";

export default {
    props: {
        borrow: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            localBorrow: {
                ...this.borrow,
                trangThai: this.borrow?.trangThai || "san_sang"
            },
            books: [],
            readers: []
        };
    },
    watch: {
        borrow: {
            handler(newVal) {
                this.localBorrow = { ...newVal };
            },
            deep: true
        }
    },
    methods: {
        handleSubmit() {
            this.$emit("save", this.localBorrow);
        },
        handleCancel() {
            this.$emit("cancel");
        },
        async fetchBooks() {
            try {
                this.books = await bookService.getAll();
            } catch (err) {
                console.error("Lỗi tải sách:", err);
            }
        },
        async fetchReaders() {
            try {
                this.readers = await readerService.getAll();
            } catch (err) {
                console.error("Lỗi tải độc giả:", err);
            }
        }
    },
    mounted() {
        this.fetchBooks();
        this.fetchReaders();
    }
};
</script>
