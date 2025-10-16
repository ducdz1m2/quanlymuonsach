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
<script>
import { io } from "socket.io-client";

export default {
    name: "NotificationDropdown",

    data() {
        return {
            notifications: [],
            unreadCount: 0,
            socket: null,
        };
    },

    methods: {
        handleNotificationClick(item) {
            item.is_read = true;
            this.unreadCount = this.notifications.filter((n) => !n.is_read).length;
            this.$emit("openChat", item.roomId);
        },

        markAllAsRead() {
            this.notifications.forEach((n) => (n.is_read = true));
            this.unreadCount = 0;
        },

        clearAll() {
            this.notifications = [];
            this.unreadCount = 0;
        },

        formatDate(date) {
            return new Date(date).toLocaleString("vi-VN");
        },
    },

    mounted() {
        this.socket = io("http://localhost:3000");

        this.socket.on("receiveMessage", (msg) => {
            this.notifications.unshift({
                title: "Tin nhắn mới",
                message: `Từ ${msg.sender}: ${msg.text}`,
                created_at: new Date(),
                is_read: false,
                roomId: msg.room,
            });

            this.unreadCount++;
        });
    },

    beforeUnmount() {
        if (this.socket) {
            this.socket.off("receiveMessage");
        }
    },
};
</script>

<style scoped>
.dropdown-item.bg-light:hover {
    background-color: #f0f0f0 !important;
}
</style>
