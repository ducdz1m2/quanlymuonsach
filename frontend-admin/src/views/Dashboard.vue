<template>
    <div class="d-flex flex-row">
        <div class="m-3">
            <h1>
                Dashboard
            </h1>
            <div class="d-flex flex-row gap-4 p-4">
                <Card cardTitle="Tổng sách trong kho" :imgSrc="bookIcon" v-model="bookStats" />
                <Card cardTitle="Tổng người dùng" :imgSrc="userIcon" v-model="userStats" />
            </div>
            <div class="d-flex flex-row gap-4 p-4">
            </div>

            <h4 class="ps-4 mt-4">Vừa thuê</h4>
            <div class="table-responsive px-4" id="recentRentingTable">
                <table class="table table-hover table-bordered text-center align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>Mã thuê</th>
                            <th>Người thuê</th>
                            <th>Sách thuê</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>TH001</td>
                            <td>Nguyen Van A</td>
                            <td>Harry Potter</td>
                            <td><span class="badge bg-warning text-dark">Đang mượn</span></td>
                            <td>100.000₫</td>
                        </tr>
                        <tr>
                            <td>TH002</td>
                            <td>Tran Thi B</td>
                            <td>Lord of the Rings</td>
                            <td><span class="badge bg-success">Đã trả</span></td>
                            <td>100.000₫</td>
                        </tr>
                        <tr>
                            <td>TH003</td>
                            <td>Le Van C</td>
                            <td>Clean Code</td>
                            <td><span class="badge bg-warning text-dark">Đang mượn</span></td>
                            <td>100.000₫</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<script>
import Card from "@/components/Card.vue";
import Sidebar from "@/components/Sidebar.vue";
import bookIcon from "@/assets/book.png"
import userIcon from "@/assets/user.png"
import { ref } from "vue";
export default {
    components: { Sidebar, Card },
    setup() {

        const bookStats = ref({
            total: 150,
            today: 30,
            month: 80
        });
        const userStats = ref({
            total: 33,
            today: 12,
            month: 30
        })
        return {
            bookIcon,
            userIcon,
            bookStats,
            userStats
        }
    }
};
</script>

<style scoped>
#recentRentingTable {
    margin: auto;
    width: calc(80vw - 0px);


}
</style>
