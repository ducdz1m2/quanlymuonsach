<template>
    <nav class="py-3 ms-2 row text-center">
        <div class="col-8 d-flex align-items-center">
            📚 Library Manager
        </div>

        <div class="col-4 d-flex flex-row justify-content-end align-items-center">

            <ThemeToggle />

            <Avatar v-if="isLoggedIn && staffInfo" class="mx-3" :src="staffInfo.anh || 'https://i.pravatar.cc/100'"
                :name="staffInfo.hoTenNV || 'Người dùng'" size="sm" @view-profile="goToProfile"
                @logout="handleLogout" />
        </div>
    </nav>
</template>

<script>
import NotificationBell from "./NotificationBell.vue";
import Avatar from "./Avatar.vue";
import ThemeToggle from "./ThemeToggle.vue";

export default {
    components: { NotificationBell, Avatar, ThemeToggle },
    props: {
        staff: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            isLoggedIn: false,
            staffInfo: null,
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
        staff: {
            handler(newVal) {

                if (newVal && Object.keys(newVal).length > 0) {
                    this.isLoggedIn = true;
                    this.staffInfo = newVal;
                }
            },
            deep: true,
            immediate: true,
        },
    },

    methods: {
        checkLoginStatus() {
            const token = localStorage.getItem("staffToken");
            this.isLoggedIn = !!token;

            if (this.isLoggedIn) {
                const info = JSON.parse(localStorage.getItem("staffInfo") || "{}");
                this.staffInfo = info && Object.keys(info).length ? info : null;
            } else {
                this.staffInfo = null;
            }
        },

        goToProfile() {
            if (this.staffInfo) {

                this.$emit("open-profile", this.staffInfo);

            }
        },

        handleLogout() {
            localStorage.removeItem("staffToken");
            localStorage.removeItem("staffInfo");
            this.isLoggedIn = false;
            this.staffInfo = null;
            window.dispatchEvent(new Event("storage"));
            this.$router.push("/staff/login");
        },
    },

};
</script>
