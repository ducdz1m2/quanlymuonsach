<template>
    <div class="container text-center mt-5">
        <img :src="NotFoundImg" width="100" class="mb-5">
        <h2>Oops, không tìm thấy trang.</h2>
        <router-link to="/">
            <h3>Trang chủ.</h3>
        </router-link>
    </div>

</template>

<script>
import NotFoundImg from "@/assets/NotFound.png"
export default {
    name: "NotFound",
    data() {
        return { NotFoundImg }
    }
}

</script>