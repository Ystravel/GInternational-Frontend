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
              label="單號"
              variant="outlined"
              density="compact"
              clearable
              :rules="[v => !!v || '請輸入單號']"
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
              label="客戶名稱"
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
              label="地址"
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
              label="統編"
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
              :model-value="modelValue.customerContact"
              label="聯絡人"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('customerContact', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.customerDepartment"
              label="部門"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('customerDepartment', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.customerPhone"
              label="電話"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('customerPhone', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.customerEmail"
              label="郵件"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('customerEmail', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.customerMobile"
              label="手機"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateField('customerMobile', v)"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- 專案資訊 -->
      <v-col
        cols="12"
        class="pa-0 mt-4"
      >
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col cols="12">
                <div class="sub-title text-blue-grey-darken-2">
                  專案資訊
                </div>
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.projectType"
                  label="專案類別"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('projectType', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.projectName"
                  label="專案名稱"
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
                  :model-value="modelValue.workDays"
                  label="工作天"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('workDays', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.specialNote"
                  label="特殊備註 ( 報價項目下方呈現 )"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('specialNote', v)"
                />
              </v-col>
              <v-col cols="12">
                <div class="sub-title text-blue-grey-darken-2">
                  注意事項
                </div>
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.validityDays"
                  label="執行期天數"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('validityDays', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.delayDays"
                  label="延誤天數"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('delayDays', v)"
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- 報價項目 -->
          <v-col cols="12">
            <v-row>
              <v-col cols="12">
                <div class="sub-title text-blue-grey-darken-2 d-flex justify-space-between">
                  報價項目
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
                        <v-text-field
                          :model-value="item.name"
                          label="項目名稱"
                          variant="outlined"
                          density="compact"
                          class="mb-1"
                          clearable
                          @update:model-value="v => updateItem(index, 'name', v)"
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

                      <v-col cols="12">
                        <v-row>
                          <v-col
                            cols="6"
                            md="3"
                            class="pt-2"
                          >
                            <v-text-field
                              :model-value="item.workDays"
                              label="工作天"
                              variant="outlined"
                              density="compact"
                              clearable
                              @update:model-value="v => updateItem(index, 'workDays', v)"
                            />
                          </v-col>
                          <v-col
                            cols="6"
                            md="3"
                            class="pt-2"
                          >
                            <v-text-field
                              :model-value="item.quantity"
                              label="數量"
                              type="number"
                              variant="outlined"
                              density="compact"
                              clearable
                              @update:model-value="v => updateItem(index, 'quantity', Number(v))"
                            />
                          </v-col>
                          <v-col
                            cols="6"
                            md="3"
                            class="pt-2"
                          >
                            <v-text-field
                              :model-value="item.unit"
                              label="單位"
                              variant="outlined"
                              density="compact"
                              clearable
                              @update:model-value="v => updateItem(index, 'unit', v)"
                            />
                          </v-col>
                          <v-col
                            cols="6"
                            md="3"
                            class="pt-2"
                          >
                            <v-text-field
                              :model-value="item.price"
                              label="單價"
                              type="number"
                              variant="outlined"
                              density="compact"
                              clearable
                              @update:model-value="v => updateItem(index, 'price', Number(v))"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>
              </v-col>
            </v-row>
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
    name: '',
    description: '',
    workDays: '',
    quantity: 1,
    unit: '份',
    price: 0
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