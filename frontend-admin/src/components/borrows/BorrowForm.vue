<template>
    <div>
        <form @submit.prevent="handleSubmit" novalidate>
            <!-- Sách -->
            <div class="mb-3">
                <label class="form-label">Sách</label>
                <select v-model="localBorrow.bookId" class="form-control"
                    :class="{ 'is-invalid': v$.localBorrow.bookId.$error }">
                    <option disabled value="">-- Chọn sách --</option>
                    <option v-for="book in books" :key="book._id" :value="book._id">
                        {{ book.tenSach }}
                    </option>
                </select>
                <div v-if="v$.localBorrow.bookId.$error" class="text-danger">
                    {{ v$.localBorrow.bookId.$errors[0].$message }}
                </div>
            </div>

            <!-- Độc giả -->
            <div class="mb-3">
                <label class="form-label">Độc giả</label>
                <select v-model="localBorrow.docGiaId" class="form-control"
                    :class="{ 'is-invalid': v$.localBorrow.docGiaId.$error }">
                    <option disabled value="">-- Chọn độc giả --</option>
                    <option v-for="reader in readers" :key="reader._id" :value="reader._id">
                        {{ reader.hoLot }} {{ reader.ten }}
                    </option>
                </select>
                <div v-if="v$.localBorrow.docGiaId.$error" class="text-danger">
                    {{ v$.localBorrow.docGiaId.$errors[0].$message }}
                </div>
            </div>

            <!-- Ngày mượn -->
            <div class="mb-3">
                <label class="form-label">Ngày mượn</label>
                <input type="date" v-model="localBorrow.ngayMuon" class="form-control"
                    :class="{ 'is-invalid': v$.localBorrow.ngayMuon.$error }" />
                <div v-if="v$.localBorrow.ngayMuon.$error" class="text-danger">
                    {{ v$.localBorrow.ngayMuon.$errors[0].$message }}
                </div>
            </div>

            <!-- Ngày trả -->
            <div class="mb-3">
                <label class="form-label">Ngày trả</label>
                <input type="date" v-model="localBorrow.ngayTra" class="form-control"
                    :class="{ 'is-invalid': v$.localBorrow.ngayTra.$error }" />
                <div v-if="v$.localBorrow.ngayTra.$error" class="text-danger">
                    {{ v$.localBorrow.ngayTra.$errors[0].$message }}
                </div>
            </div>

            <!-- Trạng thái -->
            <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select v-model="localBorrow.trangThai" class="form-control"
                    :class="{ 'is-invalid': v$.localBorrow.trangThai.$error }">
                    <option disabled value="">-- Chọn trạng thái --</option>

                    <!-- Trạng thái hiện tại (disabled) -->
                    <option :value="currentStatus" disabled>{{ currentStatus }}</option>

                    <!-- Trạng thái tiếp theo -->
                    <option v-for="status in nextStatus" :key="status" :value="status">
                        {{ status }}
                    </option>
                </select>
                <div v-if="v$.localBorrow.trangThai.$error" class="text-danger">
                    {{ v$.localBorrow.trangThai.$errors[0].$message }}
                </div>
            </div>


            <!-- Buttons -->
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-danger" @click="handleDelete" v-if="localBorrow._id">
                    Xóa
                </button>
                <button type="button" class="btn btn-secondary" @click="handleCancel">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    </div>
</template>

<script>
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import Swal from "sweetalert2";
import bookService from "@/services/book.service";
import readerService from "@/services/reader.service";
import borrowService from "@/services/borrow.service";

