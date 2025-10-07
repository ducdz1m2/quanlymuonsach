<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const isCollapsed = ref(false);
const activeIndex = ref(0);
const showHelp = ref(false);
const currentStep = ref(0);

// Danh sách menu
const menuItems = [
    { icon: 'fas fa-home', text: 'Trang chủ', route: '/', help: 'Trang tổng quan của hệ thống' },
    { icon: 'fas fa-book', text: 'Quản lý sách', route: '/books', help: 'Xem, thêm, sửa, xóa sách' },
    { icon: 'fas fa-users', text: 'Quản lý độc giả', route: '/readers', help: 'Quản lý thông tin độc giả' },
    { icon: 'fas fa-book-reader', text: 'Quản lý mượn sách', route: '/borrows', help: 'Theo dõi mượn/ trả sách' },
    { icon: 'fas fa-user-tie', text: 'Quản lý nhân sự', route: '/staffs', help: 'Quản lý thông tin nhân viên' },
    { icon: 'fas fa-building', text: 'Quản lý NXB', route: '/publishers', help: 'Quản lý nhà xuất bản' },
    { icon: 'fas fa-question-circle', text: 'Trợ giúp', route: null, help: 'Mở chế độ hướng dẫn này' }
];

const helpSteps = menuItems.filter(i => i.route !== null);
function handleMenuClick(item, index) {
    activeIndex.value = index;
    if (item.route) {
        router.push(item.route);
    } else if (item.text === "Trợ giúp") {
        showHelp.value = true;
    }
}

function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value;
}

function setActive(index, routePath) {
    activeIndex.value = index;
    if (routePath) router.push(routePath);
}

// Đồng bộ activeIndex khi route thay đổi
function updateActiveIndexByRoute(path) {
    const index = menuItems.findIndex(item => item.route === path);
    if (index !== -1) activeIndex.value = index;
}

onMounted(() => {
    updateActiveIndexByRoute(route.path);
});

// Nếu user chuyển route bằng router-link hoặc router.push khác
watch(
    () => route.path,
    (newPath) => {
        updateActiveIndexByRoute(newPath);
    }
);

function nextStep() {
    if (currentStep.value < helpSteps.length - 1) currentStep.value++;
}

function prevStep() {
    if (currentStep.value > 0) currentStep.value--;
}

function closeHelp() {
    showHelp.value = false;
    currentStep.value = 0;
}
</script>


<template>
    <div class="d-flex flex-column bg-dark text-white sidebar" :class="{ 'collapsed': isCollapsed }">

        <div class="d-flex justify-content-center align-items-center mt-2">
            <button class="btn btn-outline-light toggle-btn" @click="toggleSidebar">☰</button>
        </div>

        <ul class="list-unstyled mt-3">
            <li v-for="(item, index) in menuItems" :key="index" class="px-3 py-2 d-flex align-items-center menu-item"
                :class="{ 'active': activeIndex === index }" @click="handleMenuClick(item, index)">

                <i :class="item.icon"></i>
                <span v-if="!isCollapsed" class="ms-2">{{ item.text }}</span>
            </li>


        </ul>
    </div>

    <!-- Help carousel overlay -->
    <div v-if="showHelp" class="help-carousel-overlay">
        <div class="help-carousel">
            <img :src="`/images/help${currentStep + 1}.png`" alt="Help Image" />
            <p>{{ helpSteps[currentStep].help }}</p>
            <div class="help-buttons">
                <button @click="prevStep" :disabled="currentStep === 0">Previous</button>
                <button @click="nextStep" :disabled="currentStep === helpSteps.length - 1">Next</button>
                <button @click="closeHelp">Close</button>
            </div>
        </div>
    </div>
</template>

<style>
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

.menu-item:hover {
    cursor: pointer;
}

.menu-item.active {
    background-color: #495057;
    /* màu nền khi active */
    border-radius: 5px;
}

.menu-item.active i,
.menu-item.active span {
    color: #fff;
    /* màu chữ icon/text */
}

/* Mobile */
@media (max-width: 768px) {
    .sidebar {
        width: 60px;
        max-width: 60px;
    }

    .sidebar.collapsed {
        width: 60px;
    }

    .toggle-btn {
        display: none !important;
    }
}

/* Help Carousel */
.help-carousel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.help-carousel {
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    max-width: 500px;
}

.help-carousel img {
    max-width: 100%;
    border-radius: 5px;
    margin-bottom: 10px;
}

.help-buttons {
    margin-top: 10px;
}

.help-buttons button {
    margin: 0 5px;
}
</style>
