<template>

    <div>
        <form @submit.prevent="handleSubmit">


            <div class="mb-3">
                <label class="form-label">Tên nhân viên</label>
                <input type="text" class="form-control" v-model="localStaff.hoTenNV" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Chức vụ</label>
                <input type="text" class="form-control" v-model="localStaff.chucVu">
            </div>
            <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="text" class="form-control" v-model="localStaff.email">
            </div>
            <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input type="text" class="form-control" v-model="localStaff.soDienThoai">
            </div>
            <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input type="text" class="form-control" v-model="localStaff.diaChi">
            </div>
            <div class="mb-3">
                <label class="form-label">Phái</label>
                <input type="text" class="form-control" v-model="localStaff.phai">
            </div>
            <div class="mb-3">
                <label class="form-label">Ngày sinh</label>
                <input type="text" class="form-control" v-model="localStaff.ngaySinh">
            </div>
            <div class="mb-3">
                <label class="form-label">Ảnh đại diện</label>
                <input type="text" class="form-control" v-model="localStaff.anh">
            </div>

            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-secondary" @click="$emit('cancel')">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>

            </div>
        </form>
    </div>
</template>

<script>

export default {
    props: {
        staff: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            localStaff: {
                ...this.staff
            }
        }
    },

    watch: {

        staff: {
            handler(newVal) {
                this.localStaff = { ...newVal };
            },
            deep: true,
        },
    },
    methods: {
        handleSubmit() {
            this.$emit("save", this.localStaff)
        },
        handleCancel() {
            this.$emit("cancel")
        }
    }

}

</script>