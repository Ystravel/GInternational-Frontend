<template>
  <v-container max-width="2000">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-6 d-flex align-center"
      >
        <h3 class="d-inline">
          實際花費管理
        </h3>
        <div
          style="width: 260px;"
          class="ms-auto d-flex align-center"
        >
          <v-icon
            v-tooltip:start="'可搜尋備註'"
            icon="mdi-information"
            size="small"
            color="deep-purple-darken-4"
            class="me-2"
          />
          <v-text-field
            v-model="searchText"
            label="搜尋"
            append-inner-icon="mdi-magnify"
            :loading="isSearching"
            base-color="#666"
            color="blue-grey-darken-3"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="handleSearch"
          />
        </div>
      </v-col>

      <!-- 表格區塊 -->
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            prepend-icon="mdi-plus"
            @click="openDialog()"
          >
            新增實際花費
          </v-btn>
        </div>

        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="items"
          :items-length="totalItems"
          :loading="isLoading"
          class="elevation-0 rounded-lg"
        >
          <template #item-invoiceDate="{ item }">
            {{ formatDate(item.invoiceDate) }}
          </template>

          <template #item-expense="{ item }">
            {{ formatNumber(item.expense) }}
          </template>

          <template #item-actions="{ item }">
            <v-btn
              v-tooltip="{ text: '編輯', location: 'start' }"
              icon
              color="light-blue-darken-4"
              variant="plain"
              size="small"
              @click="editItem(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>

    <!-- 新���/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
      :fullscreen="!smAndUp"
    >
      <v-form
        ref="form"
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-card class="rounded-lg px-4 py-6">
          <div class="card-title px-4 py-3">
            {{ dialog.id ? '編輯實際花費' : '新增實際花費' }}
          </div>

          <v-card-text class="mt-3 pa-3">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="invoiceDate.value.value"
                  :error-messages="invoiceDate.errorMessage.value"
                  label="*日期"
                  type="date"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="theme.value.value"
                  :error-messages="theme.errorMessage.value"
                  :items="themeOptions"
                  item-title="name"
                  item-value="_id"
                  label="*行銷主題"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="channel.value.value"
                  :error-messages="channel.errorMessage.value"
                  :items="channelOptions"
                  item-title="name"
                  item-value="_id"
                  label="*廣告渠道"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="platform.value.value"
                  :error-messages="platform.errorMessage.value"
                  :items="platformOptions"
                  item-title="name"
                  item-value="_id"
                  label="*平台"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="detail.value.value"
                  :error-messages="detail.errorMessage.value"
                  :items="detailOptions"
                  item-title="name"
                  item-value="_id"
                  label="*���項"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="expense.value.value"
                  :error-messages="expense.errorMessage.value"
                  label="*花費金額"
                  type="number"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="relatedBudget.value.value"
                  :error-messages="relatedBudget.errorMessage.value"
                  :items="budgetOptions"
                  item-title="name"
                  item-value="_id"
                  label="關聯預算表"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="note.value.value"
                  :error-messages="note.errorMessage.value"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  clearable
                  auto-grow
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-3">
            <v-hover>
              <template #default="{ isHovering, props }">
                <v-btn
                  v-if="dialog.id"
                  v-bind="props"
                  :color="isHovering ? 'red-lighten-1' : 'grey'"
                  variant="outlined"
                  :size="buttonSize"
                  prepend-icon="mdi-delete"
                  @click="confirmDeleteDialog = true"
                >
                  刪除
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
              :disabled="(dialog.id && !hasChanges) || isSubmitting"
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
      title="確認刪除實際花費"
      :message="`確定要刪除「${formatDate(originalData?.invoiceDate)}」的實際花費嗎？ 此操作無法復原。`"
      :expected-name="formatDate(originalData?.invoiceDate)"
      input-label="日期"
      @confirm="deleteExpense"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { debounce } from 'lodash'
import { formatDate, formatNumber } from '@/utils/format'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '實際花費管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.MANAGER]
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => smAndUp.value ? '500' : '100%')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)
const isLoading = ref(false)
const isSearching = ref(false)

// ===== 表單驗證架構 =====
const schema = yup.object({
  invoiceDate: yup.date().required('請選擇日期'),
  theme: yup.string().required('請選擇行銷主題'),
  channel: yup.string().required('請選擇廣告渠道'),
  platform: yup.string().required('請選擇平台'),
  detail: yup.string().required('請選擇細項'),
  expense: yup.number().required('請填寫花費金額').min(0, '金額不能小於0'),
  relatedBudget: yup.string().nullable(),
  note: yup.string()
})

// ===== 表單初始化 =====
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema
})

// ===== 表單欄位 =====
const invoiceDate = useField('invoiceDate')
const theme = useField('theme')
const channel = useField('channel')
const platform = useField('platform')
const detail = useField('detail')
const expense = useField('expense')
const relatedBudget = useField('relatedBudget')
const note = useField('note')

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: ''
})

// ===== 表格設定 =====
const headers = [
  { title: '日期', key: 'invoiceDate', align: 'start', sortable: false },
  { title: '行銷主題', key: 'theme.name', align: 'start', sortable: false },
  { title: '廣告渠道', key: 'channel.name', align: 'start', sortable: false },
  { title: '平台', key: 'platform.name', align: 'start', sortable: false },
  { title: '細項', key: 'detail.name', align: 'start', sortable: false },
  { title: '花費金額', key: 'expense', align: 'end', sortable: false },
  { title: '備註', key: 'note', align: 'start', sortable: false },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

const items = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)
const page = ref(1)

