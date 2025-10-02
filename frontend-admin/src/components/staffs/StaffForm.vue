<template>
    <div>
        <form @submit.prevent="handleSubmit">
            <!-- Tên nhân viên -->
            <div class="mb-3">
                <label class="form-label">Tên nhân viên</label>
                <input type="text" class="form-control" v-model="localStaff.hoTenNV"
                    :class="{ 'is-invalid': v$.localStaff.hoTenNV.$error }" />
                <div v-if="v$.localStaff.hoTenNV.$error" class="text-danger">
                    <span v-if="!v$.localStaff.hoTenNV.required">Vui lòng nhập tên nhân viên</span>
                    <span v-else>Tên nhân viên phải ít nhất 3 ký tự</span>
                </div>
            </div>

            <!-- Chức vụ -->
            <div class="mb-3">
                <label class="form-label">Chức vụ</label>
                <select v-model="localStaff.chucVu" class="form-control"
                    :class="{ 'is-invalid': v$.localStaff.chucVu.$error }">
                    <option disabled value="">-- Chọn chức vụ --</option>
                    <option value="Thủ thư">Thủ thư</option>
                    <option value="Admin">Admin</option>
                    <option value="Nhân viên hỗ trợ">Nhân viên hỗ trợ</option>
                    <option value="Nhân viên kiểm duyệt">Nhân viên kiểm duyệt</option>
                    <option value="Nhân viên IT">Nhân viên IT</option>
                </select>
                <div v-if="v$.localStaff.chucVu.$error" class="text-danger">
                    Vui lòng chọn chức vụ
                </div>
            </div>

            <!-- Email -->
            <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="text" class="form-control" v-model="localStaff.email"
                    :class="{ 'is-invalid': v$.localStaff.email.$error }" />
                <div v-if="v$.localStaff.email.$error" class="text-danger">
                    <span v-if="!v$.localStaff.email.required">Vui lòng nhập email</span>
                    <span v-else>Định dạng email không hợp lệ</span>
                </div>
            </div>

            <!-- Số điện thoại -->
            <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input type="text" class="form-control" v-model="localStaff.soDienThoai"
                    :class="{ 'is-invalid': v$.localStaff.soDienThoai.$error }" />
                <div v-if="v$.localStaff.soDienThoai.$error" class="text-danger">
                    <span v-if="!v$.localStaff.soDienThoai.required">Vui lòng nhập số điện thoại</span>
                    <span v-else>Số điện thoại không hợp lệ (10–11 số)</span>
                </div>
            </div>

            <!-- Địa chỉ -->
            <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input type="text" class="form-control" v-model="localStaff.diaChi"
                    :class="{ 'is-invalid': v$.localStaff.diaChi.$error }" />
                <div v-if="v$.localStaff.diaChi.$error" class="text-danger">
                    Vui lòng nhập địa chỉ (ít nhất 5 ký tự)
                </div>
            </div>

            <!-- Phái -->
            <div class="mb-3">
                <label class="form-label">Phái</label>
                <select v-model="localStaff.phai" class="form-control"
                    :class="{ 'is-invalid': v$.localStaff.phai.$error }">
                    <option disabled value="">-- Chọn phái --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Không rõ">Không rõ</option>
                </select>
                <div v-if="v$.localStaff.phai.$error" class="text-danger">
                    Vui lòng chọn phái
                </div>
            </div>

            <!-- Ngày sinh -->
            <div class="mb-3">
                <label class="form-label">Ngày sinh</label>
                <input type="date" class="form-control" v-model="localStaff.ngaySinh"
                    :class="{ 'is-invalid': v$.localStaff.ngaySinh.$error }" />
                <div v-if="v$.localStaff.ngaySinh.$error" class="text-danger">
                    <span v-if="!v$.localStaff.ngaySinh.required">Vui lòng chọn ngày sinh</span>
                    <span v-else>Nhân viên phải từ 18 tuổi trở lên</span>
                </div>
            </div>

            <!-- Ảnh đại diện -->
            <div class="mb-3">
                <label class="form-label">Ảnh đại diện</label>
                <UploadImage v-model="localStaff.anh" />
            </div>

            <!-- Nút -->
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-danger" @click="handleDelete" v-if="localStaff._id">
                    Xóa
                </button>
                <button class="btn btn-secondary" @click="handleCancel" type="button">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    </div>
</template>

<script>
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, helpers } from "@vuelidate/validators";
import UploadImage from "../UploadImage.vue";
import Swal from "sweetalert2";

export default {
    components: { UploadImage },
    props: {
        staff: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            localStaff: {
                hoTenNV: "",
                chucVu: "",
                email: "",
                soDienThoai: "",
                diaChi: "",
                phai: "",
                ngaySinh: "",
                anh: null,
                ...this.staff,
            },
            v$: null,
        };
    },
    created() {
        this.v$ = useVuelidate(this.$options.validations, this);
    },
    validations: {
        localStaff: {
            hoTenNV: { required, minLength: minLength(3) },
            chucVu: { required },
            email: { required, email },
            soDienThoai: {
                required,
                phone: helpers.regex(/^[0-9]{10,11}$/),
            },
            diaChi: { required, minLength: minLength(5) },
            phai: { required },
            ngaySinh: {
                required,
                adult: helpers.withMessage("Nhân viên phải từ 18 tuổi trở lên", (value) => {
                    if (!value) return false;
                    const dob = new Date(value);
                    if (isNaN(dob)) return false;
                    const today = new Date();
                    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                    return dob <= minDate;
                }),
            },
        },
    },
    methods: {
        async handleSubmit() {
            this.v$.$touch();
            if (this.v$.$invalid) {
                this.$nextTick(() => {
                    const firstErrorField = this.$el.querySelector(
                        "input.is-invalid, select.is-invalid, textarea.is-invalid, .is-invalid input"
                    );
                    if (firstErrorField) {
                        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
                        firstErrorField.focus();
                    }
                });
                return;
            }

            this.$emit("save", this.localStaff);

            await Swal.fire({
                icon: "success",
                title: this.localStaff._id ? "Cập nhật nhân viên thành công!" : "Thêm nhân viên thành công!",
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: "top-end",
            });
        },
        async handleDelete() {
            if (!this.localStaff._id) return;
            const result = await Swal.fire({
                title: "Bạn chắc chắn muốn xóa?",
                text: `Nhân viên này sẽ bị xóa`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            });
            if (result.isConfirmed) {
                this.$emit("delete", this.localStaff);
                await Swal.fire({
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
            if (result.isConfirmed) this.$emit("cancel");
        },
    },
};
</script>
