<template>
    <button class="btn btn-primary" @click="toggleTheme">
        {{ currentTheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode" }}
    </button>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
    setup() {
        const currentTheme = ref("light");

        onMounted(() => {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme === "dark") {
                document.body.classList.add("dark");
                currentTheme.value = "dark";
            } else {
                document.body.classList.remove("dark");
                currentTheme.value = "light";
            }
        });

        const toggleTheme = () => {
            const isDark = document.body.classList.toggle("dark");
            currentTheme.value = isDark ? "dark" : "light";
            localStorage.setItem("theme", currentTheme.value);
        };

        return {
            currentTheme,
            toggleTheme,
        };
    },
};
</script>
