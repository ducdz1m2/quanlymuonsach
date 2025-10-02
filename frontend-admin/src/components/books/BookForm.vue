<template>
    <div>
        <form @submit.prevent="handleSubmit" novalidate>
            <div class="mb-3">
                <label class="form-label">Mã sách</label>
                <input type="text" v-model="localBook.maSach" class="form-control"
                    :class="{ 'is-invalid': v$.localBook.maSach.$error }" />
                <div v-if="v$.localBook.maSach.$error" class="text-danger">
                    Vui lòng nhập mã sách
                </div>
            </div>
            <!-- Tên sách -->
            <div class="mb-3">
                <label class="form-label">Tên sách</label>
                <input type="text" v-model="localBook.tenSach" class="form-control"
                    :class="{ 'is-invalid': v$.localBook.tenSach.$error }" />
                <div v-if="v$.localBook.tenSach.$error" class="text-danger">
                    Vui lòng nhập tên sách
                </div>
            </div>

            <!-- Tác giả -->
            <div class="mb-3">
                <label class="form-label">Tác giả</label>
                <input type="text" v-model="localBook.tacGia" class="form-control"
                    :class="{ 'is-invalid': v$.localBook.tacGia.$error }" />
                <div v-if="v$.localBook.tacGia.$error" class="text-danger">
                    Vui lòng nhập tác giả
                </div>
            </div>

            <!-- Số lượng -->
            <div class="mb-3">
                <label class="form-label">Số lượng</label>
                <input type="number" v-model.number="localBook.soQuyen" class="form-control" min="0"
                    :class="{ 'is-invalid': v$.localBook.soQuyen.$error }" />
                <div v-if="v$.localBook.soQuyen.$error" class="text-danger">
                    <span v-if="!v$.localBook.soQuyen.required">Vui lòng nhập số lượng</span>
                    <span v-else>Số lượng phải lớn hơn hoặc bằng 0</span>
                </div>
            </div>
            <!-- Thể loại -->
            <div class="mb-3">
                <label class="form-label">Thể loại</label>
                <select v-model="localBook.theLoai" class="form-select"
                    :class="{ 'is-invalid': v$.localBook.theLoai.$error }">
                    <option value="" disabled>-- Chọn thể loại --</option>
                    <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
                </select>
                <div v-if="v$.localBook.theLoai.$error" class="text-danger">
                    Vui lòng chọn thể loại
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Nhà xuất bản</label>
                <select v-model="localBook.maNXB" class="form-select"
                    :class="{ 'is-invalid': v$.localBook.maNXB.$error }">
                    <option value="" disabled>-- Chọn nhà xuất bản --</option>
                    <option v-for="publisher in publishers" :key="publisher._id" :value="publisher._id">
                        {{ publisher.tenNXB }}
                    </option>
                </select>
                <div v-if="v$.localBook.maNXB.$error" class="text-danger">
                    Vui lòng chọn nhà xuất bản
                </div>
            </div>
            <!-- Năm xuất bản -->
            <div class="mb-3">
                <label class="form-label">Năm xuất bản</label>
                <input type="number" v-model.number="localBook.namXuatBan" class="form-control"
                    :class="{ 'is-invalid': v$.localBook.namXuatBan.$error }" />
                <div v-if="v$.localBook.namXuatBan.$error" class="text-danger">
                    <span v-if="!v$.localBook.namXuatBan.required">Vui lòng nhập năm xuất bản</span>
                    <span v-else>Năm xuất bản không hợp lệ</span>
                </div>
            </div>

            <!-- Đơn giá -->
            <div class="mb-3">
                <label class="form-label">Đơn giá</label>
                <input type="number" v-model.number="localBook.donGia" class="form-control" min="0"
                    :class="{ 'is-invalid': v$.localBook.donGia.$error }" />
                <div v-if="v$.localBook.donGia.$error" class="text-danger">
                    <span v-if="!v$.localBook.donGia.required">Vui lòng nhập đơn giá</span>
                    <span v-else>Đơn giá phải lớn hơn hoặc bằng 0</span>
                </div>
            </div>

            <!-- Mô tả -->
            <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea v-model="localBook.moTa" class="form-control"></textarea>
            </div>

            <!-- Ảnh bìa -->
            <div class="mb-3">
                <label class="form-label">Ảnh bìa</label>
                <UploadImage v-model="localBook.anhBia" />
            </div>

            <!-- Buttons -->
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-danger" @click="handleDelete">
                    Xóa
                </button>
                <button type="button" class="btn btn-secondary" @click="handleCancel">
                    Hủy
                </button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    </div>
