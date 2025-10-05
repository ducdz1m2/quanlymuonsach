<template>
    <div class="rounded px-3 pt-3 border shadow-sm bg-white" id="cardContainer">
        <div class="d-flex flex-row justify-content-between align-items-center">
            <h4>{{ cardTitle }}</h4>
            <img :src="imgSrc" alt="img" width="35">
        </div>

        <!-- Dòng hiển thị thời gian -->
        <p v-if="modelValue.dateLabel" class="text-muted small mb-2">
            {{ modelValue.dateLabel }}
        </p>

        <hr>

        <div class="d-flex flex-row justify-content-between align-items-center">
            <h1>{{ modelValue.total }}</h1>
        </div>

        <hr v-if="showDateStats" />
        <div v-if="showDateStats" class="d-flex flex-row justify-content-between mx-2 mb-0">
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
            type: Object,
            default: () => ({
                total: 0,
                today: null,
                month: null,
                dateLabel: null,
            }),
        },
    },
    computed: {
        showDateStats() {
            return (
                typeof this.modelValue.today === "number" &&
                typeof this.modelValue.month === "number"
            );
        },
    },
};
</script>

<style scoped>
#cardContainer {
    min-width: 260px;
}

h1 {
    font-weight: 700;
}

.text-muted {
    font-size: 13px;
}
</style>
