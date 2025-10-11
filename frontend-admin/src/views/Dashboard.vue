<template>
    <div class="d-flex flex-row">
        <div class="m-3 w-100">
            <h1>📊 Dashboard Thống kê</h1>

            <!-- Hàng thống kê -->
            <div class="d-flex flex-row flex-wrap gap-4 p-4">
                <Card cardTitle="💵 Tổng doanh thu" :imgSrc="moneyIcon" v-model="revenueStats" />
                <Card cardTitle="⚠️ Tổng tiền phạt" :imgSrc="warningIcon" v-model="penaltyStats" />
                <Card cardTitle="📖 Tổng số sách" :imgSrc="bookIcon" v-model="bookStats" />
                <Card cardTitle="📈 Lượt thuê trong tháng" :imgSrc="chartIcon" v-model="monthlyBorrowStats" />
                <Card cardTitle="📚 Thể loại phổ biến nhất" :imgSrc="categoryIcon" v-model="topCategoryStats" />
                <Card cardTitle="👤 Tổng số độc giả" :imgSrc="userIcon" v-model="userStats" />
                <Card cardTitle="🕒 Đang được mượn" :imgSrc="activeIcon" v-model="activeBorrowStats" />
            </div>


            <!-- BIỂU ĐỒ -->
            <div class="p-4">
                <h4>💰 Doanh thu theo thể loại</h4>
                <canvas id="revenueChart" height="100"></canvas>
            </div>

            <div class="p-4">
                <h4>📊 Tỷ lệ mượn theo thể loại</h4>
                <div class="chart-wrapper">
                    <canvas id="categoryPieChart"></canvas>
                </div>
            </div>



            <div class="p-4">
                <h4>📅 Lượt thuê theo ngày (trong tháng hiện tại)</h4>
                <canvas id="dailyBorrowChart" height="100"></canvas>
            </div>

            <!-- Bảng "Vừa thuê" -->
            <h4 class="ps-4 mt-4">📘 Giao dịch gần đây</h4>
            <div class="table-responsive px-4" id="recentRentingTable">
                <table class="table table-hover table-bordered text-center align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>Mã thuê</th>
                            <th>Người thuê</th>
                            <th>Sách thuê</th>
                            <th>Ngày mượn</th>
                            <th>Trạng thái</th>
                            <th>Tiền phạt</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="b in recentBorrows" :key="b._id">
                            <td>{{ b.maMuon }}</td>
                            <td>{{ b.docGiaInfo.hoLot }} {{ b.docGiaInfo.ten }}</td>
                            <td>{{ b.bookInfo.tenSach }}</td>
                            <td>{{ formatDate(b.ngayMuon) }}</td>
                            <td>
                                <span class="badge" :class="{
                                    'bg-warning text-dark': b.trangThai === 'Đang mượn',
                                    'bg-success': b.trangThai === 'Đã trả',
                                    'bg-danger': b.trangThai === 'Quá hạn',
                                    'bg-secondary': b.trangThai === 'Chờ duyệt',
                                }">
                                    {{ b.trangThai }}
                                </span>
                            </td>
                            <td>{{ b.penalty.toLocaleString() }}₫</td>
                        </tr>
                        <tr v-if="recentBorrows.length === 0">
                            <td colspan="6">Không có dữ liệu gần đây</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- Bảng "Top độc giả chi tiêu nhiều nhất" -->
            <h4 class="ps-4 mt-5">💸 Top độc giả chi tiêu nhiều nhất</h4>
            <div class="table-responsive px-4" id="topSpendersTable">
                <table class="table table-hover table-bordered text-center align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>Hạng</th>
                            <th>Tên độc giả</th>
                            <th>Số lượt thuê</th>
                            <th>Tổng tiền chi (₫)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(r, index) in topSpenders" :key="r.id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ r.name }}</td>
                            <td>{{ r.borrowCount }}</td>
                            <td>{{ r.totalSpent.toLocaleString() }}₫</td>
                        </tr>
                        <tr v-if="topSpenders.length === 0">
                            <td colspan="4">Không có dữ liệu</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";

