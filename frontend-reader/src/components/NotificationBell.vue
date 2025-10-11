<template>
    <div class="dropdown">
        <!-- Nút chuông -->
        <button class="btn btn-light position-relative" type="button" id="notificationDropdown"
            data-bs-toggle="dropdown" aria-expanded="false" @click="markAllAsRead">
            🔔
            <span v-if="unreadCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ unreadCount }}
            </span>
        </button>

        <!-- Danh sách thông báo -->
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
            <li v-if="notifications.length === 0" class="dropdown-item text-muted">
                Không có thông báo
            </li>

            <li v-for="(item, i) in notifications" :key="i" class="dropdown-item d-flex flex-column"
                :class="{ 'bg-light': !item.is_read }" style="cursor: pointer;" @click="handleNotificationClick(item)">
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { io } from "socket.io-client";

const emit = defineEmits(["openChat"]);

const notifications = ref([]);
const unreadCount = ref(0);

// ⚙️ Kết nối socket tới backend
const socket = io("http://localhost:3000");

// 🧠 Lắng nghe tin nhắn mới realtime
onMounted(() => {
    socket.on("receiveMessage", (msg) => {
        console.log("🔔 Tin nhắn mới:", msg);

        // ✅ Thêm vào danh sách thông báo
        notifications.value.unshift({
            title: "Tin nhắn mới",
            message: `Từ ${msg.sender}: ${msg.text}`,
            created_at: new Date(),
            is_read: false,
            roomId: msg.room,
        });

        // ✅ Tăng badge
        unreadCount.value++;
    });
});

onBeforeUnmount(() => {
    socket.off("receiveMessage");
});

// 🖱 Khi click vào thông báo
const handleNotificationClick = (item) => {
    item.is_read = true;
    unreadCount.value = notifications.value.filter(n => !n.is_read).length;

    // ✅ Gửi sự kiện mở chat lên component cha
    emit("openChat", item.roomId);
};

// ✅ Đánh dấu tất cả đã đọc
const markAllAsRead = () => {
    notifications.value.forEach(n => (n.is_read = true));
    unreadCount.value = 0;
};

// 🗑 Xóa tất cả
const clearAll = () => {
    notifications.value = [];
    unreadCount.value = 0;
};

// 🕒 Định dạng thời gian
const formatDate = (date) => new Date(date).toLocaleString("vi-VN");
</script>

<style scoped>
.dropdown-item.bg-light:hover {
    background-color: #f0f0f0 !important;
}
</style>
