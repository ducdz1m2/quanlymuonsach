<template>
    <div class="p-3 border rounded bg-light">
        <h5>📩 Gửi thông báo cá nhân</h5>

        <select v-model="receiver_id" class="form-select mb-2">
            <option disabled value="">-- Chọn người nhận --</option>
            <option v-for="u in readers" :value="u._id" :key="u._id">{{ u.hoTen }}</option>
        </select>

        <input v-model="title" class="form-control mb-2" placeholder="Tiêu đề" />
        <textarea v-model="message" class="form-control mb-2" rows="3" placeholder="Nội dung..."></textarea>
        <button class="btn btn-primary" @click="sendNotification">Gửi</button>
    </div>
</template>

<script setup>
import { ref } from "vue";
import NotificationService from "@/services/notification.service";
import ReaderService from "@/services/reader.service";

const readers = ref([]);
const receiver_id = ref("");
const title = ref("");
const message = ref("");

async function loadReaders() {
    const res = await ReaderService.getAll();
    readers.value = res;
}

async function sendNotification() {
    if (!receiver_id.value || !message.value) {
        alert("Vui lòng chọn người nhận và nhập nội dung!");
        return;
    }

    try {
        await NotificationService.create({
            sender_id: localStorage.getItem("staffId"), // hoặc staffInfo._id
            receiver_id: receiver_id.value,
            title: title.value,
            message: message.value,
        });
        alert("Gửi thông báo thành công!");
        title.value = "";
        message.value = "";
    } catch (err) {
        console.error(err);
        alert("Lỗi khi gửi thông báo!");
    }
}

loadReaders();
</script>
