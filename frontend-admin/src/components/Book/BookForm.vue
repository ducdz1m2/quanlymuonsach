<template>
    <div>
        <form @submit.prevent="handleSubmit">
            <div class="mb-3">
                <label class="form-label">Tên sách</label>
                <input type="text" v-model="localBook.tenSach" class="form-control" required />
            </div>

            <div class="mb-3">
                <label class="form-label">Tác giả</label>
                <input type="text" v-model="localBook.tacGia" class="form-control" />
            </div>

            <div class="mb-3">
                <label class="form-label">Số lượng</label>
                <input type="number" v-model="localBook.soQuyen" class="form-control" min="0" />
            </div>

            <div class="mb-3">
                <label class="form-label">Năm xuất bản</label>
                <input type="number" v-model="localBook.namXuatBan" class="form-control" />
            </div>

            <div class="mb-3">
                <label class="form-label">Đơn giá</label>
                <input type="number" v-model="localBook.donGia" class="form-control" min="0" />
            </div>

            <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea v-model="localBook.moTa" class="form-control"></textarea>
            </div>

            <div class="mb-3">
                <label class="form-label">Ảnh bìa (URL)</label>
                <input type="text" v-model="localBook.anhBia" class="form-control" />
            </div>

            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    book: { type: Object, default: () => ({}) }
});
const emit = defineEmits(["save", "cancel"]);

const localBook = ref({ ...props.book });

// cập nhật khi book thay đổi
watch(
    () => props.book,
    (newVal) => {
        localBook.value = { ...newVal };
    },
    { deep: true }
);

function handleSubmit() {
    emit("save", localBook.value);
}
</script>
