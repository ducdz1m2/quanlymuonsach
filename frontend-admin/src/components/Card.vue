<template>

    <div class="rounded px-3 pt-3 border" id="cardContainer">
        <h4>{{ cardTitle }}</h4>
        <hr>
        <div class="d-flex flex-row justify-content-between">
            <h1>{{ modelValue.total }}</h1>
            <img :src="imgSrc" alt="img" width="40">
        </div>
        <hr>
        <div class="d-flex flex-row justify-content-between mx-2 mb-0">
            <p>Today: {{ modelValue.today }}</p>
            <p>This month: {{ modelValue.month }}</p>
        </div>
    </div>

</template>

<script>

export default {

    props: {
        imgSrc: { type: String, default: "" },
        cardTitle: { type: String, default: "" },
        modelValue: {
            type: Object, default: () => ({
                total: 0,
                today: 0,
                month: 0,
            })
        }
    },

}
</script>

<style scoped>
#cardContainer {
    min-width: 260px;
}
</style>