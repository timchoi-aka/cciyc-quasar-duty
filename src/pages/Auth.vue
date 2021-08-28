<template>
  <q-page class="flex flex-center">
    <AuthComponent/>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import AuthComponent from "components/AuthComponent";

export default defineComponent({
  name: 'PageIndex',
  components: { AuthComponent },
})
</script>
