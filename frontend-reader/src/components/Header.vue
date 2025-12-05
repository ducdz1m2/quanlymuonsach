<template>
    <nav class="py-3 ms-2 row text-center">
        <div class="col-8 d-flex align-items-center">📚 Library Manager</div>

        <div
            class="col-4 d-flex flex-row justify-content-end align-items-center"
        >
            <ThemeToggle />
            <ChatBox
                v-if="showChat"
                :room-id="activeRoomId"
                :sender="currentUser"
                @close="showChat = false"
            />

            <!-- Hiển thị avatar thật của nhân viên -->
            <Avatar
                v-if="isLoggedIn && readerInfo"
                class="mx-3"
                :src="readerInfo.anh || 'https://i.pravatar.cc/100'"
                :name="readerInfo.hoTenNV || 'Người dùng'"
                size="sm"
                @view-profile="goToProfile"
                @logout="handleLogout"
            />
        </div>
    </nav>
</template>

<script>
import Avatar from "./Avatar.vue";
import readerService from "@/services/reader.service";
import ChatBox from "./ChatBox.vue";
import ThemeToggle from "./ThemeToggle.vue";
export default {
    components: { Avatar, ChatBox, ThemeToggle },
    props: {
        reader: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            showChat: false,
            isLoggedIn: false,
            readerInfo: null,
        };
    },
    mounted() {
        this.checkLoginStatus();

        window.addEventListener("storage", this.checkLoginStatus);
    },
    beforeUnmount() {
        window.removeEventListener("storage", this.checkLoginStatus);
    },

    watch: {
        reader: {
            handler(newVal) {
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
                const info = JSON.parse(
                    localStorage.getItem("readerInfo") || "{}",
                );
                this.readerInfo =
                    info && Object.keys(info).length ? info : null;
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
            readerService.logout();
            window.dispatchEvent(new Event("storage"));

            this.$router.push("/login");
        },
    },
};
</script>
