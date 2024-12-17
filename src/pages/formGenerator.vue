<template>
  <v-container
    max-width="1920"
    height="100%"
    class="overflow-x-scroll"
  >
    <v-row>
      <v-col
        cols="12"
        md="5"
        class="pe-7 pe-md-2"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 ms-sm-4 mb-4 bg-white">
          <v-col
            cols="12"
            class="pa-0 mb-4"
          >
            <div class="d-flex align-center justify-space-between mb-4 px-4 pt-4">
              <v-row>
                <v-col
                  cols="6"
                  md="12"
                  lg="6"
                  class="d-flex align-center"
                >
                  <h3 class="d-inline me-2">
                    表單產生器
                  </h3>
                  <v-icon
                    v-if="smAndUp"
                    v-tooltip:top="'選擇表單模板後，將出現該表單資料欄位'"
                    icon="mdi-information"
                    size="small"
                    class="me-3"
                    color="deep-purple-darken-4"
                  />
                </v-col>
                <v-col
                  cols="6"
                  md="12"
                  lg="6"
                  class="d-flex align-center justify-end gap-2"
                >
                  <v-btn
                    v-if="user.isAdmin || user.isSuperAdmin"
                    color="deep-purple-darken-4"
                    variant="outlined"
                    prepend-icon="mdi-file-cog"
                    :size="buttonSize"
                    @click="openTemplateDialog"
                  >
                    模板管理
                  </v-btn>
                  <v-btn
                    color="deep-purple-darken-4"
                    variant="outlined"
                    prepend-icon="mdi-history"
                    :size="buttonSize"
                    class="ms-2"
                    @click="openHistoryDialog"
                  >
                    表單紀錄
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-row class="mt-2">
                    <v-col
                      cols="6"
                      class="d-flex align-center ps-3"
                    >
                      <v-select
                        v-model="selectedType"
                        :items="templateTypeOptions"
                        label="選擇表單類型"
                        item-title="title"
                        item-value="value"
                        variant="outlined"
                        density="compact"
                        clearable
                        hide-details
                        @update:model-value="loadFormTemplateOptions"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                      class="d-flex align-center ps-3"
                    >
                      <v-select
                        v-model="selectedTemplate"
                        :items="templateOptions"
                        label="選擇表單模板"
                        item-title="title"
                        item-value="value"
                        variant="outlined"
                        density="compact"
                        clearable
                        hide-details
                        :disabled="!selectedType"
                        :hint="templateOptions.length === 0 ? '無可用的表單模板' : ''"
                        persistent-hint
                        @update:model-value="handleTemplateChange"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </v-col>
          <!-- 表單欄位區域 -->
          <!-- 1. 銳皇專案報價單 -->
          <v-col
            v-if="currentTemplate && selectedTemplate && currentTemplate === templateComponents.RayHuangQuotationTemplate.preview"
            cols="12"
          >
            <v-row>
              <v-col cols="12">
                <!-- 報價單表單 -->
                <v-card elevation="0">
                  <v-card-text>
                    <RayHuangQuotationFormFields
                      ref="formFieldsRef"
                      v-model="formData"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
          <!-- 2. 永信旅遊報價單 -->
          <v-col
            v-if="currentTemplate && selectedTemplate && currentTemplate === templateComponents.YstravelQuotationTemplate.preview"
            cols="12"
          >
            <v-row>
              <v-col cols="12">
                <!-- 報價單表單 -->
                <v-card elevation="0">
                  <v-card-text>
                    <YstravelQuotationFormFields
                      ref="formFieldsRef"
                      v-model="formData"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        clos="12"
        md="7"
        class="ps-md-4"
      >
        <v-row
          class="elevation-4 rounded-lg pt-4 pb-3 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-3 mb-4 bg-white"
          style="min-width: 900px; min-height: 216px;"
        >
          <v-col cols="12">
            <div class="card-title px-6 pt-6 text-grey-darken-3 d-flex justify-space-between">
              《 預覽及下載 》
              <v-btn
                color="pink-darken-2"
                :disabled="!previewReady || isDownloading"
                :loading="isDownloading"
                @click="downloadPDF"
              >
                下載 PDF
              </v-btn>
            </div>
            <v-divider class="mt-8 mx-6" />
            <v-card
              elevation="0"
              min-width="681"
            >
              <v-card-text
                v-if="!previewReady"
                style="font-size: 15px; font-weight: 600;"
                class="text-center text-grey font-weight-medium pa-0 pt-9 pb-3"
              >
                ( 請 先 選 擇 表 單 模 版 )
              </v-card-text>
              <v-card-text v-if="previewReady">
                <component
                  :is="currentTemplate"
                  ref="templateRef"
                  :form-data="formData"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 表單模板管理話框 -->
    <v-dialog
      v-model="templateDialog.open"
      persistent
      max-width="880"
    >
      <v-card class="rounded-lg px-8 py-4">
        <div class="card-title px-2 pb-2 d-flex justify-space-between align-center">
          表單模板管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeTemplateDialog"
          />
        </div>
        <v-card-text class="ps-2 ">
          <v-row class="">
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  現有表單模板
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="6"
                >
                  <v-select
                    v-model="dialogSelectedType"
                    :items="templateTypeOptions"
                    label="表單類型"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    class="mb-1"
                  />
                </v-col>
              </v-row>

              <div class="mb-8">
                <v-chip
                  v-for="template in filteredTemplates"
                  :key="template._id"
                  class="me-4 mb-2 pa-4 pe-1"
                  color="blue-grey-darken-2"
                  label
                >
                  {{ template.name }}
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ms-2"
                        :ripple="false"
                        color="white"
                        v-bind="props"
                      >
                        <v-icon color="cyan-darken-3">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openEditTemplate(template)"
                      >
                        <v-icon
                          icon="mdi-pencil"
                          size="16"
                          color="light-blue-darken-4"
                        />
                        <span
                          style="font-size: 14px;"
                          class="ps-2 text-blue-grey-darken-2"
                        >編輯</span>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        color="red-lighten-1"
                        @click="confirmDeleteTemplate(template)"
                      >
                        <v-icon
                          icon="mdi-delete"
                          size="16"
                          color="red-lighten-1"
                        />
                        <span
                          style="font-size: 14px;"
                          class="ps-2 text-blue-grey-darken-2"
                        >刪除</span>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <v-spacer />
            <v-col
              cols="4"
              class="border rounded-lg px-4 pt-4"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="card-subtitle text-blue-grey-darken-2 mb-4"
                >
                  新增表單模板
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitTemplate">
                <v-row>
                  <v-col
                    cols="12"
                    class="pb-2"
                  >
                    <v-select
                      v-model="templateForm.type"
                      :items="templateTypeOptions"
                      label="表單類型*"
                      item-title="title"
                      item-value="value"
                      :error-messages="templateErrors.type"
                      variant="outlined"
                      clearable
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="templateForm.name"
                      :error-messages="templateErrors.name"
                      label="表單名稱*"
                      variant="outlined"
                      density="compact"
                      clearable
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="templateForm.componentName"
                      :error-messages="templateErrors.componentName"
                      label="組件名稱*"
                      placeholder="例如: RayHuangQuotationTemplate"
                      variant="outlined"
                      density="compact"
                      clearable
                    />
                  </v-col>
                </v-row>
                <v-card-actions class="pa-0 mt-2">
                  <v-spacer />

                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    size="small"
                    :loading="isSubmitting"
                    class="ms-2"
                  >
                    新增
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯表單模板對話框 -->
    <v-dialog
      v-model="editTemplateDialog.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          編輯表單模板
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="submitEditTemplate">
            <v-select
              v-model="editTemplateDialog.type"
              :items="templateTypeOptions"
              label="表單類型*"
              item-title="title"
              item-value="value"
              :error-messages="editTemplateErrors.type"
              variant="outlined"
              density="compact"
              class="mb-4"
              clearable
            />
            <v-text-field
              v-model="editTemplateDialog.name"
              :error-messages="editTemplateErrors.name"
              label="表單名稱*"
              required
              variant="outlined"
              density="compact"
              class="mb-4"
            />
            <v-text-field
              v-model="editTemplateDialog.componentName"
              :error-messages="editTemplateErrors.componentName"
              label="組件名稱*"
              required
              variant="outlined"
              density="compact"
              class="mb-4"
            />
            <v-card-actions class="pa-0 mt-4">
              <v-spacer />
              <v-btn
                color="red-lighten-1"
                variant="outlined"
                @click="closeEditTemplateDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="isSubmitting"
                class="ms-2"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 表單模板刪除確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteTemplateDialog.open"
      title="確認刪除表單模板"
      :message="`確定要刪除表單模板「<span class='text-pink-lighten-1' style='font-weight: 800;'>${deleteTemplateDialog.name}</span>」嗎？此操作無法復原`"
      :expected-name="deleteTemplateDialog.name"
      input-label="表單模板名稱"
      @confirm="deleteTemplate"
    />

    <!-- 表單歷史紀錄對話框 -->
    <v-dialog
      v-model="historyDialog.open"
      max-width="1320"
    >
      <v-card
        class="rounded-lg pa-4 "
        min-height="920"
      >
        <div class="d-flex justify-space-between align-center ps-6 pb-2">
          <div class="card-title">
            表單歷史紀錄
          </div>
          <v-btn
            icon
            color="red-lighten-1"
            variant="plain"
            @click="closeHistoryDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text>
          <!-- 在原有搜尋條件的上方添加快速搜尋 -->

          <div class="border rounded-lg px-4 py-4">
            <v-row>
              <v-col cols="12">
                <!-- 原有的搜尋條件保持不變 -->
                <v-row>
                  <v-col cols="3">
                    <v-select
                      v-model="historySearch.type"
                      :items="templateTypeOptions"
                      label="表單類型"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      clearable
                      @update:model-value="loadTemplateOptions"
                    />
                  </v-col>
                  <v-col
                    cols="3"
                    class="pb-0"
                  >
                    <v-select
                      v-model="historySearch.formTemplate"
                      :items="historyTemplateOptions"
                      label="表單模板"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      clearable
                      :disabled="!historySearch.type"
                    />
                  </v-col>
                  <v-col
                    cols="3"
                    class="pb-0"
                  >
                    <v-date-input
                      v-model="historySearch.date"
                      label="日期區間"
                      variant="outlined"
                      density="compact"
                      prepend-icon
                      clearable
                      multiple="range"
                      :ok-text="'確認'"
                      :cancel-text="'取消'"
                    />
                  </v-col>
                  <v-col 
                    cols="3"
                    class="pb-0"
                  >
                    <v-row>
                      <v-col cols="6">
                        <v-btn
                          color="blue-grey-darken-1"
                          block
                          class="me-3"
                          @click="resetHistorySearch"
                        >
                          <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col cos="6">
                        <v-btn
                          color="cyan-darken-2"
                          block
                          :loading="isSearching"
                          :disabled="isSearching"
                          @click="searchHistory"
                        >
                          搜尋
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- 按鈕 -->
            <v-row class="mt-0" />
          </div>
          <v-row>
            <v-col
              cols="12"
              sm="4"
              lg="3"
              class="ms-auto mt-6 ps-0 d-flex align-center"
            >
              <v-icon
                v-tooltip:start="'可搜尋單號、客戶名稱、專案名稱、項目'"
                size="20"
                color="blue-grey-darken-2"
                class="me-2"
              >
                mdi-information
              </v-icon>
              <v-text-field
                v-model="historyQuickSearch"
                label="快速搜尋"
                append-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
          </v-row>
          <!-- 歷紀錄列表 -->
          <v-table class="rounded-lg mt-6">
            <thead class="bg-blue-grey-darken-2">
              <tr>
                <th style="height: 36px;">
                  表單模板名稱
                </th>
                <th style="height: 36px;">
                  單號
                </th>
                <th style="height: 36px;">
                  客戶名稱
                </th>
                <th style="height: 36px;">
                  專案名稱
                </th>
                <th style="height: 36px;">
                  創建日期
                </th>
                <th style="height: 36px;">
                  創建者
                </th>
                <th
                  class="text-center"
                  style="height: 36px;"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="history in histories"
                :key="history._id"
              >
                <td>{{ history?.formTemplate?.name || '未知模板' }}</td>
                <td>{{ history?.formNumber || '-' }}</td>
                <td>{{ history?.clientName || '-' }}</td>
                <td>{{ history?.projectName || '-' }}</td>
                <td>{{ formatDate(history?.createdAt) }}</td>
                <td>{{ history?.creator?.name || '未知' }} {{ history?.creator?.role === 2 ? `(${history?.creator?.adminId})` : `(${history?.creator?.userId})` }}</td>
                <td class="text-center">
                  <v-btn
                    icon
                    variant="plain"
                    color="teal-lighten-1"
                    class="me-2"
                    @click="downloadHistoryPDF(history)"
                  >
                    <v-icon>mdi-file-pdf-box</v-icon>
                  </v-btn>
                  <template
                    v-if="(() => {
                      const currentId = user.isAdmin ? user.adminId : user.userId
                      const creatorId = history.creator?.role === 2 ? history.creator?.adminId : history.creator?.userId
                      return creatorId === currentId
                    })()"
                  >
                    <v-btn
                      icon
                      variant="plain"
                      color="red-lighten-1"
                      :loading="deletingFormId === history._id"
                      :disabled="deletingFormId === history._id"
                      @click="deleteHistory(history)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </td>
              </tr>
              <tr v-if="!histories.length">
                <td
                  colspan="7"
                  class="text-center"
                >
                  沒有資料
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- 添加分頁控制 -->
          <div class="d-flex justify-center mt-4">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              size="32"
              rounded="circle"
              @update:model-value="handlePageChange"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 表單歷史紀錄確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmDeleteDialog.open"
      title="確認刪除表單"
      :message="`確定要刪除表單「${confirmDeleteDialog.templateName} ${confirmDeleteDialog.formNumber}」嗎？此操作無法恢復。`"
      @confirm="confirmDelete"
    />

    <!-- 表單歷史紀錄確認下載 PDF 檔對話框 -->
    <v-dialog
      v-model="confirmDownloadDialog.open"
      max-width="340"
    >
      <v-card class="rounded-lg pa-4">
        <div class="card-title ps-3 py-3">
          確認下載
        </div>
        <v-card-text class="ps-3 pb-2 ">
          確定要下載 「{{ confirmDownloadDialog.templateName }} {{ confirmDownloadDialog.formNumber }}」 的 PDF 檔嗎？
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn
            color="red-lighten-1"
            variant="outlined"
            size="small"
            @click="confirmDownloadDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="isDownloading"
            class="ms-2"
            size="small"
            @click="confirmDownloadPDF"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onMounted } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'
