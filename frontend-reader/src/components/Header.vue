<template>
    <nav class="py-3 ms-2 row text-center">
        <div class="col-8 d-flex align-items-center">
            📚 Library Manager
        </div>

        <div class="col-4 d-flex flex-row justify-content-end align-items-center">
            <!-- <NotificationBell @openChat="openChatWindow" /> -->

            <ChatBox v-if="showChat" :room-id="activeRoomId" :sender="currentUser" @close="showChat = false" />

            <!-- Hiển thị avatar thật của nhân viên -->
            <Avatar v-if="isLoggedIn && readerInfo" class="mx-3" :src="readerInfo.anh || 'https://i.pravatar.cc/100'"
                :name="readerInfo.hoTenNV || 'Người dùng'" size="sm" @view-profile="goToProfile"
                @logout="handleLogout" />
        </div>
    </nav>
</template>

<script>
import NotificationBell from "./NotificationBell.vue";
import Avatar from "./Avatar.vue";
import readerService from "@/services/reader.service";
import ChatBox from "./ChatBox.vue";

export default {
    components: { NotificationBell, Avatar, ChatBox },
    props: {
        reader: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            showChat: false,
            isLoggedIn: false,
            readerInfo: null, // thêm readerInfo reactive
        };
    },
    mounted() {

        this.checkLoginStatus();

        // Lắng nghe event khi login hoặc logout
        window.addEventListener("storage", this.checkLoginStatus);
    },
    beforeUnmount() {
        window.removeEventListener("storage", this.checkLoginStatus);
    },

    watch: {
        reader: {
            handler(newVal) {
                // Khi App.vue cập nhật reader, Header tự nhận thay đổi
                if (newVal && Object.keys(newVal).length > 0) {
                    this.isLoggedIn = true;
                    this.readerInfo = newVal;
                }
            },
            deep: true,
            immediate: true,
        },
    },

    methods: {

        checkLoginStatus() {
            const token = localStorage.getItem("readerToken");
            this.isLoggedIn = !!token;

            if (this.isLoggedIn) {
                const info = JSON.parse(localStorage.getItem("readerInfo") || "{}");
                this.readerInfo = info && Object.keys(info).length ? info : null;
            } else {
                this.readerInfo = null;
            }
        },

        goToProfile() {
            if (this.readerInfo) {

                this.$emit("open-profile", this.readerInfo);

            }
        },

        handleLogout() {
            readerService.logout(); // Xóa token + thông tin người dùng

            // 🔁 Thông báo cho toàn app (App.vue, Sidebar, v.v.)
            window.dispatchEvent(new Event("storage"));

            // 🔙 Chuyển hướng về trang đăng nhập
            this.$router.push("/login");
        },
    },

};
</script>
