<template>
    <div>
        <Header :reader="selectedReader" @open-profile="openProfile" />

        <div class="d-flex flex-row">
            <div class="m-3 w-100">
                <router-view />
            </div>
        </div>

        <Footer />

        <!-- Modal hiển thị ReaderForm -->
        <div
            v-if="showProfileModal"
            class="modal-backdrop"
            @click.self="closeProfile"
        >
            <div class="modal-dialog">
                <div class="modal-content p-4">
                    <ReaderForm
                        :reader="selectedReader"
                        @cancel="closeProfile"
                        @save="handleSaveProfile"
                    />
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
import borrowService from "./services/borrow.service";
import Swal from "sweetalert2";
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
            this.selectedReader = { ...readerInfo };
            this.showProfileModal = true;
        },
        closeProfile() {
            this.showProfileModal = false;
        },
        async handleSaveProfile(updatedReader) {
            try {
                const { password, matKhau, ...safeData } = updatedReader;

                await readerService.updateProfile(updatedReader._id, safeData);
                localStorage.setItem("readerInfo", JSON.stringify(safeData));

                await this.fetchReader();
                this.showProfileModal = false;
            } catch (err) {
                console.error("❌ Lỗi khi lưu hồ sơ độc giả:", err);
            }
        },

        async fetchReader() {
            try {
                const readerInfo = JSON.parse(
                    localStorage.getItem("readerInfo"),
                );
                if (!readerInfo?._id) return;

                const latestReader = await readerService.getProfile(
                    readerInfo._id,
                );
                if (latestReader) {
                    this.selectedReader = latestReader;
                    localStorage.setItem(
                        "readerInfo",
                        JSON.stringify(latestReader),
                    );

                    // Kiểm tra thông báo sách sắp hết hạn mượn và quá hạn
                    const borrowedBooks = await borrowService.getByReader(
                        latestReader._id,
                    );
                    const today = new Date();
                    let overdueMessages = [];
                    let nearingDeadlineMessages = [];

                    for (const borrow of borrowedBooks) {
                        console.log("Processing borrow ticket:", borrow); // Debug: Log each borrow ticket
                        console.log(
                            "  Borrow status:",
                            borrow.trangThai,
                            "Return date:",
                            borrow.ngayTra,
                        );

                        if (borrow.trangThai === "Quá hạn") {
                            const returnDate = new Date(borrow.ngayTra);
                            overdueMessages.push(
                                `Sách '${
                                    borrow.bookInfo.tenSach
                                }' có trạng thái: Quá hạn. Hạn trả: ${returnDate.toLocaleDateString(
                                    "vi-VN",
                                )}. Vui lòng trả sách sớm nhất có thể.`,
                            );
                        } else if (
                            borrow.trangThai === "Đã duyệt" ||
                            borrow.trangThai === "Đang mượn"
                        ) {
                            const returnDate = new Date(borrow.ngayTra);
                            const timeDiff =
                                returnDate.getTime() - today.getTime();
                            const dayDiff = Math.ceil(
                                timeDiff / (1000 * 3600 * 24),
                            ); // Số ngày còn lại
                            console.log("  Calculated dayDiff:", dayDiff); // Debug: Log dayDiff

                            if (dayDiff <= 3 && dayDiff >= 0) {
                                // Trong vòng 3 ngày đến hạn
                                nearingDeadlineMessages.push(
                                    `Sách '${
                                        borrow.bookInfo.tenSach
                                    }' sẽ đến hạn trả trong ${dayDiff} ngày (ngày ${returnDate.toLocaleDateString(
                                        "vi-VN",
                                    )}).`,
                                );
                            } else if (dayDiff < 0) {
                                // Đã quá hạn (mà trạng thái vẫn là Đã duyệt/Đang mượn)
                                overdueMessages.push(
                                    `Sách '${
                                        borrow.bookInfo.tenSach
                                    }' đã quá hạn trả ${Math.abs(
                                        dayDiff,
                                    )} ngày (ngày ${returnDate.toLocaleDateString(
                                        "vi-VN",
                                    )}). Vui lòng trả sách sớm nhất có thể.`,
                                );
                            }
                        }
                    }

                    if (overdueMessages.length > 0) {
                        await Swal.fire({
                            title: "Thông báo sách đã quá hạn",
                            html: `<strong>Sách đã quá hạn:</strong><br>${overdueMessages.join(
                                "<br>",
                            )}`,
                            icon: "warning",
                            confirmButtonText: "Đã hiểu",
                        });
                    }
                }
            } catch (error) {
                console.error(
                    "❌ Lỗi khi tải lại thông tin độc giả hoặc kiểm tra hạn trả sách:",
                    error,
                );
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