import html2pdf from 'html2pdf.js'
import UserRole from '@/enums/UserRole'
import { definePage } from 'vue-router/auto'
import { useUserStore } from '@/stores/user'
import { useDisplay } from 'vuetify'
import RayHuangQuotationTemplate from '@/components/templates/RayHuangQuotationTemplate/index.vue'
import RayHuangQuotationFormFields from '@/components/templates/RayHuangQuotationTemplate/RayHuangQuotationFormFields.vue'
import { quotationSchema as rayHuangQuotationSchema } from '@/components/templates/RayHuangQuotationTemplate/schema'
import YstravelQuotationTemplate from '@/components/templates/YstravelQuotationTemplate/index.vue'
import YstravelQuotationFormFields from '@/components/templates/YstravelQuotationTemplate/YstravelQuotationFormFields.vue'
import { quotationSchema as ystravelQuotationSchema } from '@/components/templates/YstravelQuotationTemplate/schema'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import { debounce } from 'lodash'

definePage({
  meta: {
    title: '表單產生器 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  }
})

const { smAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()

// 基本響應式變數
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const selectedTemplate = ref(null)
const selectedType = ref(null)
const templateOptions = ref([])
const templateRef = ref(null)
const formFieldsRef = ref(null)
const deletingFormId = ref('')

// 模板相關
const currentTemplate = shallowRef(null)
const previewReady = ref(false)

// 模板組映射
const templateComponents = {
  RayHuangQuotationTemplate: {
    preview: RayHuangQuotationTemplate,
    fields: RayHuangQuotationFormFields,
    schema: rayHuangQuotationSchema
  },
  YstravelQuotationTemplate: {
    preview: YstravelQuotationTemplate,
    fields: YstravelQuotationFormFields,
    schema: ystravelQuotationSchema
  }
}

// 表單類型選項
const templateTypeOptions = [
  { title: '報價單', value: 'quotation' }
  // { title: '請購單', value: 'purchase' },
  // { title: '請假單', value: 'leave' }
]

// 表單資料
const formData = ref({})

// 重置表單資料
const resetFormData = (templateType) => {
  switch (templateType) {
    case 'RayHuangQuotationTemplate':
      formData.value = {
        quotationNumber: '',
        date: new Date(),
        customerName: '',
        customerAddress: '',
        customerTaxId: '',
        customerContact: '',
        department: '',
        customerPhone: '',
        customerEmail: '',
        customerMobile: '',
        projectType: '',
        projectName: '',
        workDays: '',
        specialNote: '',
        validityDays: '',
        delayDays: '',
        items: [
          {
            name: '',
            description: '',
            workDays: '',
            quantity: 1,
            unit: '份',
            price: ''
          }
        ]
      }
      break
    
    case 'YstravelQuotationTemplate':
      formData.value = {
        quotationNumber: '',
        date: new Date(),
        
        // 客戶資訊
        customerName: '',
        customerAddress: '',
        customerTaxId: '',
        contactPerson: '',
        position: '',
        officePhone: '',
        fax: '',
        mobile: '',
        
        // 旅遊資訊
        projectName: '',
        destination: '',
        departureDate: new Date(),
        returnDate: new Date(),
        numberOfPeople: 1,
        
        // 報價明細
        items: [
          {
            category: '',
            description: '',
            unitPrice: 0,
            quantity: 1,
            unit: '人',
            remark: ''
          }
        ],
        
        // 備註
        cancellationPolicy: '',
        validityPeriod: 7
      }
      break
    
    default:
      formData.value = {}
  }
}

// 表單模板管理相關
const templateDialog = ref({
  open: false
})

const editTemplateDialog = ref({
  open: false,
  id: '',
  name: '',
  type: '',
  componentName: ''
})

const deleteTemplateDialog = ref({
  open: false,
  id: '',
  name: ''
})

const templateForm = ref({
  name: '',
  type: '',
  componentName: ''
})

const templateErrors = ref({
  type: '',
  name: '',
  componentName: ''
})

const editTemplateErrors = ref({
  name: '',
  type: '',
  componentName: ''
})

const isSubmitting = ref(false)
const formTemplates = ref([])

// 添加新的響應式變數
const dialogSelectedType = ref(null)

// 修改 filteredTemplates 計算屬性
const filteredTemplates = computed(() => {
  if (!dialogSelectedType.value) return formTemplates.value

  return formTemplates.value.filter(template => {
    return template.type === dialogSelectedType.value
  })
})

// 修改 handleTemplateChange 方法
const handleTemplateChange = async (templateId) => {
  if (!templateId) {
    currentTemplate.value = null
    previewReady.value = false
    formData.value = {}
    return
  }

  try {
    // 先設置 previewReady 為 false，避免在載入過程中顯示不完整的資料
    previewReady.value = false
    
    // 獲取模板資訊
    const { data } = await apiAuth.get(`/formTemplates/${templateId}`)
    if (data.success) {
      const template = data.result
      console.log('選擇的模板:', template)
      const components = templateComponents[template.componentName]
      if (components) {
        // 先設置新的 formData，再設置模板
        formData.value = { ...components.schema }
        currentTemplate.value = components.preview

        // 獲取下一個單號
        try {
          switch (template.componentName) {
            case 'RayHuangQuotationTemplate': {
              // 獲取銳皇報價單的下一個單號
              const response = await apiAuth.get('/forms/ray-huang-quotation/next-number', {params: {templateId}})
              if (response.data.success) {
                formData.value.quotationNumber = response.data.result
              }
              break
            }
            case 'YstravelQuotationTemplate': {
              // 獲取永信旅遊報價單的下一個單號
              const response = await apiAuth.get('/forms/ystravel-quotation/next-number', {params: {templateId}})
              if (response.data.success) {
                formData.value.quotationNumber = response.data.result
              }
              break
            }
            // 可以在這裡添加其他模板的單號生成邏輯
            default:
              console.error('未知的模板類型:', template.componentName)
              createSnackbar({
                text: '無法生成單號：未知的模板類型',
                snackbarProps: { color: 'red-lighten-1' }
              })
          }
          // 最後再設置 previewReady
          previewReady.value = true
        } catch (error) {
          console.error('取得單號失敗:', error)
          createSnackbar({
            text: '取得單號失敗',
            snackbarProps: { color: 'red-lighten-1' }
          })
          // 即使取得單號失敗，仍然顯示表單
          previewReady.value = true
        }
      } else {
        console.error('找不到對應的組件:', template.componentName)
        currentTemplate.value = null
        formData.value = {}
        previewReady.value = false
        createSnackbar({
          text: '找不到對應的組件',
          snackbarProps: { color: 'red-lighten-1' }
        })
      }
    }
  } catch (error) {
    console.error('載入模板失敗:', error)
    currentTemplate.value = null
    formData.value = {}
    previewReady.value = false
    createSnackbar({
      text: '載入模板失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 添加新的狀態
const isSearching = ref(false)
const isDownloading = ref(false)

// 添加分頁相關的響應式變數
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

// 添加新的響應式變數
const historyQuickSearch = ref('')

const handlePageChange = (newPage) => {
  currentPage.value = newPage
  searchHistory()
}

// 修改 searchHistory 方法，整合快速搜尋
const searchHistory = async () => {
  if (isSearching.value) return
  isSearching.value = true

  try {
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
      sort: 'createdAt',
      order: 'desc'
    }

    // 添加快速搜尋參數
    if (historyQuickSearch.value) {
      params.quickSearch = historyQuickSearch.value
    }

    // 添加原有的搜尋條件
    if (historySearch.value.type) {
      params.type = historySearch.value.type
    }
    if (historySearch.value.formTemplate) {
      params.formTemplate = historySearch.value.formTemplate
    }
    if (historySearch.value.date?.length) {
      params.date = historySearch.value.date
    }

    const { data } = await apiAuth.get('/forms', { params })
    if (data.success) {
      histories.value = data.result.data
      totalItems.value = data.result.totalItems
      currentPage.value = data.result.currentPage
    }
  } catch (error) {
    console.error('搜尋失敗:', error)
    createSnackbar({
      text: '載入歷史紀錄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSearching.value = false
  }
}

// 添加防抖的快速搜尋處理
const debouncedHistorySearch = debounce(() => {
  currentPage.value = 1
  searchHistory()
}, 300)

// 監聽快速搜尋的變化
watch(historyQuickSearch, () => {
  debouncedHistorySearch()
})

// 修改重置搜尋方法，加入快速搜尋的重置
const resetHistorySearch = async () => {
  historySearch.value = {
    type: '',
    formTemplate: '',
    date: []
  }
  historyQuickSearch.value = '' // 重置快速搜尋
  historyTemplateOptions.value = []
  currentPage.value = 1
  await searchHistory()
}

// 修改 downloadPDF 方法
const downloadPDF = async () => {
  if (isDownloading.value) return

  // 直接在這裡進行表單驗證
  const isValid = await formFieldsRef.value?.validate()
  if (!isValid) {
    createSnackbar({
      text: '請填寫必填欄位',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  isDownloading.value = true
  try {
    const element = templateRef.value?.$el
    if (!element) return

    // 獲取當前選擇的表單模板名稱
    const currentTemplate = formTemplates.value.find(t => t._id === selectedTemplate.value)
    if (!currentTemplate) {
      throw new Error('找不到表單模板')
    }
    const templateName = currentTemplate.name

    // 1. 生成 PDF
    console.log('開始生成 PDF')
    const pdfBlob = await generatePDF(element, templateName)
    console.log('PDF 生成成功:', pdfBlob)

    // 2. 上傳 PDF
    const formDataForUpload = new FormData()
    formDataForUpload.append('pdf', new File([pdfBlob], 'document.pdf', { type: 'application/pdf' }))
    const { data: uploadData } = await apiAuth.post('/forms/upload/pdf', formDataForUpload)

    // 3. 儲存到資料庫
    try {
      let formDataToSave = {
        formNumber: formData.value.quotationNumber,
        formTemplate: selectedTemplate.value,
        pdfUrl: uploadData.result.url,
        formData: {}
      }

      // 根據不同的表單類型，使用對應的資料結構
      const template = formTemplates.value.find(t => t._id === selectedTemplate.value)
      if (template) {
        switch (template.componentName) {
          case 'RayHuangQuotationTemplate':
            formDataToSave.formData = {
              // 基本資訊
              date: formData.value.date,
              // 客戶資訊
              customerName: formData.value.customerName,
              customerAddress: formData.value.customerAddress,
              customerTaxId: formData.value.customerTaxId,
              customerContact: formData.value.customerContact,
              customerDepartment: formData.value.customerDepartment,
              customerPhone: formData.value.customerPhone,
              customerEmail: formData.value.customerEmail,
              customerMobile: formData.value.customerMobile,
              
              // 專案資訊
              projectType: formData.value.projectType,
              projectName: formData.value.projectName,
              workDays: formData.value.workDays,
              specialNote: formData.value.specialNote,
              validityDays: formData.value.validityDays,
              delayDays: formData.value.delayDays,
              
              // 報價項目
              items: formData.value.items.map(item => ({
                name: item.name,
                description: item.description,
                workDays: item.workDays,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price
              }))
            }
            break
          
          case 'YstravelQuotationTemplate':
            formDataToSave.formData = {
              // 基本資訊
              date: formData.value.date,
              
              // 客戶資訊
              customerName: formData.value.customerName,
              customerAddress: formData.value.customerAddress,
              customerTaxId: formData.value.customerTaxId,
              contactPerson: formData.value.contactPerson,
              position: formData.value.position,
              officePhone: formData.value.officePhone,
              fax: formData.value.fax,
              mobile: formData.value.mobile,
              
              // 旅遊資訊
              projectName: formData.value.projectName,
              destination: formData.value.destination,
              departureDate: formData.value.departureDate,
              returnDate: formData.value.returnDate,
              numberOfPeople: formData.value.numberOfPeople,
              
              // 報價明細
              items: formData.value.items.map(item => ({
                category: item.category,
                description: item.description,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                unit: item.unit,
                remark: item.remark
              })),
              
              // 備註
              cancellationPolicy: formData.value.cancellationPolicy,
              validityPeriod: formData.value.validityPeriod
            }
            break
            
          default:
            console.error('未知的模板類型:', template.componentName)
            throw new Error('未知的模板類型')
        }
      }

      const { data } = await apiAuth.post('/forms', formDataToSave)

      if (data.success) {
        createSnackbar({
          text: 'PDF 下載並儲存成功',
          snackbarProps: {
            color: 'teal-lighten-1'
          }
        })

        // 4. 下載 PDF
        const link = document.createElement('a')
        link.href = URL.createObjectURL(pdfBlob)
        link.download = `${templateName}_${formData.value.quotationNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      if (error.response?.status === 409) {
        createSnackbar({
          text: '單號重複，請重新取得單號',
          snackbarProps: { color: 'red-lighten-1' }
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('PDF 處理失敗，詳細錯誤:', error)
    console.error('錯誤回應:', error.response?.data)
    createSnackbar({
      text: error.response?.data?.message || 'PDF 處理失敗',
      snackbarProps: {
        color: 'red-lighten-1'
      }
    })
  } finally {
    isDownloading.value = false
  }
}

// API 相關方法
const loadTemplates = async () => {
  try {
    const { data } = await apiAuth.get('/formTemplates/all')
    if (data.success) {
      formTemplates.value = data.result.data
      templateOptions.value = data.result.data.map(template => ({
        title: template.name,
        value: template._id
      }))

      // 如果沒有模板，顯示提示訊息
      if (templateOptions.value.length === 0) {
        createSnackbar({
          text: '目前沒有任何表單模板',
          snackbarProps: {
            color: 'warning'
          }
        })
      }
    }
  } catch (error) {
    console.error('載入表單模板失敗:', error)
    createSnackbar({
      text: '載入表單模板失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    // 確保無論如何都清空 loading 狀態
    templateOptions.value = templateOptions.value || []
  }
}

const loadFormTemplateOptions = async () => {
  if (!selectedType.value) {
    templateOptions.value = []
    selectedTemplate.value = null
    return
  }

  try {
    const params = { type: selectedType.value }
    const { data } = await apiAuth.get('/formTemplates/search', { params })
    if (data.success) {
      templateOptions.value = data.result.map(template => ({
        title: template.name,
        value: template._id
      }))
    }
  } catch (error) {
    console.error('載入模板選項失敗:', error)
    createSnackbar({
      text: '載入模板選項失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 表單模板管理相關方法
const openTemplateDialog = async () => {
  try {
    templateDialog.value.open = true
    // 重置分頁
    templateCurrentPage.value = 1
    // 重置選擇
    dialogSelectedType.value = null
    // 重置表單
    templateForm.value = {
      name: '',
      type: '',
      componentName: ''
    }
    templateErrors.value = {
      type: '',
      name: '',
      componentName: ''
    }

    // 載入第一頁資料
    await loadDialogTemplates()
  } catch (error) {
    console.error('開啟模板管理對話框失敗:', error)
    createSnackbar({
      text: '載入模板資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const closeTemplateDialog = () => {
  templateDialog.value.open = false
  templateForm.value = {
    name: '',
    type: '',
    componentName: ''
  }
  templateErrors.value = {
    type: '',
    name: '',
    componentName: ''
  }
}

const openEditTemplate = (template) => {
  editTemplateDialog.value = {
    open: true,
    id: template._id,
    name: template.name,
    type: template.type,
    componentName: template.componentName
  }
  editTemplateErrors.value = {
    name: '',
    type: '',
    componentName: ''
  }
}

const closeEditTemplateDialog = () => {
  editTemplateDialog.value = {
    open: false,
    id: '',
    name: '',
    type: '',
    componentName: ''
  }
  editTemplateErrors.value = {
    name: '',
    type: '',
    componentName: ''
  }
}

const confirmDeleteTemplate = (template) => {
  deleteTemplateDialog.value = {
    open: true,
    id: template._id,
    name: template.name
  }
}

const submitTemplate = async () => {
  // 重錯誤訊息
  templateErrors.value = {
    type: '',
    name: '',
    componentName: ''
  }

  // 檢查每個欄位
  let hasError = false
  if (!templateForm.value.type) {
    templateErrors.value.type = '請選擇表單類型'
    hasError = true
  }
  if (!templateForm.value.name) {
    templateErrors.value.name = '請輸入表單名稱'
    hasError = true
  }
  if (!templateForm.value.componentName) {
    templateErrors.value.componentName = '請輸入組件名稱'
    hasError = true
  }

  if (hasError) return

  isSubmitting.value = true
  try {
    const { data } = await apiAuth.post('/formTemplates', templateForm.value)
    if (data.success) {
      createSnackbar({
        text: '新增表單模板成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 重置表單
      templateForm.value = {
        name: '',
        type: '',
        componentName: ''
      }
      templateErrors.value = {
        type: '',
        name: '',
        componentName: ''
      }
      await loadDialogTemplates()
    }
  } catch (error) {
    console.error('新增失敗:', error.response?.data)
    // 如果是後端回傳的特定欄位錯誤
    if (error.response?.data?.validationError) {
      const validationErrors = error.response.data.validationError
      Object.keys(validationErrors).forEach(key => {
        templateErrors.value[key] = validationErrors[key].message
      })
    } else {
      // 一般錯誤訊息
      createSnackbar({
        text: error.response?.data?.message || '新增失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

const submitEditTemplate = async () => {
  // 驗證所有必填欄位
  const errors = {
    name: '',
    type: '',
    componentName: ''
  }

  if (!editTemplateDialog.value.name) errors.name = '請輸入表單名稱'
  if (!editTemplateDialog.value.type) errors.type = '請選擇表單類型'
  if (!editTemplateDialog.value.componentName) errors.componentName = '請輸入組件名稱'

  // 如果有任何錯誤
  if (Object.values(errors).some(error => error)) {
    editTemplateErrors.value = errors
    return
  }

  isSubmitting.value = true
  try {
    const { data } = await apiAuth.patch(`/formTemplates/${editTemplateDialog.value.id}`, {
      name: editTemplateDialog.value.name,
      type: editTemplateDialog.value.type,
      componentName: editTemplateDialog.value.componentName
    })

    if (data.success) {
      createSnackbar({
        text: '修改表單模板成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeEditTemplateDialog()
      await loadDialogTemplates()
    }
  } catch (error) {
    editTemplateErrors.value = {
      name: error.response?.data?.message || '修改失敗',
      type: '',
      componentName: ''
    }
  } finally {
    isSubmitting.value = false
  }
}

const deleteTemplate = async () => {
  try {
    const { data } = await apiAuth.delete(`/formTemplates/${deleteTemplateDialog.value.id}`)
    if (data.success) {
      createSnackbar({
        text: '刪除表單模板成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 從本地列表中移除被刪除的模板
      formTemplates.value = formTemplates.value.filter(
        template => template._id !== deleteTemplateDialog.value.id
      )
      // 如果當前選中的模板被刪除，清空選擇
      if (selectedTemplate.value === deleteTemplateDialog.value.id) {
        selectedTemplate.value = null
      }
      // 關閉刪除對話框
      deleteTemplateDialog.value = {
        open: false,
        id: '',
        name: ''
      }
      // 重新載入模板列表
      await loadDialogTemplates()
    }
  } catch (error) {
    let errorMessage = '刪除失敗'
    // 處理特定的錯誤情況
    if (error.response?.status === 409) {
      errorMessage = '此表單模板有表單使用中��無法刪除'
    } else {
      errorMessage = error.response?.data?.message || '刪除失敗'
    }
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 加模板列表頁相關的響應式變數
const templateCurrentPage = ref(1)
const templateItemsPerPage = ref(10)
const templateTotalItems = ref(0)

// 修改 loadDialogTemplates 方法
const loadDialogTemplates = async () => {
  try {
    const params = {
      page: templateCurrentPage.value,
      itemsPerPage: templateItemsPerPage.value
    }

    // 載入所有表單板
    const { data } = await apiAuth.get('/formTemplates/all', { params })
    if (data.success) {
      formTemplates.value = data.result.data
      templateTotalItems.value = data.result.totalItems
      templateCurrentPage.value = data.result.currentPage
    }
  } catch (error) {
    console.error('載入表單模板失敗:', error)
    createSnackbar({
      text: '載入表單模板失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    formTemplates.value = []
  }
}

// 監聽選擇的模板變化
watch(selectedTemplate, async (newVal) => {
  if (newVal) {
    const template = formTemplates.value.find(t => t._id === newVal)
    if (template) {
      resetFormData(template.componentName)
      await handleTemplateChange(newVal)
    }
  } else {
    resetFormData()
    currentTemplate.value = null
    previewReady.value = false
  }
})

// 監聽表單類型變化
watch(selectedType, (newVal) => {
  // 當表單類型改變時，清空表單模板的選擇
  selectedTemplate.value = null
  currentTemplate.value = null
  previewReady.value = false
  formData.value = {}
  
  if (newVal) {
    // 如果有選擇類型，載入對應的模板選項
    loadFormTemplateOptions()
  } else {
    // 如果清空類型，則清空模板選項
    templateOptions.value = []
  }
})

// 監聽表單值的變化
watch(() => templateForm.value.type, (newVal) => {
  if (newVal) {
    templateErrors.value.type = ''
  }
})

watch(() => templateForm.value.name, (newVal) => {
  if (newVal) {
    templateErrors.value.name = ''
  }
})

watch(() => templateForm.value.componentName, (newVal) => {
  if (newVal) {
    templateErrors.value.componentName = ''
  }
})

// 或者使用一個組合的 watch
watch(templateForm, (newVal) => {
  // 類型
  if (newVal.type) {
    templateErrors.value.type = ''
  }
  // 名稱
  if (newVal.name) {
    templateErrors.value.name = ''
  }
  // 組件名稱
  if (newVal.componentName) {
    templateErrors.value.componentName = ''
  }
}, { deep: true })

// 生命週期鉤子
onMounted(async () => {
  await loadTemplates()
})

// 添加 generatePDF 函數
const generatePDF = async (element, templateName) => {
  const style = document.createElement('style')
  style.textContent = `
    @page {
      size: A4;
      margin: 0;
    }
  `
  document.head.appendChild(style)

  const opt = {
    margin: 0,
    filename: `${templateName}_${formData.value.quotationNumber}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: {
      scale: 6,
      useCORS: true,
      letterRendering: true,
      width: 795,
      height: 1123,
      windowWidth: 795,
      windowHeight: 1123
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    }
  }

  try {
    // 使用 html2pdf 生成 PDF 並返回 Blob
    const pdf = await html2pdf().set(opt).from(element).output('blob')
    return pdf
  } catch (error) {
    console.error('PDF 生成失敗:', error)
    throw error
  } finally {
    document.head.removeChild(style)
  }
}

// 歷史紀錄相關
const historyDialog = ref({
  open: false
})

const historySearch = ref({
  type: '',
  formTemplate: '',
  date: []
})

const histories = ref([])

const historyTemplateOptions = ref([])

const loadTemplateOptions = async () => {
  try {
    console.log('開始載入模板選項')
    console.log('當前搜尋條件:', {
      type: historySearch.value.type
    })

    // 清空現有選項
    historyTemplateOptions.value = []
    historySearch.value.formTemplate = ''

    // 只有當類型有選擇時載入模板
    if (historySearch.value.type) {
      const params = {
        type: historySearch.value.type
      }

      console.log('準備發送請求，參數:', params)
      const { data } = await apiAuth.get('/formTemplates/search', { params })
      console.log('收到回應:', data)

      if (data.success) {
        historyTemplateOptions.value = data.result.map(template => ({
          title: template.name,
          value: template._id
        }))
        console.log('處理後的選項:', historyTemplateOptions.value)
      }
    }
  } catch (error) {
    console.error('載入模板選項失敗:', error)
    createSnackbar({
      text: '載入模板選項失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const closeHistoryDialog = () => {
  historyDialog.value.open = false
  resetHistorySearch()
}

// 修改 openHistoryDialog
const openHistoryDialog = async () => {
  try {
    historyDialog.value.open = true
    // 清空所有搜尋條件
    historySearch.value = {
      type: '',
      formTemplate: '',
      date: []
    }
    historyTemplateOptions.value = []
    currentPage.value = 1

    // 入第一頁資料
    await searchHistory()
  } catch (error) {
    console.error('開啟歷史紀錄對話框失敗:', error)
    createSnackbar({
      text: '載入歷史紀錄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const formToDelete = ref(null)
const confirmDeleteDialog = ref({
  open: false,
  templateName: '',
  formNumber: ''
})

const deleteHistory = async (history) => {
  formToDelete.value = history
  confirmDeleteDialog.value = {
    open: true,
    templateName: history.formTemplate?.name || '未知模板',
    formNumber: history.formNumber || ''
  }
}

const confirmDelete = async () => {
  try {
    deletingFormId.value = formToDelete.value._id
    const { data } = await apiAuth.delete(`/forms/${formToDelete.value._id}`)
    if (data.success) {
      createSnackbar({
        text: '刪除歷史紀錄成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await searchHistory()
    }
  } catch (error) {
    createSnackbar({
      text: error.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deletingFormId.value = ''
    formToDelete.value = null
    confirmDeleteDialog.value.open = false
  }
}

// 日期格式化
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 監聽類型變化
watch(
  () => historySearch.value.type,
  () => {
    // 當類型變化時，清空模板選項和選擇的模板
    historySearch.value.formTemplate = ''
    historyTemplateOptions.value = []
  }
)

watch(selectedType, (newVal) => {
  // 當表單類型改變時，清空表單模板的選擇
  selectedTemplate.value = null
  
  if (newVal) {
    // 如果有選擇類型，載入對應的模板選項
    loadFormTemplateOptions()
  } else {
    // 如果清空類型，則清空模板選項
    templateOptions.value = []
  }
})

// 添加下載歷史 PDF 的方法
const downloadHistoryPDF = async (history) => {
  try {
    if (!history.pdfUrl) {
      createSnackbar({
        text: '找不到 PDF 檔案',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 開啟確認對話框
    confirmDownloadDialog.value = {
      open: true,
      templateName: history.formTemplate?.name || '未知模板',
      formNumber: history.formNumber || '',
      url: history.pdfUrl
    }
  } catch (error) {
    console.error('下載 PDF 失敗:', error)
    createSnackbar({
      text: '下載 PDF 失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 確認下載對話框的狀態
const confirmDownloadDialog = ref({
  open: false,
  templateName: '',
  formNumber: ''
})

// 確認下載 PDF
const confirmDownloadPDF = async () => {
  try {
    // 如果是歷史記錄的 PDF 下載
    if (confirmDownloadDialog.value.url) {
      window.open(confirmDownloadDialog.value.url, '_blank')
      createSnackbar({
        text: 'PDF 開啟成功',
        snackbarProps: {
          color: 'teal-lighten-1',
          timeout: 2000
        }
      })
    } else {
      // 如果是新生成的 PDF 下載
      await downloadPDF()
    }
  } catch (error) {
    console.error('PDF 下載失敗:', error)
    createSnackbar({
      text: 'PDF 下載失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    confirmDownloadDialog.value.open = false
  }
}
</script>
<style lang="scss" scoped>
.v-table  {
  :deep(tbody tr:nth-child(odd)) {
    background-color: #f9ffff;
  }
  :deep(tbody tr:nth-child(even)) {
    background-color: #ffffff;
  }
}
</style>
