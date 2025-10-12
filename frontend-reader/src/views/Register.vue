<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light p-3 auth-card">
        <div class="card shadow p-4 w-100 auth-card" style="max-width: 360px;">
            <h4 class="text-center mb-4">📘 Đăng ký độc giả</h4>

            <form @submit.prevent="handleSubmit" novalidate>
                <!-- Họ lót -->
                <div class="mb-2">
                    <label class="form-label small">👤 Họ lót</label>
                    <input type="text" v-model="reader.hoLot" class="form-control form-control-sm"
                        :class="{ 'is-invalid': v$.reader.hoLot.$error }" placeholder="Nhập họ lót..." />
                    <div v-if="v$.reader.hoLot.$error" class="invalid-feedback small">
                        <span v-if="!v$.reader.hoLot.required">Vui lòng nhập họ lót</span>
                        <span v-else>Họ lót phải có ít nhất 2 ký tự</span>
                    </div>
                </div>

                <!-- Tên -->
                <div class="mb-2">
                    <label class="form-label small">🪪 Tên</label>
                    <input type="text" v-model="reader.ten" class="form-control form-control-sm"
                        :class="{ 'is-invalid': v$.reader.ten.$error }" placeholder="Nhập tên..." />
                    <div v-if="v$.reader.ten.$error" class="invalid-feedback small">
                        <span v-if="!v$.reader.ten.required">Vui lòng nhập tên</span>
                        <span v-else>Tên phải có ít nhất 2 ký tự</span>
                    </div>
                </div>

                <!-- Ngày sinh -->
                <div class="mb-2">
                    <label class="form-label small">🎂 Ngày sinh</label>
                    <input type="date" v-model="reader.ngaySinh" class="form-control form-control-sm"
                        :class="{ 'is-invalid': v$.reader.ngaySinh.$error }" />
                    <div v-if="v$.reader.ngaySinh.$error" class="invalid-feedback small">
                        <span v-if="!v$.reader.ngaySinh.required">Vui lòng chọn ngày sinh</span>
                        <span v-else>Độc giả phải từ 12 tuổi trở lên</span>
                    </div>
                </div>

                <!-- Phái -->
                <div class="mb-2">
                    <label class="form-label small">⚧️ Phái</label>
                    <select v-model="reader.phai" class="form-select form-select-sm"
                        :class="{ 'is-invalid': v$.reader.phai.$error }">
                        <option disabled value="">-- Chọn phái --</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Không rõ">Không rõ</option>
                    </select>
                    <div v-if="v$.reader.phai.$error" class="invalid-feedback small">Vui lòng chọn phái</div>
                </div>

                <!-- Địa chỉ -->
                <div class="mb-2">
                    <label class="form-label small">🏠 Địa chỉ</label>
                    <input type="text" v-model="reader.diaChi" class="form-control form-control-sm"
                        :class="{ 'is-invalid': v$.reader.diaChi.$error }" placeholder="Nhập địa chỉ..." />
                    <div v-if="v$.reader.diaChi.$error" class="invalid-feedback small">
                        <span>Địa chỉ phải ít nhất 5 ký tự</span>
                    </div>
                </div>

                <!-- Điện thoại -->
                <div class="mb-2">
                    <label class="form-label small">📱 Số điện thoại</label>
                    <input type="text" v-model="reader.dienThoai" class="form-control form-control-sm"
                        :class="{ 'is-invalid': v$.reader.dienThoai.$error }" placeholder="Nhập số điện thoại..." />
                    <div v-if="v$.reader.dienThoai.$error" class="invalid-feedback small">
                        <span v-if="!v$.reader.dienThoai.required">Vui lòng nhập số điện thoại</span>
                        <span v-else>Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)</span>
                    </div>
                </div>

                <!-- Mật khẩu -->
                <div class="mb-2">
                    <label class="form-label small">🔑 Mật khẩu</label>
                    <input type="password" v-model="reader.password" class="form-control form-control-sm"
                        :class="{ 'is-invalid': v$.reader.password.$error }" placeholder="Nhập mật khẩu..." />
                    <div v-if="v$.reader.password.$error" class="invalid-feedback small">
                        <span v-if="!v$.reader.password.required">Vui lòng nhập mật khẩu</span>
                        <span v-else>Mật khẩu phải có ít nhất 6 ký tự</span>
                    </div>
                </div>

                <!-- Xác nhận mật khẩu -->
                <div class="mb-2">
                    <label class="form-label small">🔁 Xác nhận mật khẩu</label>
                    <input type="password" v-model="confirmPassword" class="form-control form-control-sm"
                        :class="{ 'is-invalid': v$.confirmPassword.$error }" placeholder="Nhập lại mật khẩu..." />
                    <div v-if="v$.confirmPassword.$error" class="invalid-feedback small">
                        <span v-if="!v$.confirmPassword.required">Vui lòng nhập lại mật khẩu</span>
                        <span v-else>Mật khẩu không khớp</span>
                    </div>
                </div>

                <!-- Ảnh đại diện -->
                <div class="mb-3">
                    <label class="form-label small">🖼️ Ảnh đại diện</label>
                    <UploadImage v-model="reader.anh" small />
                </div>

                <!-- Lỗi hệ thống -->
                <div v-if="error" class="text-danger text-center small mb-2">{{ error }}</div>

                <!-- Nút -->
                <button type="submit" class="btn btn-primary w-100 btn-sm" :disabled="loading">
                    <span v-if="loading">Đang đăng ký...</span>
                    <span v-else>Đăng ký</span>
                </button>

                <div class="text-center mt-2">
                    <router-link to="/login" class="small text-decoration-none">🔑 Đã có tài khoản? Đăng
                        nhập</router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import useVuelidate from "@vuelidate/core";
