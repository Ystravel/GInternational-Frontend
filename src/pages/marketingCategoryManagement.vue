<template>
  <v-container
    max-width="1600"
  >
    <v-row
      class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white"
    >
      <!-- 標題區塊 -->
      <v-col 
        cols="12"
        class="ps-3 pb-3 d-flex align-center"
      >
        <h3
          class="d-inline"
        >
          行銷分類管理
        </h3>
        <div
          style="width: 260px;"
          class="ms-auto d-flex align-center"
        >
          <v-icon
            v-tooltip:start="'可搜尋分類名稱'"
            icon="mdi-information"
            size="small"
            color="deep-purple-darken-4"
            class="me-2"
          />
          <v-text-field
            v-model="quickSearchText"
            label="搜尋"
            append-inner-icon="mdi-magnify"
            :loading="isLoading"
            base-color="#666"
            color="blue-grey-darken-3"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </div>
      </v-col>

      <!-- 表格區塊 -->
      <v-col
        cols="12"
        class="mt-4"
      >
        <v-row>
          <!-- 行銷主題列 -->
          <v-col
            cols="12"
            sm="3"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-8 d-flex align-center justify-space-between">
                行銷主題
                <v-btn
                  v-tooltip:start="'新增行銷主題'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(0)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="marketingThemes.length > 0">
                  <v-list-item
                    v-for="item in marketingThemes"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯行銷主題'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[0] > 1">
                <v-pagination
                  v-model="pages[0]"
                  :length="totalPages[0]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(0, page)"
                />
              </template>
            </v-card>
          </v-col>

          <!-- 廣告渠道列 -->
          <v-col
            cols="12"
            sm="3"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-8 d-flex align-center justify-space-between">
                廣告渠道
                <v-btn
                  v-tooltip:start="'新增廣告渠道'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(1)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="advertisingChannels.length > 0">
                  <v-list-item
                    v-for="item in advertisingChannels"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯廣告渠道'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[1] > 1">
                <v-pagination
                  v-model="pages[1]"
                  :length="totalPages[1]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(1, page)"
                />
              </template>
            </v-card>
          </v-col>

          <!-- 平台列 -->
          <v-col
            cols="12"
            sm="3"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-8 d-flex align-center justify-space-between">
                平台
                <v-btn
                  v-tooltip:start="'新增平台'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(2)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="platforms.length > 0">
                  <v-list-item
                    v-for="item in platforms"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯平台'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[2] > 1">
                <v-pagination
                  v-model="pages[2]"
                  :length="totalPages[2]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(2, page)"
                />
              </template>
            </v-card>
          </v-col>

          <!-- 線別列 -->
          <v-col
            cols="12"
            sm="3"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-8 d-flex align-center justify-space-between">
                線別
                <v-btn
                  v-tooltip:start="'新增線別'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(3)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="details.length > 0">
                  <v-list-item
                    v-for="item in details"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯線別'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[3] > 1">
                <v-pagination
                  v-model="pages[3]"
                  :length="totalPages[3]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(3, page)"
                />
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
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
        <v-card class="rounded-lg px-4 pt-7 pb-6">
          <div class="card-title px-4 pb-2">
            {{ dialog.id ? '編輯分類' : getDialogTitle }}
          </div>

          <v-card-text class="mt-3 pa-3">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="name.value.value"
                  :error-messages="name.errorMessage.value"
                  label="*名稱"
                  type="text"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
              <v-col 
                v-if="dialog.id"
                cols="12"
              >
                <v-text-field
                  v-model="order.value.value"
                  :error-messages="order.errorMessage.value"
                  label="*排序"
                  variant="outlined"
                  density="compact"
                  hint="輸入想要的順序位置，其他項目會自動調整"
                  persistent-hint
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
      title="確認刪除分類"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'>${originalData?.name || ''}</span>」嗎？ 此操作無法復原。`"
      :expected-name="originalData?.name || ''"
      input-label="分類名稱"
      @confirm="deleteCategory"
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

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '行銷分類管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  }
})

// ===== API 與 Store 始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)

// ===== 表單驗證架構 =====
const schema = yup.object({
  name: yup.string().required('請輸入名稱'),
  order: yup.string().required('請輸入排序').min(1, '排序必須大於0')
})

// ===== 表單初始化 =====
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  validateOnMount: false
})

// ===== 表單欄位 =====
const name = useField('name')
const order = useField('order')

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: '',
  type: 0
})

const dialogWidth = computed(() => {
  return smAndUp.value ? '360' : '100%'
})

// ===== 資料狀態 =====
const marketingThemes = ref([])
const advertisingChannels = ref([])
const platforms = ref([])
const details = ref([])

// ===== 計算屬性 =====
const getDialogTitle = computed(() => {
  const titles = ['新增行銷主題', '新增廣告渠道', '新增平台', '新增線別']
  return titles[dialog.value.type]
})

const hasChanges = computed(() => {
  if (!dialog.value.id) return true
  if (!originalData.value) return false
  return originalData.value.name !== name.value.value ||
         originalData.value.order !== parseInt(order.value.value)
})

// ===== 搜尋相關設定 =====
const quickSearchText = ref('')
const isLoading = ref(false)

// 使用 lodash 的 debounce 來優化搜尋
const debouncedSearch = debounce(() => {
  loadData()
}, 300)