import Card from "@/components/Card.vue";
import Sidebar from "@/components/Sidebar.vue";
import BorrowService from "@/services/borrow.service";
import BookService from "@/services/book.service";
import ReaderService from "@/services/reader.service";

import moneyIcon from "@/assets/money.png";
import warningIcon from "@/assets/warning.png";
import chartIcon from "@/assets/chart.png";
import categoryIcon from "@/assets/category.png";
import bookIcon from "@/assets/book.png";
import userIcon from "@/assets/user.png";
import activeIcon from "@/assets/clock.png";
export default {
    components: { Sidebar, Card },
    setup() {
        const revenueStats = ref({ total: "0 ₫", dateLabel: "" });
        const penaltyStats = ref({ total: "0 ₫", dateLabel: "" });
        const monthlyBorrowStats = ref({ total: "0", dateLabel: "" });
        const topCategoryStats = ref({ total: "Chưa có", dateLabel: "" });
        const bookStats = ref({ total: 0, dateLabel: "" });
        const userStats = ref({ total: 0, dateLabel: "" });
        const activeBorrowStats = ref({ total: 0, dateLabel: "" });
        const topSpenders = ref([]);

        const recentBorrows = ref([]);

        const formatDate = (dateStr) => {
            const d = new Date(dateStr);
            return d.toLocaleDateString("vi-VN");
        };

        let revenueChart = null;
        let categoryPieChart = null;
        let dailyBorrowChart = null;

        const loadDashboard = async () => {
            try {
                const [borrows, books, readers] = await Promise.all([
                    BorrowService.getAllDetails(),
                    BookService.getAll(),
                    ReaderService.getAll(),
                ]);

                const now = new Date();
                const dateStr = now.toLocaleDateString("vi-VN");
                const monthStr = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

                // --- Tổng doanh thu ---
                const totalRevenue = borrows.reduce((sum, b) => sum + (b.totalPayment || 0), 0);
                revenueStats.value = { total: totalRevenue.toLocaleString() + " ₫", dateLabel: monthStr };

                // --- Tổng tiền phạt ---
                const totalPenalty = borrows.reduce((sum, b) => sum + (b.penalty || 0), 0);
                penaltyStats.value = { total: totalPenalty.toLocaleString() + " ₫", dateLabel: `Đến ngày ${dateStr}` };

                // --- Lượt thuê trong tháng ---
                const currentMonthBorrows = borrows.filter((b) => {
                    const d = new Date(b.ngayMuon);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
                monthlyBorrowStats.value = { total: currentMonthBorrows.length + " lượt", dateLabel: monthStr };

                // --- Thể loại phổ biến nhất ---
                const categoryCount = {};
                borrows.forEach((b) => {
                    const cat = b.bookInfo?.theLoai || "Khác";
                    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                });
                const topCat = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
                topCategoryStats.value = {
                    total: topCat ? `${topCat[0]} (${topCat[1]} lượt)` : "Chưa có",
                    dateLabel: monthStr,
                };
                // --- Đang được mượn (hoặc quá hạn) ---
                const active = borrows.filter((b) => {
                    const status = (b.trangThai || "").trim().toLowerCase();
                    return status === "đang mượn" || status === "quá hạn";
                });
                activeBorrowStats.value = {
                    total: active.length,
                    dateLabel: `Cập nhật ${dateStr}`,
                };
                // console.log(borrows.map(b => b.trangThai));

                // --- Tổng sách và độc giả ---
                bookStats.value = { total: books.length, dateLabel: `Đến ${dateStr}` };
                userStats.value = { total: readers.length, dateLabel: `Đến ${dateStr}` };

                // --- 1. Biểu đồ doanh thu theo thể loại ---
                const revenueByCategory = {};
                borrows.forEach((b) => {
                    const cat = b.bookInfo?.theLoai || "Khác";
                    revenueByCategory[cat] = (revenueByCategory[cat] || 0) + (b.totalPayment || 0);
                });

                const ctx1 = document.getElementById("revenueChart").getContext("2d");
                if (revenueChart) revenueChart.destroy();
                revenueChart = new Chart(ctx1, {
                    type: "bar",
                    data: {
                        labels: Object.keys(revenueByCategory),
                        datasets: [
                            {
                                label: "Doanh thu (₫)",
                                data: Object.values(revenueByCategory),
                            },
                        ],
                    },
                    options: { responsive: true, scales: { y: { beginAtZero: true } } },
                });

                // --- 2. Biểu đồ tròn tỷ lệ thể loại ---
                const ctx2 = document.getElementById("categoryPieChart").getContext("2d");
                if (categoryPieChart) categoryPieChart.destroy();
                categoryPieChart = new Chart(ctx2, {
                    type: "pie",
                    data: {
                        labels: Object.keys(categoryCount),
                        datasets: [
                            {
                                label: "Tỷ lệ mượn",
                                data: Object.values(categoryCount),
                            },
                        ],
                    },
                    options: { responsive: true },
                });

                // --- 3. Biểu đồ đường: số lượt thuê theo ngày ---
                const dailyCount = {};
                currentMonthBorrows.forEach((b) => {
                    const d = new Date(b.ngayMuon).getDate();
                    dailyCount[d] = (dailyCount[d] || 0) + 1;
                });
                const days = Array.from({ length: 31 }, (_, i) => i + 1);
                const dailyData = days.map((d) => dailyCount[d] || 0);

                const ctx3 = document.getElementById("dailyBorrowChart").getContext("2d");
                if (dailyBorrowChart) dailyBorrowChart.destroy();
                dailyBorrowChart = new Chart(ctx3, {
                    type: "line",
                    data: {
                        labels: days,
                        datasets: [
                            {
                                label: "Số lượt thuê",
                                data: dailyData,
                                fill: false,
                                tension: 0.3,
                            },
                        ],
                    },
                    options: { responsive: true },
                });

                // --- Giao dịch gần nhất ---
                recentBorrows.value = borrows
                    .sort((a, b) => new Date(b.ngayMuon) - new Date(a.ngayMuon))
                    .slice(0, 5);
                // --- Top độc giả chi tiêu nhiều nhất ---
                const spenderMap = {};
                borrows.forEach(b => {
                    const id = b.docGiaInfo?._id;
                    const name = `${b.docGiaInfo?.hoLot || ''} ${b.docGiaInfo?.ten || ''}`.trim();
                    const spent = (b.totalPayment || 0) + (b.penalty || 0);
                    if (id) {
                        if (!spenderMap[id]) spenderMap[id] = { name, borrowCount: 0, totalSpent: 0 };
                        spenderMap[id].borrowCount++;
                        spenderMap[id].totalSpent += spent;
                    }
                });
                topSpenders.value = Object.values(spenderMap)
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 5);

            } catch (error) {
                console.error("Lỗi tải dashboard:", error);
            }
        };

        onMounted(loadDashboard);

        return {
            moneyIcon,
            warningIcon,
            chartIcon,
            categoryIcon,
            bookIcon,
            userIcon,
            revenueStats,
            penaltyStats,
            monthlyBorrowStats,
            topCategoryStats,
            bookStats,
            userStats,
            recentBorrows,
            formatDate,
            activeIcon, activeBorrowStats, topSpenders,
        };
    },
};
</script>

<style scoped>
#categoryPieChart {
    display: block;
    margin: 0 auto;
}

.chart-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 300px;
    height: 300px;
    margin: 0 auto;
}

#recentRentingTable {
    margin: auto;
    width: calc(80vw - 0px);
}

.table {
    font-size: 15px;
}

h1 {
    font-weight: bold;
}

.card {
    border-radius: 1rem;
    background: white;
}
</style>
