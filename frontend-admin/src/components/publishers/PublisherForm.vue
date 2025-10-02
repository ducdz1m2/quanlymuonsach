<template>
    <div>
        <form @submit.prevent="handleSubmit" novalidate>
            <!-- Mã nhà xuất bản -->
            <div class="mb-3">
                <label class="form-label">Mã nhà xuất bản</label>
                <input type="text" class="form-control" v-model="localPublisher.maNXB" readonly
                    :placeholder="!localPublisher.maNXB ? '(Đang sinh tự động)' : ''" />
            </div>

            <!-- Tên NXB -->
            <div class="mb-3">
                <label class="form-label">Tên nhà xuất bản</label>
                <input type="text" class="form-control" v-model="localPublisher.tenNXB"
                    :class="{ 'is-invalid': v$.localPublisher.tenNXB.$error }" />
                <div v-if="v$.localPublisher.tenNXB.$error" class="text-danger">
                    {{ v$.localPublisher.tenNXB.$errors[0].$message }}
                </div>
            </div>

            <!-- Địa chỉ -->
            <div class="mb-3">
                <label class="form-label">Địa chỉ nhà xuất bản</label>
                <input type="text" class="form-control" v-model="localPublisher.diaChi"
                    :class="{ 'is-invalid': v$.localPublisher.diaChi.$error }" />
                <div v-if="v$.localPublisher.diaChi.$error" class="text-danger">
                    {{ v$.localPublisher.diaChi.$errors[0].$message }}
                </div>
            </div>

            <!-- Ảnh đại diện -->
            <div class="mb-3">
                <label class="form-label">Ảnh đại diện</label>
                <UploadImage v-model="localPublisher.anh" />
            </div>

            <!-- Buttons -->
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-danger" @click="handleDelete" v-if="localPublisher._id">
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
import { required, minLength, helpers } from "@vuelidate/validators";
import UploadImage from "../UploadImage.vue";
import Swal from "sweetalert2";
import { nextTick } from "vue";

export default {
    components: { UploadImage },
    props: { publisher: { type: Object, default: () => ({}) } },
    data() {
        return {
            localPublisher: {
                maNXB: "",
                tenNXB: "",
                diaChi: "",
                anh: null,
                ...this.publisher,
            },
            v$: null,
        };
    },
    created() {
        this.v$ = useVuelidate(this.validations, this);
    },
    validations() {
        return {
            localPublisher: {
                maNXB: {}, // readonly, backend tự sinh
                tenNXB: {
                    required: helpers.withMessage("Vui lòng nhập tên nhà xuất bản", required),
                    minLength: helpers.withMessage("Tên phải có ít nhất 3 ký tự", minLength(3)),
                },
                diaChi: {
                    required: helpers.withMessage("Vui lòng nhập địa chỉ nhà xuất bản", required),
                    minLength: helpers.withMessage("Địa chỉ phải có ít nhất 5 ký tự", minLength(5)),
                },
            },
        };
    },
    methods: {
        async handleSubmit() {
            this.v$.$touch();

            if (this.v$.$invalid) {
                await nextTick();
                const firstError = this.$el.querySelector(".is-invalid");
                if (firstError) {
                    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
                    firstError.focus({ preventScroll: true });
                }
                return;
            }

            this.$emit("save", this.localPublisher);

            await Swal.fire({
                icon: "success",
                title: this.localPublisher._id ? "Cập nhật NXB thành công!" : "Thêm NXB thành công!",
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: "top-end",
            });
        },
        async handleDelete() {
            if (!this.localPublisher._id) return;
            const result = await Swal.fire({
                title: "Bạn chắc chắn muốn xóa?",
                text: `Nhà xuất bản này sẽ bị xóa`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            });

            if (!result.isConfirmed) return;

            this.$emit("delete", this.localPublisher);
            Swal.fire({
                icon: "success",
                title: "Đã xóa thành công!",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
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
            if (result.isConfirmed) this.$emit("cancel");
        },
    },
};
</script>