import { required, minLength, helpers } from "@vuelidate/validators";
import UploadImage from "@/components/UploadImage.vue";
import readerService from "@/services/reader.service";
import Swal from "sweetalert2";
import { nextTick } from "vue";

export default {
    name: "RegisterReader",
    components: { UploadImage },
    data() {
        return {
            reader: {
                hoLot: "",
                ten: "",
                ngaySinh: "",
                phai: "",
                diaChi: "",
                dienThoai: "",
                password: "",
                anh: null,
            },
            confirmPassword: "",
            loading: false,
            error: "",
        };
    },

    validations() {
        return {
            reader: {
                hoLot: { required, minLength: minLength(2) },
                ten: { required, minLength: minLength(2) },
                ngaySinh: {
                    required,
                    minAge12: helpers.withMessage("Độc giả phải từ 12 tuổi trở lên", (value) => {
                        if (!value) return false;
                        const dob = new Date(value);
                        const today = new Date();
                        const minDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
                        return dob <= minDate;
                    }),
                },
                phai: { required },
                diaChi: { required, minLength: minLength(5) },
                dienThoai: { required, phone: helpers.regex(/^(0\d{9})$/) },
                password: { required, minLength: minLength(6) },
            },
            confirmPassword: {
                required,
                matchesPassword: helpers.withMessage(
                    "Mật khẩu không khớp",
                    (value, vm) => value === vm.reader.password
                ),
            },
        };
    },
    setup() {
        // ✅ Gọi useVuelidate đúng cách (Vuelidate sẽ tự liên kết validations() và dữ liệu component)
        const v$ = useVuelidate();
        return { v$ };
    },


    methods: {
        async handleSubmit() {
            // chạm validation
            this.v$.$touch();

            if (this.v$.$invalid) {
                // đợi DOM render class is-invalid
                await nextTick();
                const firstErr = this.$el.querySelector(".is-invalid");
                if (firstErr) {
                    firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
                    try { firstErr.focus({ preventScroll: true }); } catch (e) { }
                }
                this.error = "Vui lòng kiểm tra lại thông tin.";
                return;
            }

            this.error = "";
            this.loading = true;

            try {
                const payload = { ...this.reader };
                const result = await readerService.create(payload);
                console.log(result)
                if (!result) {
                    this.error = "Không thể đăng ký, vui lòng thử lại!";
                    return;
                }

                await Swal.fire({
                    icon: "success",
                    title: "🎉 Đăng ký thành công!",
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: "top-end",
                });

                // reset state
                this.confirmPassword = "";
                this.v$.$reset();

                this.$router.push("/login");
            } catch (err) {
                console.error("Lỗi đăng ký:", err);
                this.error = err?.response?.data?.message || "Không thể kết nối tới máy chủ!";
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.min-vh-100 {
    min-height: 100vh;
}
</style>
