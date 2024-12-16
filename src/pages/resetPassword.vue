<template>
  <div
    id="background"
    class="fill-height d-flex justify-center align-center"
  >
    <v-container
      class="reset-password-wrapper pa-0"
      style="max-width: 360px;"
    >
      <v-form
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-row class="px-4 ma-0">
          <v-col
            cols="12"
            class="text-center mt-4 font-weight-bold"
          >
            重置密碼
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="password.value.value"
              :error-messages="password.errorMessage.value"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              label="新密碼"
              density="compact"
              variant="underlined"
              @click:append-inner="showPassword = !showPassword"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="confirmPassword.value.value"
              :error-messages="confirmPassword.errorMessage.value"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              label="確認新密碼"
              density="compact"
              variant="underlined"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            />
          </v-col>

          <v-col
            cols="12"
            class="pb-8"
          >
            <div class="text-body-2 text-medium-emphasis mb-6">
              新密碼必須至少8個字元
            </div>
            <v-btn
              block
              elevation="2"
              color="purple-lighten-1"
              type="submit"
              :loading="isSubmitting"
            >
              重置密碼
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </div>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter, useRoute } from 'vue-router'

definePage({
  name: 'reset-password',
  path: '/reset-password/:token',
  meta: {
    title: '重設密碼 | GInternational',
    layout: 'login'
  }
})

const router = useRouter()
const route = useRoute()
const user = useUserStore()
const createSnackbar = useSnackbar()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const schema = yup.object({
  password: yup
    .string()
    .required('請輸入新密碼')
    .min(8, '密碼長度至少需要8個字元'),
  confirmPassword: yup
    .string()
    .required('請再次輸入新密碼')
    .oneOf([yup.ref('password')], '兩次輸入的密碼不相符')
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})

const password = useField('password')
const confirmPassword = useField('confirmPassword')

const submit = handleSubmit(async (values) => {
  try {
    const token = route.params.token
    if (!token) {
      throw new Error('無效的重設密碼連結')
    }

    const result = await user.resetPassword(token, values.password)
    createSnackbar({
      text: result.message,
      snackbarProps: {
        color: 'teal-lighten-1'
      }
    })
    router.push('/login')
  } catch (error) {
    createSnackbar({
      text: error.message,
      snackbarProps: {
        color: 'red-lighten-1'
      }
    })
  }
})
</script>

<style lang="scss" scoped>
#background {
  width: 100%;
  height: 100%;
  background-image: url(/src/assets/image/bg_login.webp);
  background-size: cover;
  background-position: center;
}

.reset-password-wrapper {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-family: "微軟正黑體";
  font-size: 20px;
  font-weight: 600;
  box-shadow: 0 0 20px 4px rgba(0,0,0,0.2);
}
</style>