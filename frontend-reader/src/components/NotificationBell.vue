<template>
    <div class="dropdown">
        <!-- Nút chuông -->
        <button class="btn btn-light position-relative" type="button" id="notificationDropdown"
            data-bs-toggle="dropdown" aria-expanded="false">
            🔔
            <span v-if="count > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ count }}
                <span class="visually-hidden">unread messages</span>
            </span>
        </button>

        <!-- Dropdown menu -->
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
            <li v-if="notifications.length === 0" class="dropdown-item text-muted">
                Không có thông báo
            </li>
            <li v-for="(item, i) in notifications" :key="i">
                <a class="dropdown-item" href="#">{{ item }}</a>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref } from "vue";

const notifications = ref([
    "Tin nhắn mới từ Admin",
    "Báo cáo đã sẵn sàng",
    "Có bản cập nhật hệ thống",
    "wow wow wow"
]);

const count = ref(notifications.value.length);
</script>
