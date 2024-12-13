import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserRole from '@/enums/UserRole.js'
import { useApi } from '@/composables/axios'

export const useUserStore = defineStore('user', () => {
  const { api, apiAuth } = useApi()

  // 基本狀態
  const token = ref('')
  const name = ref('')
  const email = ref('')
  const role = ref(UserRole.USER)
  const userId = ref('')
  const adminId = ref('')
  const note = ref('')
  const avatar = ref('')

  // 計算屬性
  const isLogin = computed(() => token.value.length > 0)
  const isUser = computed(() => role.value === UserRole.USER)
  const isManager = computed(() => role.value === UserRole.MANAGER)
  const isAdmin = computed(() => role.value === UserRole.ADMIN)

  // 登入
  const login = async (values) => {
    try {
      const { data } = await api.post('/user/login', values)

      if (data.success && data.result.token) {
        token.value = data.result.token
        name.value = data.result.name
        email.value = data.result.email
        role.value = data.result.role
        userId.value = data.result.userId
        adminId.value = data.result.adminId
        note.value = data.result.note
        avatar.value = data.result.avatar
        await profile()
        return '登入成功'
      } else {
        throw new Error(data.message || '登入失敗')
      }
    } catch (error) {
      console.error('Login error:', error)
      return error?.response?.data?.message || '登入失敗，請稍後再試'
    }
  }

  // Google 登入
  const googleLogin = async (code) => {
    try {
      const response = await api.post('/user/google-login', { code })

      if (response.data.success) {
        token.value = response.data.result.token
        name.value = response.data.result.name
        email.value = response.data.result.email
        role.value = response.data.result.role
        userId.value = response.data.result.userId
        adminId.value = response.data.result.adminId
        note.value = response.data.result.note
        avatar.value = response.data.result.avatar
        return '登入成功'
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.log('Google登入失敗:', error.message)
      return error?.response?.data?.message || 'Google登入失敗，請稍後再試'
    }
  }

  // 取得個人資料
  const profile = async () => {
    if (!isLogin.value) return

    try {
      const { data } = await apiAuth.get('/user/profile')
      email.value = data.result.email
      name.value = data.result.name
      role.value = data.result.role
      userId.value = data.result.userId
      adminId.value = data.result.adminId
      note.value = data.result.note
      avatar.value = data.result.avatar
    } catch (error) {
      console.log(error)
      logout()
    }
  }

  // 修改密碼
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await apiAuth.patch('/user/change-password', {
        currentPassword,
        newPassword
      })

      if (!data.success) {
        throw new Error(data.message || '密碼更新失敗')
      }

      return {
        success: true,
        message: data.message || '密碼更新成功'
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '密碼更新失敗'
      throw new Error(errorMessage)
    }
  }

  // 忘記密碼
  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/user/forgot-password', { email })

      if (!data.success) {
        throw new Error(data.message || '發送重設密碼郵件失敗')
      }

      return {
        success: true,
        message: data.message || '重設密碼郵件已發送，請檢查您的信箱'
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '發送重設密碼郵件失敗'
      throw new Error(errorMessage)
    }
  }

  // 重設密碼
  const resetPassword = async (token, newPassword) => {
    try {
      const { data } = await api.post('/user/reset-password', {
        resetPasswordToken: token,
        password: newPassword
      })

      if (!data.success) {
        throw new Error(data.message || '重設密碼失敗')
      }

      return {
        success: true,
        message: data.message || '密碼重設成功'
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '重設密碼失敗'
      throw new Error(errorMessage)
    }
  }

  // 登出
  const logout = async () => {
    try {
      await apiAuth.delete('/user/logout')
    } catch (error) {
      console.log(error)
    }
    token.value = ''
    email.value = ''
    name.value = ''
    role.value = UserRole.USER
    userId.value = ''
    adminId.value = ''
    note.value = ''
    avatar.value = ''
  }

  return {
    // 狀態
    token,
    email,
    name,
    role,
    userId,
    adminId,
    note,
    avatar,

    // 計算屬性
    isLogin,
    isUser,
    isManager,
    isAdmin,

    // 方法
    login,
    logout,
    profile,
    googleLogin,
    changePassword,
    forgotPassword,
    resetPassword
  }
}, {
  persist: {
    key: 'ginternational',
    paths: ['token']
  }
}) 