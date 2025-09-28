<template>
    <div class="rounded-circle bg-secondary text-white fw-bold overflow-hidden" :class="sizeClass"
        :style="{ width: sizePx, height: sizePx }">
        <!-- Nếu có ảnh -->
        <img v-if="src" :src="src" alt="avatar" class="w-100 h-100 object-fit-cover" />

        <!-- Nếu không có ảnh thì lấy chữ -->
        <span v-else>{{ initials }}</span>
    </div>
</template>
<script>
export default {
    name: "Avatar",
    props: {
        src: { type: String, default: "" },
        name: { type: String, default: "" },
        size: { type: String, default: "md" }
    },
    computed: {
        // Lấy chữ cái đầu
        initials() {
            if (!this.name) return "?";
            return this.name.trim().charAt(0).toUpperCase();
        },
        // Kích thước theo map
        sizePx() {
            const sizeMap = {
                sm: "40px",
                md: "60px",
                lg: "100px"
            };
            return sizeMap[this.size] || this.size;
        },
        sizeClass() {
            return {
                "fs-6": this.size === "sm",
                "fs-4": this.size === "md",
                "fs-2": this.size === "lg"
            };
        }
    }
};
</script>

<style scoped>
.object-fit-cover {
    object-fit: cover;
}
</style>
