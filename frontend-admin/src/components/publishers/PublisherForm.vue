<template>
    <div>
        <form @submit.prevent="handleSubmit">
            <div class="mb-3">
                <label class="form-label">Tên nhà xuất bản</label>
                <input type="text" class="form-control" v-model="localPublisher.tenNXB">
            </div>
            <div class="mb-3">
                <label class="form-label">Địa chỉ nhà xuất bản</label>
                <input type="text" class="form-control" v-model="localPublisher.diaChi">
            </div>
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-secondary" @click="handleCancel">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    </div>

</template>

<script>

export default {
    props: {
        publisher: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            localPublisher: { ...this.publisher }
        }
    },
    watch: {
        publisher: {
            handler(newVal) {
                this.localPublisher = {
                    ...newVal
                };
            },
            deep: true,
        }
    },
    methods: {
        handleSubmit() {
            this.$emit("save", this.localPublisher);
        },
        handleCancel() {
            this.$emit("cancel");
        }
    }
}
</script>