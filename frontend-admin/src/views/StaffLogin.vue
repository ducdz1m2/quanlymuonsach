<template>
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div class="card shadow p-4" style="width: 350px;">
            <h4 class="text-center mb-4">👨‍💼 Đăng nhập nhân viên</h4>

            <form @submit.prevent="handleLogin">
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input v-model="email" type="email" class="form-control" placeholder="Nhập email..." />
                </div>

                <div class="mb-3">
                    <label class="form-label">Mật khẩu</label>
                    <input v-model="password" type="password" class="form-control" placeholder="Nhập mật khẩu..." />
                </div>

                <div class="text-danger mb-2" v-if="error">{{ error }}</div>

                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                    <span v-if="loading">Đang đăng nhập...</span>
                    <span v-else>Đăng nhập</span>
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import StaffService from "@/services/staff.service";

export default {
    name: "StaffLogin",
    data() {
        return {
            email: "",
            password: "",
            error: "",
            loading: false,
        };
    },
    methods: {
        async handleLogin() {
            this.error = "";
            this.loading = true;
            try {
                const res = await StaffService.login(this.email, this.password);
                localStorage.setItem("staffToken", res.token);
                localStorage.setItem("staffInfo", JSON.stringify(res.staff));
                window.dispatchEvent(new Event("storage"));
                this.$router.push("/");
            } catch (err) {
                this.error = err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!";
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.vh-100 {
    height: 100vh;
}
</style>
