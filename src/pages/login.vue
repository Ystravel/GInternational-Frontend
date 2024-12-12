<template>
  <div
    v-if="!isChecking"
    id="background"
    class="d-flex justify-center align-center"
  >
    <v-container
      width="380"
      height="510"
      class="login-wrapper mx-2 mx-sm-0"
    >
      <v-form
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-row class="px-4">
          <v-col
            cols="12"
            class="pt-10 pb-6 pe-8 ps-6 d-flex justify-center"
          >
            <v-img
              src="/src/assets/image/GInternational_Logo_horizontal.png"
              max-width="248"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="email.value.value"
              :error-messages="email.errorMessage.value"
              label="email"
              density="compact"
              variant="underlined"
              clearable
            />
          </v-col>
          <v-col
            cols="12"
            class="pb-1"
          >
            <v-text-field
              v-model="password.value.value"
              :error-messages="password.errorMessage.value"
              :type="showPassword? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              label="password"
              density="compact"
              variant="underlined"
              @click:append-inner="showPassword = !showPassword"
            />
          </v-col>
          <v-col
            cols="12"
            class="ps-2 pe-4 py-0 d-flex justify-space-between align-center"
          >
            <v-checkbox
              v-model="rememberMe"
              label="記住我"
              hide-details
              density="compact"
              color="grey-darken-2"
              class="text-caption"
            />
            <!-- <router-link
              class="text-caption text-blue-grey-darken-2"
              to="./forgotPassword"
            >
              忘記密碼？
            </router-link> -->
          </v-col>
          <v-col
            cols="12"
            class="text-center"
          >
            <v-btn
              block
              elevation="2"
              color="deep-purple-darken-2"
              type="submit"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              Login
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            class="py-0 ps-2"
          />
          <v-col>
            <v-row>
              <v-col cols="5">
                <v-divider class="my-4" />
              </v-col>
              <v-col
                cols="2"
                class="d-flex align-center justify-center pa-0"
                style="letter-spacing: 2px; font-size: 15px; opacity: 60%;"
              >
                或使用
              </v-col>
              <v-col cols="5">
                <v-divider class="my-4" />
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            class="text-center"
          >
            <GoogleLogin
              :callback="googleLoginCallback"
              :client-id="googleClientId"
              prompt
              class="w-100"
            >
              <v-btn
                block
                elevation="2"
                color="pink-darken-1"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                <v-icon
                  icon="mdi-google-plus"
                  size="24"
                  class="me-2"
                />Google 登入
              </v-btn>
            </GoogleLogin>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
    <v-progress-circular
      v-if="isChecking"
      indeterminate
      size="64"
      color="primary"
      class="center-screen"
    />
  </div>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref, onMounted, nextTick } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import * as yup from 'yup'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useForm, useField } from 'vee-validate'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    title: '登入 | GInternational'
  }
})

const router = useRouter()
const user = useUserStore()
const createSnackbar = useSnackbar()
const isChecking = ref(true)

const showPassword = ref(false)
const rememberMe = ref(false)

const schema = yup.object({
  email: yup
    .string()
    .required('請輸入email')
    .email('請輸入正確email格式'),
  password: yup
    .string()
    .required('請輸入密碼')
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})

const email = useField('email')
const password = useField('password')

// Google Client ID - 請替換成你的 Client ID
const googleClientId = '276416380558-pgfrsn7bb9fot96r8s3kbeu9cqghind3.apps.googleusercontent.com'


const googleLoginCallback = async (response) => {
  try {
    isSubmitting.value = true

    if (!response.code) {
      throw new Error('未收到 Google 授權碼')
    }

    const result = await user.googleLogin(response.code)

    if (result === '登入成功') {
      createSnackbar({
        text: '登入成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      router.push('/')
    } else {
      createSnackbar({
        text: result,
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } catch (error) {
    console.error('Google 登入錯誤:', error)
    createSnackbar({
      text: 'Google 登入失敗，請稍後再試',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmitting.value = false
  }
}

const submit = handleSubmit(async (values) => {
  if (rememberMe.value) {
    localStorage.setItem('savedEmail', values.email)
  } else {
    localStorage.removeItem('savedEmail')
  }

  const result = await user.login(values)
  if (result === '登入成功') {
    createSnackbar({
      text: result,
      snackbarProps: {
        color: 'teal-lighten-1'
      }
    })
    router.push('/')
  } else {
    createSnackbar({
      text: result,
      snackbarProps: {
        color: 'red-lighten-1'
      }
    })
  }
})

onMounted(async () => {
  const savedEmail = localStorage.getItem('savedEmail')
  if (savedEmail) {
    email.value.value = savedEmail
    rememberMe.value = true
  }

  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const paramEmail = params.get('email')
  const avatar = params.get('avatar')
  const name = params.get('name')
  const role = parseInt(params.get('role'), 10)
  const errorMessage = params.get('message')

  if (errorMessage) {
    createSnackbar({
      text: errorMessage,
      snackbarProps: {
        color: 'red-lighten-1'
      }
    })
    isChecking.value = false
    return
  }

  if (token) {
    user.$patch({
      token,
      email: paramEmail,
      avatar,
      name,
      role
    })

    await nextTick()
    createSnackbar({
      text: '登入成功',
      snackbarProps: {
        color: 'teal-lighten-1'
      }
    })
    router.push('/')
  }

  isChecking.value = false
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

.login-wrapper {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-family: "微軟正黑體";
  font-size: 20px;
  font-weight: 600;
  box-shadow: 0 0 20px 4px rgba(0,0,0,0.2);
}

.v-checkbox :deep(.v-label) {
  font-size: 14px;
}
</style>

<route lang="yaml">
meta:
  layout: login
</route>