</template>
<script>
import { reactive, toRefs } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";
import UploadImage from "../UploadImage.vue";
import Swal from "sweetalert2";
import PublisherService from "@/services/publisher.service";

export default {
    components: { UploadImage },
    props: {
        book: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        const currentYear = new Date().getFullYear();
        const localBook = reactive({
            maSach: "",
            tenSach: "",
            tacGia: "",
            soQuyen: null,
            namXuatBan: null,
            donGia: null,
            moTa: "",
            anhBia: null,
            theLoai: "",
            maNXB: "",
            ...this.book,
        });

        return {
            localBook,
            genres: [
                "Văn học",
                "Khoa học",
                "Kinh tế",
                "Tâm lý",
                "Lịch sử",
                "Công nghệ",
                "Thiếu nhi",
                "Khác",
            ],
            publishers: reactive([]),
            v$: useVuelidate(
                {
                    localBook: {
                        maSach: { required },
                        tenSach: { required },
                        tacGia: { required },
                        soQuyen: { required, minValue: minValue(0) },
                        namXuatBan: {
                            required,
                            validYear: helpers.withMessage(
                                "Năm xuất bản không hợp lệ",
                                (value) => {
                                    if (!value) return false;
                                    const n = Number(value);
                                    return Number.isInteger(n) && n > 0 && n <= currentYear;
                                }
                            ),
                        },
                        donGia: { required, minValue: minValue(0) },
                        theLoai: { required },
                        maNXB: { required },
                    },
                },
                { localBook }
            ),
        };
    },
    async created() {
        try {
            const data = await PublisherService.getAll();
            this.publishers.push(...data);
        } catch (err) {
            console.error("Lỗi tải nhà xuất bản:", err);
            this.publishers = [];
        }
    },
    methods: {
        handleSubmit() {
            this.v$.$touch();
            if (this.v$.$invalid) {
                this.$nextTick(() => {
                    const firstErrorField = this.$el.querySelector(
                        "input.is-invalid, select.is-invalid, textarea.is-invalid"
                    );
                    if (firstErrorField) {
                        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
                        firstErrorField.focus();
                    }
                });
                return;
            }

            this.$emit("save", this.localBook);

            Swal.fire({
                icon: "success",
                title: this.localBook._id
                    ? "Cập nhật sách thành công!"
                    : "Thêm sách thành công!",
                text: this.localBook.tenSach,
                showConfirmButton: false,
                timer: 2000,
                toast: true,
                position: "top-end",
            });
        },
        async handleDelete() {
            if (!this.localBook._id) {
                Swal.fire({
                    icon: "info",
                    title: "Chưa thể xóa",
                    text: "Sách này chưa được lưu vào hệ thống",
                    timer: 1500,
                    showConfirmButton: false,
                });
                return;
            }

            const result = await Swal.fire({
                title: "Bạn chắc chắn muốn xóa?",
                text: `Sách: ${this.localBook.tenSach}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            });

            if (result.isConfirmed) {
                this.$emit("delete", this.localBook);
                Swal.fire({
                    icon: "success",
                    title: "Đã xóa thành công!",
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });
            }
        },
        async handleCancel() {
            const result = await Swal.fire({
                title: "Bạn có chắc muốn hủy?",
                text: "Mọi thay đổi chưa lưu sẽ mất.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Hủy bỏ",
                cancelButtonText: "Tiếp tục chỉnh sửa",
            });

            if (result.isConfirmed) {
                this.$emit("cancel");
            }
        },
    },
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
