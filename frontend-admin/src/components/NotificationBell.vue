<template>
    <div class="dropdown">
        <!-- Nút chuông -->
        <button class="btn btn-light position-relative" type="button" id="notificationDropdown"
            data-bs-toggle="dropdown" aria-expanded="false" @click="markAllAsRead">
            🔔
            <span v-if="unreadCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ unreadCount }}
                <span class="visually-hidden">unread messages</span>
            </span>
        </button>

        <!-- Dropdown menu -->
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
            <li v-if="notifications.length === 0" class="dropdown-item text-muted">
                Không có thông báo
            </li>

            <li v-for="(item, i) in notifications" :key="i" class="dropdown-item d-flex flex-column"
                :class="{ 'bg-light': !item.is_read }" @click="handleNotificationClick(item)" style="cursor: pointer;">
                <strong>{{ item.title }}</strong>
                <small class="text-muted">{{ item.message }}</small>
                <small class="text-secondary">{{ formatDate(item.created_at) }}</small>
            </li>

            <li v-if="notifications.length > 0">
                <hr class="dropdown-divider" />
            </li>
            <li v-if="notifications.length > 0">
                <a class="dropdown-item text-center text-danger" href="#" @click.prevent="clearAll">
                    🗑 Xóa tất cả
                </a>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["openChat"]);

const notifications = ref([
    // ✅ Bạn có thể thêm dữ liệu mẫu tạm thời nếu cần
    // { title: "Thông báo 1", message: "Nội dung 1", created_at: new Date(), is_read: false },
]);
const unreadCount = ref(0);

// 🔘 Khi mở dropdown — đánh dấu tất cả đã đọc
const markAllAsRead = () => {
    notifications.value.forEach(n => (n.is_read = true));
    unreadCount.value = 0;
};

// ✅ Khi nhấp vào một thông báo
const handleNotificationClick = (item) => {
    item.is_read = true;
    unreadCount.value = notifications.value.filter(n => !n.is_read).length;
    emit("openChat", item);
};

// 🗑 Xóa tất cả thông báo
const clearAll = () => {
    notifications.value = [];
    unreadCount.value = 0;
};

// 🕒 Định dạng thời gian
const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

onMounted(() => {
    // Không còn fetch từ API nữa
    // Bạn có thể gắn dữ liệu giả lập ở đây nếu cần
    // notifications.value = [...]
    unreadCount.value = notifications.value.filter(n => !n.is_read).length;
});
</script>

<style scoped>
.dropdown-item.bg-light:hover {
    background-color: #f0f0f0 !important;
}
</style>
