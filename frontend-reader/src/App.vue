<template>
  <div>
    <!-- Header emit ra open-profile -->
    <Header :reader="selectedReader" @open-profile="openProfile" />

    <div class="d-flex flex-row">

      <div class="m-3 w-100">
        <router-view />
      </div>
    </div>

    <Footer />

    <!-- Modal hiển thị ReaderForm -->
    <div v-if="showProfileModal" class="modal-backdrop" @click.self="closeProfile">
      <div class="modal-dialog">
        <div class="modal-content p-4">
          <ReaderForm :reader="selectedReader" @cancel="closeProfile" @save="handleSaveProfile" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";

import ReaderForm from "./components/ReaderForm.vue";
import readerService from "./services/reader.service";

export default {
  components: { Header, Footer, ReaderForm },
  data() {
    return {
      showProfileModal: false,
      selectedReader: {},
    };
  },
  mounted() {

    this.fetchReader();


  },
  methods: {

    openProfile(readerInfo) {
      // Khi Header emit ra sự kiện open-profile
      this.selectedReader = { ...readerInfo };

      this.showProfileModal = true;
    },
    closeProfile() {
      this.showProfileModal = false;
    },
    async handleSaveProfile(updatedReader) {
      try {
        // ✅ Bỏ mật khẩu trước khi lưu
        const { password, matKhau, ...safeData } = updatedReader;

        await readerService.updateProfile(updatedReader._id, safeData);
        localStorage.setItem("readerInfo", JSON.stringify(safeData));

        await this.fetchReader();
        this.showProfileModal = false;
      } catch (err) {
        console.error("❌ Lỗi khi lưu hồ sơ độc giả:", err);
      }
    },

    // 👇 Hàm đồng bộ thông tin reader
    async fetchReader() {
      try {
        const readerInfo = JSON.parse(localStorage.getItem("readerInfo"));
        if (!readerInfo?._id) return;

        const latestReader = await readerService.getProfile(readerInfo._id);
        if (latestReader) {
          this.selectedReader = latestReader;
          localStorage.setItem("readerInfo", JSON.stringify(latestReader));
          // console.log("🔁 Hồ sơ độc giả đã được đồng bộ:", latestReader);
        }
      } catch (error) {
        console.error("❌ Lỗi khi tải lại thông tin độc giả:", error);
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
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  padding: 1rem;
}
</style>
