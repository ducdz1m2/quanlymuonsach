<template>
    <div
        class="upload-box border border-2 rounded p-3 text-center"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
    >
        <div v-if="!preview">
            <p class="">📂 Kéo thả ảnh vào đây hoặc</p>
            <input
                type="file"
                accept="image/*"
                class="form-control"
                @change="handleFileSelect"
            />
        </div>

        <div v-else>
            <img
                :src="preview"
                alt="Preview"
                class="img-thumbnail mb-2"
                style="max-height: 200px; object-fit: cover"
            />
            <div class="d-flex justify-content-center gap-2">
                <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    @click="removeImage"
                >
                    ❌ Xóa
                </button>
                <button
                    type="button"
                    class="btn btn-sm btn-secondary"
                    @click="$refs.fileInput.click()"
                >
                    📂 Chọn ảnh khác
                </button>
            </div>

            <input
                type="file"
                accept="image/*"
                ref="fileInput"
                class="d-none"
                @change="handleFileSelect"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: "UploadImage",
    props: {
        modelValue: String,
    },
    emits: ["update:modelValue"],

    data() {
        return {
            isDragOver: false,
            preview: this.modelValue || null,
        };
    },

    watch: {
        modelValue(newVal) {
            this.preview = newVal;
        },
    },

    methods: {
        handleDragOver() {
            this.isDragOver = true;
        },
        handleDragLeave() {
            this.isDragOver = false;
        },
        handleDrop(e) {
            this.isDragOver = false;
            const file = e.dataTransfer.files[0];
            this.readFile(file);
        },
        handleFileSelect(e) {
            const file = e.target.files[0];
            this.readFile(file);
        },
        readFile(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.preview = e.target.result;
                this.$emit("update:modelValue", this.preview);
            };
            reader.readAsDataURL(file); // lưu base64
        },
        removeImage() {
            this.preview = null;
            this.$emit("update:modelValue", null);
        },
    },
};
</script>

<style scoped>
.upload-box {
    /* background: #fafafa; */
    transition:
        background 0.2s,
        border-color 0.2s;
    cursor: pointer;
}

.upload-box.drag-over {
    /* background: #f0f8ff; */
    border-color: #007bff;
}
</style>
