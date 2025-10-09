<template>
    <div class="dropdown">
        <!-- Nút Avatar -->
        <button class="btn p-0 border-0 bg-transparent" type="button" id="avatarDropdown" data-bs-toggle="dropdown"
            aria-expanded="false">
            <div class="rounded-circle overflow-hidden" :style="{ width: sizePx, height: sizePx }">
                <img v-if="src" :src="src" alt="avatar" class="w-100 h-100 object-fit-cover" />
                <span v-else
                    class="bg-secondary text-white d-flex align-items-center justify-content-center w-100 h-100 fw-bold">
                    {{ initials }}
                </span>
            </div>
        </button>

        <!-- Menu thả xuống -->
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="avatarDropdown">
            <li>
                <a class="dropdown-item" href="#" @click.prevent="viewProfile">
                    👤 Xem hồ sơ
                </a>
            </li>
            <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                    🚪 Đăng xuất
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: "Avatar",
    props: {
        src: { type: String, default: "" },
        name: { type: String, default: "" },
        size: { type: String, default: "sm" },
    },
    computed: {
        initials() {
            if (!this.name) return "?";
            return this.name.trim().charAt(0).toUpperCase();
        },
        sizePx() {
            const sizeMap = { sm: "40px", md: "60px", lg: "100px" };
            return sizeMap[this.size] || this.size;
        },
    },
    methods: {
        viewProfile() {
            this.$emit("view-profile");
        },
        logout() {
            this.$emit("logout");
        },
    },
};
</script>

<style scoped>
.object-fit-cover {
    object-fit: cover;
}
</style>
