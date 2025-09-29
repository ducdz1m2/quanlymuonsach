<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter()
const isCollapsed = ref(false);
const activeIndex = ref(0);

const menuItems = [
    { icon: 'fas fa-home', text: 'Trang chủ', route: '/' },
    { icon: 'fas fa-book', text: 'Quản lý sách', route: '/books' },
    // { icon: 'fas fa-users', text: 'Quản lý độc giả', route: '/users' },
    // { icon: 'fas fa-book-reader', text: 'Quản lý mượn sách', route: '/borrow' },
    { icon: 'fas fa-user-tie', text: 'Quản lý nhân sự', route: '/staffs' },
    // { icon: 'fas fa-question-circle', text: 'Trợ giúp', route: '/help' }
]


function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value;
}

function setActive(index, route) {
    activeIndex.value = index;
    router.push(route);
}
</script>

<template>
    <div class="d-flex flex-column bg-dark text-white sidebar" :class="{ 'collapsed': isCollapsed }">

        <div class="d-flex justify-content-center align-items-center mt-2">
            <button class="btn btn-outline-light toggle-btn" @click="toggleSidebar">☰</button>
        </div>

        <ul class="list-unstyled mt-3">
            <li v-for="(item, index) in menuItems" :key="index" class="px-3 py-2 d-flex align-items-center menu-item"
                :class="{ 'active': activeIndex === index }" @click="setActive(index, item.route)">
                <i :class="item.icon"></i>
                <span v-if="!isCollapsed" class="ms-2">{{ item.text }}</span>
            </li>
        </ul>
    </div>
</template>

<style>
li:hover {
    cursor: pointer
}

.sidebar {
    width: 200px;
    transition: all 0.3s ease;
    overflow-x: hidden;
    overflow-y: auto;
    white-space: nowrap;
    flex-shrink: 0;
}

.sidebar.collapsed {
    width: 60px;
}

/* Mobile */
@media (max-width: 768px) {
    .sidebar {
        width: 60px;
        /* cố định sidebar nhỏ gọn */
        max-width: 60px;
    }

    .sidebar.collapsed {
        width: 60px;
    }

    .toggle-btn {
        display: none !important;
        /* ẩn nút toggle */
    }

    /* Ẩn chữ trong menu khi màn hình nhỏ */
    .sidebar .menu-item span {
        display: none;
    }
}
</style>