<template>
    <div>
        <form @submit.prevent="handleSubmit">

            <div class="mb-3">
                <label class="form-label">Họ lót</label>
                <input type="text" class="form-control" v-model="localReader.hoLot" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Tên</label>
                <input type="text" class="form-control" v-model="localReader.ten" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Ngày sinh</label>
                <input type="date" class="form-control" v-model="localReader.ngaySinh">
            </div>

            <div class="mb-3">
                <label class="form-label">Phái</label>
                <input type="text" class="form-control" v-model="localReader.phai">
            </div>

            <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input type="text" class="form-control" v-model="localReader.diaChi">
            </div>

            <div class="mb-3">
                <label class="form-label">Điện thoại</label>
                <input type="text" class="form-control" v-model="localReader.dienThoai">
            </div>

            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="handleCancel">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    props: {
        reader: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            localReader: {
                ...this.reader
            }
        }
    },
    watch: {
        reader: {
            handler(newVal) {
                this.localReader = { ...newVal };
            },
            deep: true
        }
    },
    methods: {
        handleSubmit() {
            this.$emit("save", this.localReader);
        },
        handleCancel() {
            this.$emit("cancel");
        }
    }
}
</script>
