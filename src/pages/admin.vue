<template>
  <v-container max-width="1920">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 搜尋區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <h3>管理者管理</h3>
      </v-col>

      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-btn
                  prepend-icon="mdi-account-plus"
                  variant="outlined"
                  color="deep-purple-darken-4"
                  @click="openDialog(null)"
                >
                  新增管理者
                </v-btn>
              </v-col>
              <v-col
                sm="4"
                lg="3"
                xl="2"
              >
                <v-row class="d-flex align-center">
                  <v-col
                    v-if="mdAndUp"
                    cols="2"
                    class="ps-lg-5"
                  >
                    <v-icon
                      v-tooltip:start="'可搜尋管理者編號、姓名、Email'"
                      icon="mdi-information"
                      size="small"
                      color="deep-purple-darken-4"
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="quickSearchText"
                      label="搜尋"
                      append-inner-icon="mdi-magnify"
                      base-color="#666"
                      color="blue-grey-darken-3"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <!-- 表格 -->
            <v-data-table-server
              :key="tableKey"
              v-model:items-per-page="tableItemsPerPage"
              v-model:sort-by="tableSortBy"
              :page="tablePage"
              density="compact"
              class="rounded-ts-lg rounded-te-lg py-3"
              :items-per-page-options="[10, 20 ,50]"
              :items="tableItems"
              :headers="filteredHeaders"
              :header-props="headerProps"
              :loading="tableLoading"
              :items-length="tableItemsLength"
              :search="tableSearch"
              hover
              @update:items-per-page="tableLoadItems(false)"
              @update:sort-by="tableLoadItems(false)"
              @update:page="onUpdatePage"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ item.adminId }}</td>
                  <td>{{ item.name }}</td>
                  <td v-if="lgAndUp">
                    {{ item.email }}
                  </td>
                  <td>{{ item.note }}</td>
                  <td class="d-flex align-center overflow-hidden h-25">
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      width="28"
                      :size="buttonSize"
                      :ripple="false"
                      @click="openDialog(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
    >
      <v-form
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-card class="rounded-lg px-4 py-6">
          <div class="card-title px-4 py-3">
            {{ dialog.id ? '管理者資料編輯' : '新增管理者' }}
          </div>

          <v-card-text class="mt-3 pa-3">
            <v-row>
              <v-col
                v-if="isEditing"
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="adminId.value.value"
                  :error-messages="adminId.errorMessage.value"
                  label="*管理者編號"
                  type="text"
                  variant="outlined"
                  density="compact"
                  :disabled="!isEditing"
                />
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="name.value.value"
                  :error-messages="name.errorMessage.value"
                  label="*姓名"
                  type="text"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="email.value.value"
                  :error-messages="email.errorMessage.value"
                  label="*Email"
                  type="email"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col
                v-if="!isEditing"
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="password.value.value"
                  :error-messages="password.errorMessage.value"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  label="*密碼"
                  variant="outlined"
                  density="compact"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-col>

              <v-col
                v-if="!isEditing"
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="confirmPassword.value.value"
                  :error-messages="confirmPassword.errorMessage.value"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  label="*確認密碼"
                  variant="outlined"
                  density="compact"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="note.value.value"
                  :error-messages="note.errorMessage.value"
                  label="備註"
                  type="text"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-4 mt-4">
            <v-hover>
              <template #default="{ isHovering, props }">
                <v-btn
                  v-if="isEditing"
                  v-bind="props"
                  :color="isHovering ? 'red-lighten-1' : 'grey'"
                  variant="outlined"
                  prepend-icon="mdi-delete"
                  :size="buttonSize"
                  @click="confirmDeleteDialog = true"
                >
                  永久刪除
                </v-btn>
              </template>
            </v-hover>
            <v-spacer />
            <v-btn
              color="red-lighten-1"
              variant="outlined"
              :size="buttonSize"
              :loading="isSubmitting"
              @click="closeDialog"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              type="submit"
              class="ms-1"
              :size="buttonSize"
              :loading="isSubmitting"
              :disabled="isEditing && !hasChanges"
            >
              送出
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除管理者"
      :message="`確定要刪除管理者「<span class='text-pink-lighten-1' style='font-weight: 800;'>${originalData?.name || ''}</span>」嗎？ 此操作無法復原。`"
      :expected-name="originalData?.name || ''"
      input-label="管理者"
      @confirm="deleteUser"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { debounce } from 'lodash'
