<template>
    <nav class="py-3 ms-2 row text-center">
        <!-- Logo -->
        <div class="col-3 d-flex align-items-center">
            📚 Library Manager

        </div>
        <div class="col-5">
            <InputSearch v-model="keyword" @submit="test" />

        </div>
        <div class="col-4 d-flex flex-row justify-content-end">

            <NotificationBell />


            <Avatar class="mx-3" src="https://i.pravatar.cc/100" name="Nguyễn Văn A" size="sm" />
        </div>

    </nav>
</template>

<script>

import InputSearch from './InputSearch.vue';
import { ref } from 'vue';
import NotificationBell from './NotificationBell.vue';
import Avatar from './Avatar.vue';


export default {
    components: {
        InputSearch, NotificationBell, Avatar
    },
    setup() {
        const keyword = ref("")

        const test = () => {
            console.log("Search: OK")
        }
        return {
            keyword,
            test
        }
    }
}
</script>

<style scoped>
nav {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
