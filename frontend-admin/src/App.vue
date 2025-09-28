<template>
  <Header />
  <div class="d-flex flex-row">
    <Sidebar />
    <div class="m-3 w-100">
      <router-view />
    </div>
  </div>
  <Footer />
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Sidebar from './components/Sidebar.vue';

export default {
  components: {
    Header,
    Footer,
    Sidebar
  }
}

</script>