import * as yup from 'yup'
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useRouter } from 'vue-router'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '管理者管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN]
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp, mdAndUp, lgAndUp } = useDisplay()

const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// ===== 基礎狀態管理 =====
const isEditing = ref(false)
const originalData = ref(null)
const confirmDeleteDialog = ref(false)
const headerProps = { class: 'header-bg' }

// ===== 表單驗證架構 =====
const userSchema = computed(() => {
  const schema = {
    email: yup
      .string()
      .required('請輸入 email')
      .email('請輸入正確的 email 格式'),
    name: yup
      .string()
      .required('請輸入姓名'),
    note: yup
      .string()
      .nullable()
  }

  if (isEditing.value) {
    schema.adminId = yup
      .string()
      .required('請輸入管理者編號')
  }

  if (!isEditing.value) {
    schema.password = yup
      .string()
      .required('請輸入密碼')
      .min(8, '密碼長度至少需要8個字元')
    schema.confirmPassword = yup
      .string()
      .required('請再次輸入密碼')
      .oneOf([yup.ref('password')], '密碼不一致')
  }

  return yup.object(schema)
})

// ===== 表單初始化與欄位設定 =====
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: userSchema,
  initialValues: {
    email: '',
    name: '',
    note: ''
  }
})

// ===== 表單欄位定義 =====
const email = useField('email')
const name = useField('name')
const note = useField('note')
const password = useField('password')
const confirmPassword = useField('confirmPassword')
const adminId = useField('adminId')

// ===== 表格相關設定 =====
const tableItemsPerPage = ref(10)
const tableSortBy = ref([{ key: 'adminId', order: 'asc' }])
const tablePage = ref(1)
const tableItems = ref([])
const tableKey = ref(0)
const tableHeaders = [
  { title: '管理者編號', align: 'left', sortable: true, key: 'adminId' },
  { title: '姓名', align: 'left', sortable: true, key: 'name' },
  { title: 'Email', align: 'left', sortable: true, key: 'email' },
  { title: '備註', align: 'left', sortable: true, key: 'note' },
  { title: '操作', align: 'left', sortable: false, key: 'action' }
]

const tableLoading = ref(true)
const tableItemsLength = ref(0)
const tableSearch = ref('')

// ===== 搜尋相關設定 =====
const quickSearchText = ref('')

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: ''
})

const dialogWidth = computed(() => {
  if (mdAndUp.value) return '800'
  if (smAndUp.value) return '600'
  return '100%'
})

// ===== 響應式表格抬頭設定 =====
const filteredHeaders = computed(() => {
  if (lgAndUp.value) {
    return tableHeaders
  }
  return tableHeaders.filter(header => header.key !== 'email')
})

// ===== API 相關函數 =====
const tableLoadItems = async (reset) => {
  if (reset) {
    tablePage.value = 1
  }
  await performSearch()
}

