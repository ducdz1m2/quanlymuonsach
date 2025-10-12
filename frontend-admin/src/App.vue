<template>
  <div>
    <!-- Header bây giờ emit ra open-profile -->
    <Header :staff="selectedStaff" @open-profile="openProfile" />


    <div class="d-flex flex-row">
      <Sidebar />
      <div class="m-3 w-100">
        <router-view />
      </div>
    </div>

    <Footer />

    <!-- Modal hiển thị StaffForm -->
    <div v-if="showProfileModal" class="modal-backdrop" @click.self="closeProfile">
      <div class="modal-dialog">
        <div class="modal-content p-4">
          <StaffForm :staff="selectedStaff" @cancel="closeProfile" @save="handleSaveProfile" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import Sidebar from "./components/Sidebar.vue";
import StaffForm from "./components/staffs/StaffForm.vue";
import { reactive, provide } from "vue";
import { socket } from "@/services/socket";
import Swal from "sweetalert2";
import staffService from "./services/staff.service";

export default {
  components: { Header, Footer, Sidebar, StaffForm },
  data() {
    return {
      showProfileModal: false,
      selectedStaff: {},
      chatNotifications: reactive({}), // 🔹 đặt ở đây
      sender: null,
    };
  },
  mounted() {
    this.fetchStaff();

    // Lấy thông tin sender
    this.sender = JSON.parse(localStorage.getItem("staffInfo")) || {};

    // Socket lắng nghe tin nhắn
    socket.on("receiveMessage", this.handleIncomingMessage);

    // Provide để các component con dùng
    provide("chatNotifications", this.chatNotifications);
    provide("sender", this.sender);
  },
  beforeUnmount() {
    socket.off("receiveMessage", this.handleIncomingMessage);
  },
  methods: {
    handleIncomingMessage(msg) {
      if (msg.sender !== this.sender?.hoTenNV) {
        this.chatNotifications[msg.room] = true;
      }
    },

    openProfile(staffInfo) {
      this.selectedStaff = { ...staffInfo };
      this.showProfileModal = true;
    },
    closeProfile() {
      this.showProfileModal = false;
    },
    async handleSaveProfile(updatedStaff) {
      try {
        const { matKhau, password, ...safeData } = updatedStaff;
        await staffService.update(updatedStaff._id, safeData);
        localStorage.setItem("staffInfo", JSON.stringify(safeData));
        await this.fetchStaff();
        this.showProfileModal = false;
      } catch (err) {
        Swal.fire("❌ Lỗi!", "Lỗi khi lưu hồ sơ", "error");
      }
    },
    async fetchStaff() {
      try {
        const staffInfo = JSON.parse(localStorage.getItem("staffInfo"));
        if (!staffInfo?._id) return;

        const latestStaff = await staffService.get(staffInfo._id);
        if (latestStaff) {
          this.selectedStaff = latestStaff;
          localStorage.setItem("staffInfo", JSON.stringify(latestStaff));
        }
      } catch (error) {
        Swal.fire("❌ Lỗi!", "Lỗi khi tải lại thông tin nhân viên", "error");
      }
    },
  },
};
</script>


<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-dialog {
  /* background: white; */
  border-radius: 12px;
  width: 480px;
  /* 👈 nhỏ lại */
  max-height: 85vh;
  /* 👈 tránh tràn màn hình */
  overflow-y: auto;
  /* 👈 thêm cuộn */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  padding: 1rem;
}
</style>