export default {
    props: { borrow: { type: Object, default: () => ({}) } },
    setup() { return { v$: useVuelidate() }; },
    data() {
        const initialBorrow = this.borrow || {}; // tránh null
        return {
            localBorrow: { bookId: "", docGiaId: "", ngayMuon: "", ngayTra: "", trangThai: "", ...initialBorrow },
            currentStatus: initialBorrow.trangThai || "Chờ duyệt",
            books: [],
            readers: [],
        };
    },
    watch: {
        borrow: {
            handler(newVal) {
                this.localBorrow = { ...newVal };
                this.currentStatus = newVal.trangThai || "Chờ duyệt";
            }, deep: true
        }
    },
    validations() {
        const notInFuture = (value) => {
            if (!value) return true;
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const valDate = new Date(value); valDate.setHours(0, 0, 0, 0);
            return valDate <= today;
        };
        const afterNgayMuon = (getNgayMuon) => (value) => {
            const ngayMuon = getNgayMuon();
            if (!value || !ngayMuon) return true;
            const d1 = new Date(ngayMuon); d1.setHours(0, 0, 0, 0);
            const d2 = new Date(value); d2.setHours(0, 0, 0, 0);
            return d2 > d1;
        };
        const availableStock = (bookId, trangThai) => {
            if (!bookId) return true;
            if (trangThai === "Đã trả") return true;
            const book = this.books.find(b => b._id === bookId);
            return book ? book.soQuyen > 0 : false;
        };

        return {
            localBorrow: {
                bookId: {
                    required: helpers.withMessage("Vui lòng chọn sách", required),
                    availableStock: helpers.withMessage("Sách đã hết", (value) => availableStock(value, this.localBorrow.trangThai))
                },
                docGiaId: { required: helpers.withMessage("Vui lòng chọn độc giả", required) },
                ngayMuon: { required: helpers.withMessage("Vui lòng chọn ngày mượn", required), notInFuture: helpers.withMessage("Ngày mượn không được lớn hơn hôm nay", notInFuture) },
                ngayTra: { required: helpers.withMessage("Vui lòng chọn ngày trả", required), afterNgayMuon: helpers.withMessage("Ngày trả phải sau ngày mượn", afterNgayMuon(() => this.localBorrow.ngayMuon)) },
                trangThai: { required: helpers.withMessage("Vui lòng chọn trạng thái", required) }
            }
        };
    },
    computed: {
        nextStatus() {
            const order = ["Chờ duyệt", "Đang mượn", "Đã trả"];
            const idx = order.indexOf(this.currentStatus);
            // Trạng thái tiếp theo, nếu có
            return idx >= 0 && idx < order.length - 1 ? [order[idx + 1]] : [];
        },
        allowedStatuses() {
            const order = ["Chờ duyệt", "Đang mượn", "Đã trả"];
            if (!this.localBorrow._id) return ["Chờ duyệt"];
            const idx = order.indexOf(this.currentStatus);
            return [this.currentStatus, order[idx + 1]].filter(Boolean);
        }
    },
    methods: {
        handleSubmit() {
            this.v$.$touch();
            if (this.v$.$invalid) {
                this.$nextTick(() => {
                    const firstErrorField = this.$el.querySelector("input.is-invalid, select.is-invalid, textarea.is-invalid");
                    if (firstErrorField) firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
                });
                return;
            }

            this.$emit("save", this.localBorrow);
            this.currentStatus = this.localBorrow.trangThai; // cập nhật trạng thái hiện tại

            Swal.fire({
                icon: "success",
                title: this.localBorrow._id ? "Cập nhật phiếu mượn thành công!" : "Thêm phiếu mượn thành công!",
                showConfirmButton: false,
                timer: 2000,
                toast: true,
                position: "top-end",
            });
        },
        async handleDelete() {
            // Dùng currentStatus để kiểm tra trạng thái trước khi sửa
            if (this.currentStatus === "Đang mượn" || this.currentStatus === "Chờ duyệt") {
                return Swal.fire({
                    icon: "warning",
                    title: "⚠️ Không thể xóa",
                    text: "Phiếu mượn đang chờ duyệt hoặc đang mượn không thể xóa."
                });
            }

            try {
                await borrowService.delete(this.localBorrow._id);
                Swal.fire({
                    icon: "success",
                    title: "Đã xóa!",
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });
                this.$emit("cancel"); // đóng form sau xóa
            } catch (err) {
                console.error(err);
                Swal.fire("❌ Lỗi!", "Không thể xóa phiếu mượn.", "error");
            }
        }
        ,
        async handleCancel() {
            const result = await Swal.fire({
                title: "Bạn có chắc muốn hủy?",
                text: "Mọi thay đổi chưa lưu sẽ mất.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Hủy bỏ",
                cancelButtonText: "Tiếp tục chỉnh sửa",
            });
            if (result.isConfirmed) this.$emit("cancel");
        },
        async fetchBooks() { try { this.books = await bookService.getAll(); } catch (err) { console.error(err); } },
        async fetchReaders() { try { this.readers = await readerService.getAll(); } catch (err) { console.error(err); } },
    },
    mounted() { this.fetchBooks(); this.fetchReaders(); },
};
</script>

<style scoped>
.is-invalid {
    border-color: #dc3545;
}

.text-danger {
    font-size: 0.875rem;
}
</style>