const performSearch = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'adminId',
      sortOrder: tableSortBy.value[0]?.order || 'asc',
      quickSearch: quickSearchText.value
    }

    const { data } = await apiAuth.get('/user/search/admins', { params })
    if (data.success) {
      tableItems.value = data.result.data
      tableItemsLength.value = data.result.totalItems
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message || '搜索失敗'
    if (error?.response?.status === 401) {
      await user.logout()
      router.push('/login')
      createSnackbar({
        text: '登入已過期，請重新登入',
        snackbarProps: { color: 'red-lighten-1' }
      })
    } else {
      createSnackbar({
        text: errorMessage,
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } finally {
    tableLoading.value = false
  }
}

// ===== 表單操作函數 =====
const submit = handleSubmit(async (values) => {
  try {
    const submitData = {
      ...values,
      isAdmin: true, // 標記這是管理者
      role: UserRole.ADMIN // 確保角色是管理者
    }

    if (isEditing.value) {
      const { data } = await apiAuth.patch(`/user/${dialog.value.id}`, submitData)
      const index = tableItems.value.findIndex(item => item._id === dialog.value.id)
      if (index !== -1) {
        tableItems.value[index] = data.result
      }
    } else {
      await apiAuth.post('/user', submitData)
      await tableLoadItems(true)
    }

    createSnackbar({
      text: isEditing.value ? '管理者資料更新成功' : '管理者新增成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })

    closeDialog()
  } catch (error) {
    const message = error?.response?.data?.message || '操作失敗'
    createSnackbar({
      text: message,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
})

// ===== 對話框操作函數 =====
const openDialog = async (item) => {
  dialog.value.open = true

  if (item) {
    isEditing.value = true
    dialog.value.id = item._id
    email.value.value = item.email
    name.value.value = item.name
    note.value.value = item.note
    adminId.value.value = item.adminId
    password.value.value = ''
    confirmPassword.value.value = ''

    originalData.value = {
      email: item.email,
      name: item.name,
      note: item.note,
      adminId: item.adminId
    }
  } else {
    isEditing.value = false
    dialog.value.id = ''
    originalData.value = null
    resetForm()
  }
}

const closeDialog = () => {
  dialog.value.open = false
  originalData.value = null
  resetForm()
}

// ===== 刪除用戶函數 =====
const deleteUser = async () => {
  try {
    tableLoading.value = true
    await apiAuth.delete(`/user/${dialog.value.id}`)
    closeDialog()
    await tableLoadItems(true)

    createSnackbar({
      text: '管理者刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('Delete user error:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
    confirmDeleteDialog.value = false
  }
}

// ===== 計算屬性 =====
const hasChanges = computed(() => {
  if (!isEditing.value) return true
  if (!originalData.value) return false

  return ['email', 'name', 'note', 'adminId'].some(key => {
    const formValue = key === 'email' ? email.value.value :
                    key === 'name' ? name.value.value :
                    key === 'note' ? note.value.value :
                    key === 'adminId' ? adminId.value.value : null
    return originalData.value[key] !== formValue
  })
})

// ===== 監聽器 =====
const debouncedQuickSearch = debounce(() => {
  tablePage.value = 1
  tableLoading.value = true
  performSearch()
    .finally(() => {
      tableLoading.value = false
    })
}, 300)

watch(quickSearchText, (newVal) => {
  debouncedQuickSearch(newVal)
})

// ===== 生命週期鉤子 =====
onMounted(async () => {
  try {
    await tableLoadItems(true)
  } catch (error) {
    console.error('初始化加載失敗:', error)
  }
})

// ===== 添加 onUpdatePage 函數 =====
const onUpdatePage = (page) => {
  if (page < 1) page = 1
  const maxPage = Math.ceil(tableItemsLength.value / tableItemsPerPage.value)
  if (page > maxPage) page = maxPage

  if (tablePage.value !== page) {
    tablePage.value = page
    localStorage.removeItem('adminTablePage')
    tableLoadItems(false)
  }
}

// ===== 添加 router =====
const router = useRouter()

// ===== 新增密碼相關的響應式變數 =====
const showPassword = ref(false)
const showConfirmPassword = ref(false)
</script>

<style lang="scss" scoped>
.v-data-table :deep(thead) {
  background-color: #4c0079;
  color: white;
}

.odd-row {
  background-color: #fff7fa;
}

.even-row {
  background-color: #f2f8fc;
}
</style>
