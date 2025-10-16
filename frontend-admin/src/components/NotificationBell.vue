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

<script>
export default {
    name: "NotificationDropdown",

    data() {
        return {
            notifications: [],
            unreadCount: 0,
        };
    },

    methods: {
        markAllAsRead() {
            this.notifications.forEach((n) => (n.is_read = true));
            this.unreadCount = 0;
        },

        handleNotificationClick(item) {
            item.is_read = true;
            this.unreadCount = this.notifications.filter((n) => !n.is_read).length;
            this.$emit("openChat", item);
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
        this.unreadCount = this.notifications.filter((n) => !n.is_read).length;
    },
};
</script>


<style scoped>
.dropdown-item.bg-light:hover {
    background-color: #f0f0f0 !important;
}
</style>
