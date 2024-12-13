<template>
  <div
    id="background"
    class="d-flex justify-center align-center"
  >
    <v-container
      class="forgot-password-wrapper pa-0"
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
            忘記密碼
          </v-col>

          <v-col cols="12">
            <div class="text-body-2 text-medium-emphasis my-4">
              請輸入您的 Email ，將寄送密碼重置連結給您。
            </div>
            <v-text-field
              v-model="email.value.value"
              :error-messages="email.errorMessage.value"
              label="Email"
              density="compact"
              variant="underlined"
              clearable
            />
          </v-col>

          <v-col
            cols="12"
          >
            <v-btn
              block
              elevation="2"
              color="purple-lighten-1"
              type="submit"
              :loading="isSubmitting"
            >
              發送重置郵件
            </v-btn>
          </v-col>

          <v-col
            cols="12"
            class="text-center pb-2"
          >
            <router-link
              class="text-grey-darken-1"
              style="font-size: 15px; font-weight: 500;"
              to="/login"
            >
              返回登入
            </router-link>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </div>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    title: '忘記密碼 | GInternational',
    layout: 'login'
  }
})

const router = useRouter()
const user = useUserStore()
const createSnackbar = useSnackbar()

const schema = yup.object({
  email: yup
    .string()
    .required('請輸入email')
    .email('請輸入正確email格式')
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})

const email = useField('email')

const submit = handleSubmit(async (values) => {
  try {
    const result = await user.forgotPassword(values.email)
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

.forgot-password-wrapper {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 18px;
  font-weight: 500;
  box-shadow: 0 0 20px 4px rgba(0,0,0,0.2);
  min-height: 340px;
  display: flex;
  flex-direction: column;
}
</style>