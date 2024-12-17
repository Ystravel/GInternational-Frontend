<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-row>
      <!-- 基本資訊 -->
      <v-col
        cols="12"
        class="pa-0"
      >
        <v-row>
          <v-col cols="12">
            <div class="sub-title text-blue-grey-darken-2">
              基本資訊
            </div>
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.quotationNumber"
              label="報價單號"
              variant="outlined"
              density="compact"
              clearable
              :rules="[v => !!v || '請輸入報價單號']"
              @update:model-value="v => updateField('quotationNumber', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-date-input
              :model-value="modelValue.date"
              label="報價日期"
              variant="outlined"
              density="compact"
              prepend-icon
              clearable
              @update:model-value="v => updateField('date', v)"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- 客戶資訊 -->
      <v-col
        cols="12"
        class="pa-0 mt-4"
      >
        <v-row>
          <v-col cols="12">
            <div class="sub-title text-blue-grey-darken-2">
              客戶資訊
            </div>
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.customerName"
              label="公司名稱"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('customerName', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.customerAddress"
              label="公司地址"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('customerAddress', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.customerTaxId"
              label="統一編號"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('customerTaxId', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contactPerson"
              label="聯絡人"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('contactPerson', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.position"
              label="職稱"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('position', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.officePhone"
              label="公司電話"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('officePhone', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.fax"
              label="傳真"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('fax', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.mobile"
              label="手機"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('mobile', v)"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- 旅遊資訊 -->
      <v-col
        cols="12"
        class="pa-0 mt-4"
      >
        <v-row>
          <v-col cols="12">
            <div class="sub-title text-blue-grey-darken-2">
              旅遊資訊
            </div>
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.projectName"
              label="行程名稱"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('projectName', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.destination"
              label="目的地"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('destination', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-date-input
              :model-value="modelValue.departureDate"
              label="出發日期"
              variant="outlined"
              density="compact"
              prepend-icon
              clearable
              :rules="[v => !!v || '請選擇出發日期']"
              @update:model-value="v => updateField('departureDate', v ? new Date(v) : null)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-date-input
              :model-value="modelValue.returnDate"
              label="回程日期"
              variant="outlined"
              density="compact"
              prepend-icon
              clearable
              :rules="[v => !!v || '請選擇回程日期']"
              @update:model-value="v => updateField('returnDate', v ? new Date(v) : null)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.numberOfPeople"
              label="人數"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('numberOfPeople', parseInt(v))"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- 報價明細 -->
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <div class="sub-title text-blue-grey-darken-2 d-flex justify-space-between">
              報價明細
              <v-btn
                color="blue-grey-darken-2"
                variant="outlined"
                prepend-icon="mdi-plus"
                size="small"
                @click="addItem"
              >
                新增項目
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12">
            <v-expand-transition group>
              <div
                v-for="(item, index) in modelValue.items"
                :key="index"
                class="mb-4 px-3 border rounded-lg"
              >
                <v-row>
                  <v-col
                    cols="12"
                    class="pb-0"
                  >
                    <div
                      class="d-flex justify-space-between align-center mt-2"
                      style="height: 40px;"
                    >
                      <span class="text-subtitle-2 text-grey-darken-1">項目 {{ index + 1 }}</span>
                      <v-btn
                        v-if="index > 0"
                        icon="mdi-close"
                        color="red-darken-1"
                        size="small"
                        variant="plain"
                        @click="removeItem(index)"
                      />
                    </div>
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="pb-0"
                  >
                    <v-select
                      :model-value="item.category"
                      :items="['機票', '住宿', '餐飲', '交通', '門票', '保險', '其他']"
                      label="費用類別"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateItem(index, 'category', v)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="item.description"
                      label="說明"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateItem(index, 'description', v)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="3"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="item.unitPrice"
                      label="單價"
                      type="number"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateItem(index, 'unitPrice', Number(v))"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="3"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="item.quantity"
                      label="數量"
                      type="number"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateItem(index, 'quantity', Number(v))"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="3"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="item.unit"
                      label="單位"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateItem(index, 'unit', v)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="3"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="item.remark"
                      label="備註"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateItem(index, 'remark', v)"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>
          </v-col>
        </v-row>
      </v-col>

      <!-- 備註資訊 -->
      <v-col
        cols="12"
        class="pa-0 mt-4"
      >
        <v-row>
          <v-col cols="12">
            <div class="sub-title text-blue-grey-darken-2">
              備註資訊
            </div>
          </v-col>

          <v-col
            cols="12"
            class="pb-0"
          >
            <v-textarea
              :model-value="modelValue.cancellationPolicy"
              label="取消政策"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              auto-grow
              rows="3"
              @update:model-value="v => updateField('cancellationPolicy', v)"
            />
          </v-col>

          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.validityPeriod"
              label="報價有效期（天）"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('validityPeriod', parseInt(v))"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const form = ref(null)
const valid = ref(false)

// 更新欄位的方法
const updateField = (field, value) => {
  const newValue = { ...props.modelValue }
  newValue[field] = value
  emit('update:modelValue', newValue)
}

// 更新項目的方法
const updateItem = (index, field, value) => {
  const newItems = [...props.modelValue.items]
  newItems[index] = { ...newItems[index], [field]: value }
  const newValue = { ...props.modelValue, items: newItems }
  emit('update:modelValue', newValue)
}

const validate = async () => {
  return await form.value?.validate()
}

const addItem = () => {
  const newItems = [...props.modelValue.items]
  newItems.push({
    category: '',
    description: '',
    unitPrice: 0,
    quantity: 1,
    unit: '人',
    remark: ''
  })
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

const removeItem = (index) => {
  const newItems = [...props.modelValue.items]
  newItems.splice(index, 1)
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

defineExpose({
  validate
})
</script>

<style scoped>

</style> 