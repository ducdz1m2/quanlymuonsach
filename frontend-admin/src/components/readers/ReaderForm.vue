<template>
    <div>
        <form @submit.prevent="handleSubmit">
            <!-- Mã độc giả -->
            <div class="mb-3">
                <label class="form-label">Mã độc giả</label>
                <input type="text" class="form-control" v-model="localReader.maDG" readonly
                    :placeholder="!localReader.maDG ? '(Đang sinh tự động)' : ''" />
            </div>

            <!-- Họ lót -->
            <div class="mb-3">
                <label class="form-label">Họ lót</label>
                <input type="text" class="form-control" v-model="localReader.hoLot"
                    :class="{ 'is-invalid': v$.localReader.hoLot.$error }" />
                <div v-if="v$.localReader.hoLot.$error" class="text-danger">
                    <span v-if="!v$.localReader.hoLot.required">Vui lòng nhập họ lót</span>
                    <span v-else>Họ lót phải có ít nhất 2 ký tự</span>
                </div>
            </div>

            <!-- Tên -->
            <div class="mb-3">
                <label class="form-label">Tên</label>
                <input type="text" class="form-control" v-model="localReader.ten"
                    :class="{ 'is-invalid': v$.localReader.ten.$error }" />
                <div v-if="v$.localReader.ten.$error" class="text-danger">
                    <span v-if="!v$.localReader.ten.required">Vui lòng nhập tên</span>
                    <span v-else>Tên phải có ít nhất 2 ký tự</span>
                </div>
            </div>
            <!-- Mật khẩu -->
            <div class="mb-3">
                <label class="form-label">Mật khẩu</label>
                <input type="password" class="form-control" v-model="localReader.password"
                    :class="{ 'is-invalid': v$.localReader.password.$error }" />
                <div v-if="v$.localReader.password.$error" class="text-danger">
                    <span v-if="!v$.localReader.password.required">Vui lòng nhập mật khẩu</span>
                    <span v-else>Mật khẩu phải có ít nhất 6 ký tự</span>
                </div>
            </div>

            <!-- Ngày sinh -->
            <div class="mb-3">
                <label class="form-label">Ngày sinh</label>
                <input type="date" class="form-control" v-model="localReader.ngaySinh"
                    :class="{ 'is-invalid': v$.localReader.ngaySinh.$error }" />
                <div v-if="v$.localReader.ngaySinh.$error" class="text-danger">
                    <span v-if="!v$.localReader.ngaySinh.required">Vui lòng chọn ngày sinh</span>
                    <span v-else>Độc giả phải từ 12 tuổi trở lên và không vượt quá ngày hiện tại</span>
                </div>
            </div>

            <!-- Phái -->
            <div class="mb-3">
                <label class="form-label">Phái</label>
                <select v-model="localReader.phai" class="form-control"
                    :class="{ 'is-invalid': v$.localReader.phai.$error }">
                    <option disabled value="">-- Chọn phái --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Không rõ">Không rõ</option>
                </select>
                <div v-if="v$.localReader.phai.$error" class="text-danger">Vui lòng chọn phái</div>
            </div>

            <!-- Địa chỉ -->
            <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input type="text" class="form-control" v-model="localReader.diaChi"
                    :class="{ 'is-invalid': v$.localReader.diaChi.$error }" />
                <div v-if="v$.localReader.diaChi.$error" class="text-danger">
                    <span v-if="!v$.localReader.diaChi.required">Vui lòng nhập địa chỉ</span>
                    <span v-else>Địa chỉ phải ít nhất 5 ký tự</span>
                </div>
            </div>

            <!-- Điện thoại -->
            <div class="mb-3">
                <label class="form-label">Điện thoại</label>
                <input type="text" class="form-control" v-model="localReader.dienThoai"
                    :class="{ 'is-invalid': v$.localReader.dienThoai.$error }" />
                <div v-if="v$.localReader.dienThoai.$error" class="text-danger">
                    <span v-if="!v$.localReader.dienThoai.required">Vui lòng nhập số điện thoại</span>
                    <span v-else>Số điện thoại không hợp lệ (phải gồm 10 số, bắt đầu bằng 0)</span>
                </div>
            </div>

            <!-- Ảnh đại diện -->
            <div class="mb-3">
                <label class="form-label">Ảnh đại diện</label>
                <UploadImage v-model="localReader.anh" />
            </div>

            <!-- Nút -->
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-danger" @click="handleDelete" v-if="localReader._id">
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
    props: {
        reader: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            localReader: {
                maDG: "",
                hoLot: "",
                ten: "",
                password: "",
                ngaySinh: "",
                phai: "",
                diaChi: "",
                dienThoai: "",
                anh: null,
                ...this.reader,
            },
            v$: null,
        };
    },
    created() {
        this.v$ = useVuelidate(this.$options.validations, this);
    },
    validations: {
        localReader: {
            maDG: {}, // readonly, backend tự sinh
            hoLot: { required, minLength: minLength(2) },
            ten: { required, minLength: minLength(2) },
            password: { required, minLength: minLength(6) },
            ngaySinh: {
                required,
                minAge12: helpers.withMessage(
                    "Độc giả phải từ 12 tuổi trở lên và không vượt quá ngày hiện tại",
                    (value) => {
                        if (!value) return false;
                        const dob = new Date(value);
                        if (isNaN(dob)) return false;
                        const today = new Date();
                        const minDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
                        return dob <= today && dob <= minDate;
                    }
                ),
            },
            phai: { required },
            diaChi: { required, minLength: minLength(5) },
            dienThoai: { required, phone: helpers.regex(/^(0\d{9})$/) },
        },
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

            this.$emit("save", this.localReader);

            await Swal.fire({
                icon: "success",
                title: this.localReader._id
                    ? "Cập nhật độc giả thành công!"
                    : "Thêm độc giả thành công!",
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: "top-end",
            });
        },
        async handleDelete() {
            if (!this.localReader._id) return;

            const result = await Swal.fire({
                title: "Bạn chắc chắn muốn xóa?",
                text: `Độc giả: ${this.localReader.hoLot} ${this.localReader.ten}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            });

            if (!result.isConfirmed) return;

            this.$emit("delete", this.localReader);
            Swal.fire({
                icon: "success",
                title: "Đã xóa độc giả!",
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
