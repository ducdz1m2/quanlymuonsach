<template>
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light auth-card">
        <div class="card shadow p-4 auth-card" style="width: 350px;">
            <h4 class="text-center mb-4">📖 Đăng nhập độc giả</h4>

            <form @keydown.enter="handleLogin">
                <div class="mb-3">
                    <label class="form-label">📱 Số điện thoại</label>
                    <input v-model="dienThoai" type="text" class="form-control" placeholder="Nhập số điện thoại..." />
                </div>

                <div class="mb-3">
                    <label class="form-label">🔑 Mật khẩu</label>
                    <input v-model="password" type="password" class="form-control" placeholder="Nhập mật khẩu..." />
                </div>

                <div class="text-danger mb-2" v-if="error">{{ error }}</div>

                <button class="btn btn-primary w-100" @click="handleLogin" :disabled="loading">
                    <span v-if="loading">Đang đăng nhập...</span>
                    <span v-else>Đăng nhập</span>
                </button>

                <div class="text-center mt-3">
                    <router-link to="/register" class="small text-decoration-none">
                        📘 Chưa có tài khoản? Đăng ký ngay
                    </router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import readerService from '@/services/reader.service';

export default {
    name: "ReaderLogin",
    data() {
        return {
            dienThoai: "",
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
                const result = await readerService.login(this.dienThoai, this.password);

                if (!result) {
                    // readerService đã trả null khi server trả 401
                    this.error = "Sai số điện thoại hoặc mật khẩu!";
                    return;
                }

                // Lưu token + reader
                localStorage.setItem("token", result.token);
                localStorage.setItem("reader", JSON.stringify(result.reader));

                // Thông báo và chuyển trang
                window.dispatchEvent(new Event("storage"));
                this.$router.push("/");
            } catch (err) {
                console.error("Lỗi khi đăng nhập:", err);

                // Nếu server trả message, hiển thị message đó
                if (err.response && err.response.data && err.response.data.message) {
                    this.error = err.response.data.message;
                } else {
                    // Lỗi mạng / CORS / server unreachable
                    this.error = "Không thể kết nối tới máy chủ!";
                }
            } finally {
                this.loading = false;
            }
        }

    },
};
</script>

<style scoped>
.vh-100 {
    height: 100vh;
}
</style>
