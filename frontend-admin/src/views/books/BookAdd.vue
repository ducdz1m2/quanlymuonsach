<template>
    <div class="p-4">
        <h2>➕ Thêm sách mới</h2>
        <BookForm @submit="handleSubmit" @cancel="goBack" />
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import BookForm from "@/components/BookForm.vue";

const router = useRouter();

async function handleSubmit(book) {
    try {
        await BookService.create(book);
        alert("✅ Thêm sách thành công!");
        router.push("/books");
    } catch (error) {
        console.error("Lỗi thêm sách:", error);
        alert("❌ Thêm sách thất bại!");
    }
}

function goBack() {
    router.push("/books");
}
</script>