// 監聽搜尋文字變化
watch(quickSearchText, () => {
  isLoading.value = true
  // 重置所有分頁到第一頁
  pages.value = {
    0: 1,
    1: 1,
    2: 1,
    3: 1
  }
  debouncedSearch()
})

// ===== 方法 =====
const loadData = async (type = null) => {
  try {
    isLoading.value = true
    // 如果定了類型，只加載該類型的數據
    if (type !== null) {
      const params = {
        [`page${type}`]: pages.value[type]
      }
      
      if (quickSearchText.value) {
        params.quickSearch = quickSearchText.value
      }

      const { data } = await apiAuth.get('/marketing/categories/all', { params })
      if (data.success) {
        // 只更新指定類型的數據
        switch (type) {
          case 0:
            marketingThemes.value = data.result.marketingThemes.data
            totalPages.value[0] = data.result.marketingThemes.totalPages
            break
          case 1:
            advertisingChannels.value = data.result.advertisingChannels.data
            totalPages.value[1] = data.result.advertisingChannels.totalPages
            break
          case 2:
            platforms.value = data.result.platforms.data
            totalPages.value[2] = data.result.platforms.totalPages
            break
          case 3:
            details.value = data.result.details.data
            totalPages.value[3] = data.result.details.totalPages
            break
        }
      }
    } else {
      // 如果沒有指定類型，加載所有數據（初始加載或搜索時）
      const params = {
        page0: pages.value[0],
        page1: pages.value[1],
        page2: pages.value[2],
        page3: pages.value[3]
      }
      
      if (quickSearchText.value) {
        params.quickSearch = quickSearchText.value
      }

      const { data } = await apiAuth.get('/marketing/categories/all', { params })
      if (data.success) {
        marketingThemes.value = data.result.marketingThemes.data
        advertisingChannels.value = data.result.advertisingChannels.data
        platforms.value = data.result.platforms.data
        details.value = data.result.details.data

        totalPages.value = {
          0: data.result.marketingThemes.totalPages,
          1: data.result.advertisingChannels.totalPages,
          2: data.result.platforms.totalPages,
          3: data.result.details.totalPages
        }
      }
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

const openDialog = async (type) => {
  try {
    dialog.value = {
      open: true,
      id: '',
      type
    }
    resetForm()

    // 新增時自動取得最大順序值
    if (!dialog.value.id) {
      const { data } = await apiAuth.get('/marketing/categories/maxOrder', {
        params: { type }
      })
      if (data.success) {
        order.value.value = data.result
      }
    }
  } catch (error) {
    handleError(error)
  }
}

const editItem = (item) => {
  try {
    console.log('編輯項目:', item)
    if (!item || !item._id) {
      console.error('無效的項目:', item)
      return
    }
    
    name.value.value = item.name || ''
    order.value.value = item.order || 1
    originalData.value = { ...item }
    
    dialog.value = {
      open: true,
      id: item._id,
      type: item.type
    }
  } catch (error) {
    console.error('編輯項目時發生錯誤:', error)
    handleError(error)
  }
}

const closeDialog = () => {
  try {
    const currentType = dialog.value.type
    dialog.value = {
      open: false,
      id: '',
      type: currentType
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
      name: values.name,
      type: dialog.value.type
    }

    // 如果是編輯模式，加入排序值
    if (dialog.value.id && values.order) {
      submitData.order = parseInt(values.order)
    }

    if (dialog.value.id) {
      await apiAuth.patch(`/marketing/categories/${dialog.value.id}`, submitData)
      createSnackbar({
        text: '分類更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      await apiAuth.post('/marketing/categories', submitData)
      createSnackbar({
        text: '分類新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeDialog()
    // 只重新加載被修改的類型
    loadData(dialog.value.type)
  } catch (error) {
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
})

const deleteCategory = async () => {
  if (!dialog.value.id) return
  
  try {
    const type = dialog.value.type
    await apiAuth.delete(`/marketing/categories/${dialog.value.id}`)
    createSnackbar({
      text: '分類刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    closeDialog()
    // 只重新加載被刪除的類型
    loadData(type)
  } catch (error) {
    handleError(error)
  } finally {
    confirmDeleteDialog.value = false
  }
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
  await loadData()
})

// 在 script setup 中添加分頁相關的狀態
const pages = ref({
  0: 1, // 行銷主題的當前頁碼
  1: 1, // 廣告渠道的當前頁碼
  2: 1, // 平台的當前頁碼
  3: 1  // 線別的當前頁碼
})

const totalPages = ref({
  0: 1,
  1: 1,
  2: 1,
  3: 1
})

// 添加分頁處理函數
const handlePageChange = (type, newPage) => {
  pages.value[type] = newPage
  loadData(type)
}
</script>

<style lang="scss" scoped>
.marketing-theme-card {
  border: 1px solid #999;
  .v-list-item {
    padding: 6px 32px;
    transition: background 0.2s;
    &:hover {
      background: #e0e0e0 !important;
    }
  }
  .v-list-item:nth-child(odd) {
    background: #f8fcff;
  }
  .v-list-item:nth-child(even) {
    background: #fffef2;
  }
  .text-grey {
    color: #999;
    font-size: 14px;
  }
  :deep(.v-pagination) {
    .v-pagination__item {
      color: #666;
      &--active {
        background: #4c0079 !important;
        color: white;
      }
    }
  }
  .order-number {
    min-width: 16px;
    height: 16px;
    border-radius: 12px;
    background-color: #8E24AA;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    margin-right: 8px;
  }
}
</style>
