<template>
    <div class="p-4">
        <h2>✏️ Sửa sách</h2>
        <BookForm :modelValue="book" @submit="handleSubmit" @cancel="goBack" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BookForm from "@/components/BookForm.vue";

const route = useRoute();
const router = useRouter();

const book = ref({});

onMounted(() => {
    const id = route.params.id;
    // TODO: gọi API lấy sách theo id
    book.value = {
        id,
        tenSach: "Harry Potter",
        tacGia: "J.K. Rowling",
        namXuatBan: 2001,
        soQuyen: 10,
        donGia: 120000,
        moTa: "Tiểu thuyết nổi tiếng",
        anhBia: "",
    };
});

function handleSubmit(updatedBook) {
    console.log("Cập nhật sách:", updatedBook);
    // TODO: gọi API update
    router.push("/books");
}

function goBack() {
    router.push("/books");
}
</script>
