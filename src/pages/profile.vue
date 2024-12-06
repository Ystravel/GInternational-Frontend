<template>
  <v-container max-width="2200">
    <v-row>
      <v-col
        v-if="mdAndUp"
        md="3"
      >
        <v-row class="elevation-4 rounded-lg pt-8 pb-10 px-1 px-sm-10 mt-2 mt-sm-6 mx-10 bg-white">
          <v-card
            width="100%"
            elevation="0"
          >
            <v-row class="text-center">
              <v-col cols="12">
                <v-avatar
                  size="100"
                >
                  <v-skeleton-loader
                    v-if="!isProfileAvatarLoaded"
                    width="100"
                    height="100"
                  />
                  <v-img
                    v-show="isProfileAvatarLoaded"
                    :src="user.avatar"
                    @load="handleProfileAvatarLoad"
                  />
                </v-avatar>
              </v-col>
              <v-col>
                <div class="name mb-3 opacity-90">
                  {{ user.name }}
                </div>
                <div class="text-subtitle-2 mb-4 opacity-70">
                  <span v-tooltip:end="'員工編號'">{{ user.userId }}</span>
                </div>
                <div
                  style="font-size: 15px; font-weight: 600;"
                  class="opacity-90 mb-12"
                >
                  {{ getRoleTitle(user.role) }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-row>
      </v-col>
      <v-col md="9">
        <v-row class="elevation-4 rounded-lg pt-8 pb-6 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 ms-xl-0 me-xl-10 mb-4 bg-white">
          <v-col
            cols="12"
            class="d-flex justify-space-between"
          >
            <h3>
              個人資料管理&nbsp;&nbsp;&nbsp;
              <span
                v-if="mdAndUp"
                class="text-subtitle-2 opacity-80 font-weight-regular"
              >
                <span class="text-red-darken-2">* </span>若有需要修改 請聯絡管理員 ( 密碼可自行修改 )
              </span>
            </h3>
            <div>
              <v-row>
                <v-col>
                  <v-btn
                    v-if="mdAndUp"
                    color="purple-darken-4"
                    prepend-icon="mdi-pencil"
                    variant="outlined"
                    height="36"
                    @click="showPasswordDialog = true"
                  >
                    修改密碼
                  </v-btn>
                </v-col>
                <v-col v-if="!mdAndUp">
                  <v-btn
                    color="purple-darken-4"
                    prepend-icon="mdi-pencil"
                    variant="outlined"
                    size="small"
                    height="32"
                    @click="showPasswordDialog = true"
                  >
                    修改密碼
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-col>
          <v-col
            v-if="!mdAndUp"
            cols="12"
          >
            <span class="text-subtitle-2 opacity-80 font-weight-regular">
              <span class="text-red-darken-2">* </span>若有需要修改 請聯絡管理員 ( 密碼可自行修改 )
            </span>
          </v-col>
          <v-col>
            <v-divider />
          </v-col>
          <v-col
            cols="12"
            class="mt-3 mb-6 text-center text-purple-darken-4"
          >
            <div class="info-title">
              《 基本資料 》
            </div>
          </v-col>
          <v-col cols="12">
            <v-row class="text-purple-darken-4">
              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    姓名 :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="user.name"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    Email :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="user.email"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    員工編號 :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="user.userId"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    身分別 :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="getRoleTitle(user.role)"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    備註 :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="user.note"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <!-- 修改密碼對話框 -->
  <v-dialog
    v-model="showPasswordDialog"
    max-width="360"
  >
    <v-card>
      <div class="card-title ps-6 py-6">
        修改密碼
      </div>
      <v-card-text class="pb-0">
        <v-form @submit.prevent="handlePasswordChange">
          <v-text-field
            v-model="passwordForm.currentPassword"
            :error-messages="currentPasswordError"
            :type="showCurrentPassword ? 'text' : 'password'"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="當前密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="currentPasswordError = ''"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
          />
          <v-text-field
            v-model="passwordForm.newPassword"
            :error-messages="newPasswordError"
            :type="showNewPassword ? 'text' : 'password'"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="新密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="newPasswordError = ''"
            @click:append-inner="showNewPassword = !showNewPassword"
          />
          <v-text-field
            v-model="passwordForm.confirmPassword"
            :error-messages="confirmPasswordError"
            :type="showConfirmPassword ? 'text' : 'password'"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="確認新密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="confirmPasswordError = ''"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="me-4 mb-3">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          :size="buttonSize"
          @click="closePasswordDialog"
        >
          取消
        </v-btn>
        <v-btn
          color="purple-darken-4"
          variant="outlined"
          :size="buttonSize"
          :loading="isChangingPassword"
          @click="handlePasswordChange"
        >
          確認修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { computed, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { roleNames } from '@/enums/UserRole'

const { mdAndUp } = useDisplay()

const buttonSize = computed(() => mdAndUp.value ? 'default' : 'small')

definePage({
  meta: {
    title: '個人資料管理 | GInternational',
    login: true
  }
})

const showPasswordDialog = ref(false)
const isChangingPassword = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

const user = useUserStore()
const createSnackbar = useSnackbar()

const getRoleTitle = (roleValue) => {
  return roleNames[roleValue] || '未知'
}

const validatePasswordForm = () => {
  let isValid = true

  if (!passwordForm.value.currentPassword) {
    currentPasswordError.value = '請輸入當前密碼'
    isValid = false
  }

  if (!passwordForm.value.newPassword) {
    newPasswordError.value = '請輸入新密碼'
    isValid = false
  } else if (passwordForm.value.newPassword.length < 8) {
    newPasswordError.value = '新密碼長度至少需要8個字元'
    isValid = false
  }

  if (!passwordForm.value.confirmPassword) {
    confirmPasswordError.value = '請確認新密碼'
    isValid = false
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    confirmPasswordError.value = '兩次輸入的密碼不相符'
    isValid = false
  }

  return isValid
}

const handlePasswordChange = async () => {
  if (!validatePasswordForm()) return

  try {
    isChangingPassword.value = true
    const result = await user.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )

    createSnackbar({
      text: result.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    closePasswordDialog()
  } catch (error) {
    createSnackbar({
      text: error.message,
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isChangingPassword.value = false
  }
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

const isProfileAvatarLoaded = ref(false)

const handleProfileAvatarLoad = () => {
  setTimeout(() => {
    isProfileAvatarLoaded.value = true
  }, 100)
}

watch(() => user.avatar, (newAvatar) => {
  if (newAvatar) {
    isProfileAvatarLoaded.value = false
    const img = new Image()
    img.onload = () => {
      handleProfileAvatarLoad()
    }
    img.src = newAvatar
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as rwd;
@import '@/styles/settings.scss';

.v-col-sm-12 {
  font-size: 13px;
}

@media (min-width: 600px) {
  .v-col-sm-12 {
    font-size: 15px;
  }
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
}

.name {
  font-size: 15px;
  font-weight: 600;
}

@include rwd.sm {
  .name {
    font-size: 18px;
  }
}
</style>
