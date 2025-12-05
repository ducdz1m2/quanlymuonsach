<template>
    <div
        class="d-flex flex-column bg-dark text-white sidebar"
        :class="{ collapsed: isCollapsed }"
    >
        <div class="d-flex justify-content-center align-items-center mt-2">
            <button
                class="btn btn-outline-light toggle-btn"
                @click="toggleSidebar"
            >
                ☰
            </button>
        </div>

        <ul class="list-unstyled mt-3">
            <li
                v-for="(item, index) in filteredMenuItems"
                :key="index"
                class="px-3 py-2 d-flex align-items-center menu-item"
                :class="{ active: activeIndex === index }"
                @click="handleMenuClick(item, index)"
            >
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
                <button
                    class="btn btn-primary"
                    @click="prevStep"
                    :disabled="currentStep === 0"
                >
                    Previous
                </button>
                <button
                    class="btn btn-primary"
                    @click="nextStep"
                    :disabled="currentStep === helpSteps.length - 1"
                >
                    Next
                </button>
                <button class="btn btn-secondary" @click="closeHelp">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isCollapsed: false,
            activeIndex: 0,
            showHelp: false,
            currentStep: 0,
            isLoggedIn: false,
            staffData: null,
            menuItems: [
                {
                    icon: "fas fa-home",
                    text: "Trang chủ",
                    route: "/",
                    help: "Trang tổng quan của hệ thống",
                },
                {
                    icon: "fas fa-book",
                    text: "Quản lý sách",
                    route: "/books",
                    help: "Xem, thêm, sửa, xóa sách",
                },
                {
                    icon: "fas fa-users",
                    text: "Quản lý độc giả",
                    route: "/readers",
                    help: "Quản lý thông tin độc giả",
                },
                {
                    icon: "fas fa-book-reader",
                    text: "Quản lý mượn sách",
                    route: "/borrows",
                    help: "Theo dõi mượn/ trả sách",
                },
                {
                    icon: "fas fa-user-tie",
                    text: "Quản lý nhân sự",
                    route: "/staffs",
                    help: "Quản lý thông tin nhân viên",
                },
                {
                    icon: "fas fa-building",
                    text: "Quản lý NXB",
                    route: "/publishers",
                    help: "Quản lý nhà xuất bản",
                },
                {
                    icon: "fas fa-question-circle",
                    text: "Trợ giúp",
                    route: null,
                    help: "Mở chế độ hướng dẫn này",
                },
            ],
            role: "",
        };
    },
    computed: {
        filteredMenuItems() {
            const helpItem = this.menuItems.find(
                (item) => item.text === "Trợ giúp",
            );
            let items = [];

            if (this.role === "Admin")
                items = this.menuItems.filter(
                    (item) => item.text !== "Trợ giúp",
                );
            else if (this.role === "Thủ thư")
                items = this.menuItems.filter((item) =>
                    [
                        "/",
                        "/books",
                        "/borrows",
                        "/readers",
                        "/publishers",
                    ].includes(item.route),
                );
            else if (this.role === "Nhân viên kiểm duyệt")
                items = this.menuItems.filter((item) =>
                    ["/borrows"].includes(item.route),
                );
            else if (this.role === "Quản lý nhân sự")
                items = this.menuItems.filter((item) =>
                    ["/staffs"].includes(item.route),
                );

            if (helpItem) items.push(helpItem);
            return items;
        },
        helpSteps() {
            return this.menuItems.filter((i) => i.route !== null);
        },
    },
    methods: {
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed;
        },
        handleMenuClick(item, index) {
            this.activeIndex = index;
            if (item.route) {
                this.$router.push(item.route);
            } else if (item.text === "Trợ giúp") {
                this.showHelp = true;
            }
        },
        setActive(index, routePath) {
            this.activeIndex = index;
            if (routePath) this.$router.push(routePath);
        },
        updateActiveIndexByRoute(path) {
            const index = this.filteredMenuItems.findIndex(
                (item) => item.route === path,
            );
            if (index !== -1) this.activeIndex = index;
        },
        nextStep() {
            if (this.currentStep < this.helpSteps.length - 1)
                this.currentStep++;
        },
        prevStep() {
            if (this.currentStep > 0) this.currentStep--;
        },
        closeHelp() {
            this.showHelp = false;
            this.currentStep = 0;
        },
        checkLoginStatus() {
            const token = localStorage.getItem("staffToken");
            this.isLoggedIn = !!token;

            if (this.isLoggedIn) {
                const info = JSON.parse(
                    localStorage.getItem("staffInfo") || "{}",
                );
                this.staffData = info && Object.keys(info).length ? info : null;
                this.role = this.staffData ? this.staffData.chucVu : "";
            } else {
                this.staffData = null;
                this.role = "";
            }
        },
    },
    mounted() {
        this.checkLoginStatus();
        this.updateActiveIndexByRoute(this.$route.path);
        window.addEventListener("storage", this.checkLoginStatus);

        // Đồng bộ khi route thay đổi ngoài
        this.$watch(
            () => this.$route.path,
            (newPath) => {
                this.updateActiveIndexByRoute(newPath);
            },
        );
    },
    beforeUnmount() {
        window.removeEventListener("storage", this.checkLoginStatus);
    },
};
</script>

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
    border-radius: 5px;
}

.menu-item.active i,
.menu-item.active span {
    color: #fff;
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
    /* background: white; */
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    max-width: 800px;
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