// ===== 選項資料 =====
const themeOptions = ref([])
const channelOptions = ref([])
const platformOptions = ref([])
const detailOptions = ref([])
const budgetOptions = ref([])

// ===== 搜尋相關設定 =====
const searchText = ref('')
const debouncedSearch = debounce(() => {
  loadData()
}, 300)

// ===== 計算屬性 =====
const hasChanges = computed(() => {
  if (!dialog.value.id) return true
  if (!originalData.value) return false
  return JSON.stringify({
    invoiceDate: invoiceDate.value.value,
    theme: theme.value.value,
    channel: channel.value.value,
    platform: platform.value.value,
    detail: detail.value.value,
    expense: expense.value.value,
    relatedBudget: relatedBudget.value.value,
    note: note.value.value
  }) !== JSON.stringify({
    invoiceDate: originalData.value.invoiceDate,
    theme: originalData.value.theme._id,
    channel: originalData.value.channel._id,
    platform: originalData.value.platform._id,
    detail: originalData.value.detail._id,
    expense: originalData.value.expense,
    relatedBudget: originalData.value.relatedBudget?._id,
    note: originalData.value.note
  })
})

// ===== 監聽器 =====
watch(searchText, () => {
  isSearching.value = true
  debouncedSearch()
})

watch([page, itemsPerPage], () => {
  loadData()
})

// ===== 方法 =====
const loadData = async () => {
  try {
    isLoading.value = true
    const params = {
      page: page.value,
      itemsPerPage: itemsPerPage.value
    }

    if (searchText.value) {
      params.search = searchText.value
    }

    const { data } = await apiAuth.get('/marketing/expenses/all', { params })
    if (data.success) {
      items.value = data.result.data
      totalItems.value = data.result.totalItems
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
    isSearching.value = false
  }
}

const loadOptions = async () => {
  try {
    const [
      { data: themeData },
      { data: channelData },
      { data: platformData },
      { data: detailData }
    ] = await Promise.all([
      apiAuth.get('/marketing/categories/options', { params: { type: 0 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 1 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 2 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 3 } })
    ])

    if (themeData.success) {
      themeOptions.value = themeData.result
    }
    if (channelData.success) {
      channelOptions.value = channelData.result
    }
    if (platformData.success) {
      platformOptions.value = platformData.result
    }
    if (detailData.success) {
      detailOptions.value = detailData.result
    }
  } catch (error) {
    handleError(error)
  }
}

const openDialog = () => {
  dialog.value = {
    open: true,
    id: ''
  }
  resetForm()
}

const editItem = (item) => {
  try {
    console.log('編輯項目:', item)
    if (!item || !item._id) {
      console.error('無效的項目:', item)
      return
    }
    
    invoiceDate.value.value = item.invoiceDate
    theme.value.value = item.theme._id
    channel.value.value = item.channel._id
    platform.value.value = item.platform._id
    detail.value.value = item.detail._id
    expense.value.value = item.expense
    relatedBudget.value.value = item.relatedBudget?._id
    note.value.value = item.note
    originalData.value = item
    
    dialog.value = {
      open: true,
      id: item._id
    }
  } catch (error) {
    console.error('編輯項目時發生錯誤:', error)
    handleError(error)
  }
}

const closeDialog = () => {
  try {
    dialog.value = {
      open: false,
      id: ''
    }
    originalData.value = null
    resetForm()
  } catch (error) {
    console.error('關閉對話框時發生錯誤:', error)
  }
}

const submit = handleSubmit(async (values) => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    const submitData = {
      invoiceDate: values.invoiceDate,
      theme: values.theme,
      channel: values.channel,
      platform: values.platform,
      detail: values.detail,
      expense: values.expense,
      relatedBudget: values.relatedBudget,
      note: values.note
    }

    if (dialog.value.id) {
      await apiAuth.patch(`/marketing/expenses/${dialog.value.id}`, submitData)
      createSnackbar({
        text: '實際花費更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      await apiAuth.post('/marketing/expenses', submitData)
      createSnackbar({
        text: '實際花費新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeDialog()
    loadData()
  } catch (error) {
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
})

const deleteExpense = async () => {
  if (!dialog.value.id) return
  
  try {
    await apiAuth.delete(`/marketing/expenses/${dialog.value.id}`)
    createSnackbar({
      text: '實際花費刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    closeDialog()
    loadData()
  } catch (error) {
    handleError(error)
  } finally {
    confirmDeleteDialog.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  debouncedSearch()
}

const handleError = (error) => {
  console.error('Error:', error)
  const errorMessage = error?.response?.data?.message || '操作失敗'
  if (error?.response?.status === 401) {
    user.logout()
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
}

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await Promise.all([
    loadData(),
    loadOptions()
  ])
})
</script>

<style lang="scss" scoped>
.card-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.v-data-table) {
  .v-data-table__tr {
    &:nth-child(odd) {
      background: #f8fcff;
    }
    &:nth-child(even) {
      background: #fffef2;
    }
    &:hover {
      background: #e0e0e0 !important;
    }
  }
}
</style>
