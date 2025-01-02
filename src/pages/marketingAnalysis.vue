<template>
  <v-container
    min-width="2160"
  >
    <!-- 搜尋條件區塊 -->
    <v-row class="elevation-4 rounded-lg py-4 pt-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <v-col cols="12">
        <v-row>
          <v-col cols="1">
            <h3>行銷費用分析</h3>
          </v-col>
          <v-col cols="11">
            <v-row>
              <v-col cols="12">
                <v-row>
                  <!-- 第一行搜尋條件 -->
                  <v-col>
                    <v-select
                      v-model="searchForm.reportType"
                      :items="reportTypeOptions"
                      label="報表類型"
                      variant="outlined"
                      density="compact"
                      :error-messages="reportTypeError"
                      clearable
                      @update:model-value="handleReportTypeChange"
                    />
                  </v-col>
                  <v-col>
                    <v-autocomplete
                      v-model="searchForm.theme"
                      :items="themeOptions"
                      label="行銷主題"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      :error-messages="themeError"
                      clearable
                      @update:model-value="handleThemeChange"
                    />
                  </v-col>
                  <v-col>
                    <v-select
                      v-model="searchForm.year"
                      :items="yearOptions"
                      label="年度"
                      variant="outlined"
                      density="compact"
                      :error-messages="yearError"
                      clearable
                      @update:model-value="handleYearChange"
                    />
                  </v-col>
                  <v-col
                    v-if="searchForm.reportType === 'lineExpense'"
                  >
                    <v-autocomplete
                      v-model="searchForm.line"
                      :items="lineOptions"
                      label="線別"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      :error-messages="lineError"
                      clearable
                      multiple
                      select-all
                      @update:model-value="handleLineChange"
                    >
                      <template #prepend-item>
                        <v-list-item
                          title="全選"
                          color="purple-lighten-1"
                          prepend-icon="mdi-checkbox-multiple-marked"
                          :active="searchForm.line.length === lineOptions.length"
                          @click="selectAllLines"
                        />
                        <v-divider class="mt-2" />
                      </template>
                    </v-autocomplete>
                  </v-col>
                  <v-col v-if="searchForm.reportType === 'lineExpense'">
                    <v-select
                      v-model="searchForm.month"
                      :items="monthOptions"
                      item-title="name"
                      item-value="value"
                      label="月份"
                      variant="outlined"
                      density="compact"
                      :error-messages="monthError"
                      clearable
                      @update:model-value="handleMonthChange"
                    />
                  </v-col>
                  <v-col cols="2">
                    <v-btn
                      color="purple-darken-2"
                      :loading="isLoading"
                      block
                      @click="generateReport"
                    >
                      查看報表
                    </v-btn>
                  </v-col>
                  <v-col cols="2">
                    <v-btn
                      color="pink-darken-2"
                      :loading="isExporting"
                      block
                      @click="openDownloadDialog"
                    >
                      批次下載報表
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 報表呈現區塊 -->
    <v-row 
      v-if="showReport"
      class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white"
    >
      <v-col cols="12">
        <div class="d-flex justify-end align-center mb-4 sticky-buttons">
          <div>
            <v-btn
              color="teal-darken-1"
              class="me-2"
              prepend-icon="mdi-microsoft-excel"
              :loading="isExporting"
              @click="exportToExcel"
            >
              匯出 EXCEL
            </v-btn>
            <v-btn
              color="red-darken-1"
              prepend-icon="mdi-file-pdf-box"
              :loading="isExporting"
              @click="exportToPDF"
            >
              匯出 PDF
            </v-btn>
          </div>
        </div>

        <!-- 行銷預算與實際支出比較表，因要滑動時，標題會被蓋住，所以需要獨立出來 -->
        <div
          v-if="searchForm.reportType === 'comparison'"
          class="budget-table-title"
        >
          <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
          <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
          {{ reportTypeOptions.find(option => option.value === 'comparison')?.title || '' }}
        </div>

        <div class="table-container">
          <!-- 年度行銷預算表 -->
          <div
            v-if="searchForm.reportType === 'budget'" 
            class="budget-table-title "
          >
            <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
            <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
            {{ reportTypeOptions.find(option => option.value === searchForm.reportType)?.title || '' }}
          </div>

          <table
            v-if="searchForm.reportType === 'budget'"
            class="budget-table"
          >
            <thead>
              <tr class="header-row">
                <th
                  rowspan="1"
                  class="header-cell"
                >
                  廣告渠道
                </th>
                <th
                  rowspan="1"
                  class="header-cell"
                >
                  平台
                </th>
                <th class="header-cell">
                  JAN
                </th>
                <th class="header-cell">
                  FEB
                </th>
                <th class="header-cell">
                  MAR
                </th>
                <th class="header-cell-quarter">
                  Q1
                </th>
                <th class="header-cell">
                  APR
                </th>
                <th class="header-cell">
                  MAY
                </th>
                <th class="header-cell">
                  JUN
                </th>
                <th class="header-cell-quarter">
                  Q2
                </th>
                <th class="header-cell">
                  JUL
                </th>
                <th class="header-cell">
                  AUG
                </th>
                <th class="header-cell">
                  SEP
                </th>
                <th class="header-cell-quarter">
                  Q3
                </th>
                <th class="header-cell">
                  OCT
                </th>
                <th class="header-cell">
                  NOV
                </th>
                <th class="header-cell">
                  DEC
                </th>
                <th class="header-cell-quarter">
                  Q4
                </th>
                <th class="header-cell">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="(channel, channelIndex) in reportData"
                :key="channelIndex"
              >
                <template
                  v-for="(platform, platformIndex) in channel.platforms"
                  :key="`${channelIndex}-${platformIndex}`"
                >
                  <tr :class="{ 'row-odd': channelIndex % 2 === 0 }">
                    <td
                      v-if="platformIndex === 0"
                      :rowspan="channel.platforms.length"
                      class="channel-col"
                    >
                      {{ channel.channelName }}
                    </td>
                    <td class="platform-col">
                      {{ platform.platformName }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.JAN) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.FEB) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.MAR) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.budget, 1)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.APR) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.MAY) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.JUN) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.budget, 2)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.JUL) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.AUG) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.SEP) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.budget, 3)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.OCT) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.NOV) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.DEC) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.budget, 4)) }}
                    </td>
                    <td 
                      class="total-col"
                      style="width: 180px"
                    >
                      {{ formatMonthValue(getPlatformTotal(platform.budget)) }}
                    </td>
                  </tr>
                </template>
              </template>
              <!-- 月度總計列 -->
              <tr class="monthly-total-row">
                <td colspan="2">
                  月度總計
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JAN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('FEB')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAR')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(1)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('APR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAY')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUN')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(2)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUL')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('AUG')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('SEP')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(3)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('OCT')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('NOV')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('DEC')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(4)) }}
                </td>
                <td 
                  class="total-col highlight-total"
                  style="width: 180px"
                >
                  {{ formatMonthValue(getGrandTotal()) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 行銷實際支出表 -->
          <div
            v-if="searchForm.reportType === 'expense'"
            class="budget-table-title "
          >
            <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
            <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
            {{ reportTypeOptions.find(option => option.value === 'expense')?.title || '' }}
          </div>

          <table
            v-if="searchForm.reportType === 'expense'"
            class="budget-table"
          >
            <thead>
              <tr class="header-row">
                <th
                  rowspan="1"
                  class="header-cell"
                >
                  廣告渠道
                </th>
                <th
                  rowspan="1"
                  class="header-cell"
                >
                  平台
                </th>
                <th class="header-cell">
                  JAN
                </th>
                <th class="header-cell">
                  FEB
                </th>
                <th class="header-cell">
                  MAR
                </th>
                <th class="header-cell-quarter">
                  Q1
                </th>
                <th class="header-cell">
                  APR
                </th>
                <th class="header-cell">
                  MAY
                </th>
                <th class="header-cell">
                  JUN
                </th>
                <th class="header-cell-quarter">
                  Q2
                </th>
                <th class="header-cell">
                  JUL
                </th>
                <th class="header-cell">
                  AUG
                </th>
                <th class="header-cell">
                  SEP
                </th>
                <th class="header-cell-quarter">
                  Q3
                </th>
                <th class="header-cell">
                  OCT
                </th>
                <th class="header-cell">
                  NOV
                </th>
                <th class="header-cell">
                  DEC
                </th>
                <th class="header-cell-quarter">
                  Q4
                </th>
                <th class="header-cell">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="(channel, channelIndex) in reportData"
                :key="channelIndex"
              >
                <template
                  v-for="(platform, platformIndex) in channel.platforms"
                  :key="`${channelIndex}-${platformIndex}`"
                >
                  <tr :class="{ 'row-odd': channelIndex % 2 === 0 }">
                    <td
                      v-if="platformIndex === 0"
                      :rowspan="channel.platforms.length"
                      class="channel-col"
                    >
                      {{ channel.channelName }}
                    </td>
                    <td class="platform-col">
                      {{ platform.platformName }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.JAN) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.FEB) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.MAR) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.expense, 1)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.APR) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.MAY) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.JUN) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.expense, 2)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.JUL) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.AUG) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.SEP) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.expense, 3)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.OCT) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.NOV) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.DEC) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.expense, 4)) }}
                    </td>
                    <td class="total-col">
                      {{ formatMonthValue(getPlatformTotal(platform.expense)) }}
                    </td>
                  </tr>
                </template>
              </template>
              <!-- 月度總計列 -->
              <tr class="monthly-total-row">
                <td colspan="2">
                  月度總計
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JAN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('FEB')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAR')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(1)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('APR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAY')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUN')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(2)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUL')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('AUG')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('SEP')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(3)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('OCT')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('NOV')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('DEC')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(4)) }}
                </td>
                <td class="total-col highlight-total">
                  {{ formatMonthValue(getGrandTotal()) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 行銷預算與實際支出比較表 -->
          

          <table
            v-if="searchForm.reportType === 'comparison'"
            class="budget-table comparison-table"
          >
            <thead>
              <tr class="header-row">
                <th
                  rowspan="2"
                  class="header-cell"
                >
                  廣告渠道
                </th>
                <th
                  rowspan="2"
                  class="header-cell"
                >
                  平台
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  JAN
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  FEB
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  MAR
                </th>
                <th
                  colspan="3"
                  class="header-cell-quarter"
                >
                  Q1
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  APR
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  MAY
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  JUN
                </th>
                <th
                  colspan="3"
                  class="header-cell-quarter"
                >
                  Q2
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  JUL
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  AUG
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  SEP
                </th>
                <th
                  colspan="3"
                  class="header-cell-quarter"
                >
                  Q3
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  OCT
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  NOV
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  DEC
                </th>
                <th
                  colspan="3"
                  class="header-cell-quarter"
                >
                  Q4
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  Total
                </th>
              </tr>
              <tr class="header-row">
                <!-- JAN -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- FEB -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- MAR -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- Q1 -->
                <th class="sub-header-cell-quarter">
                  預算
                </th>
                <th class="sub-header-cell-quarter">
                  實際
                </th>
                <th class="sub-header-cell-quarter">
                  差異
                </th>
                <!-- APR -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- MAY -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- JUN -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- Q2 -->
                <th class="sub-header-cell-quarter">
                  預算
                </th>
                <th class="sub-header-cell-quarter">
                  實際
                </th>
                <th class="sub-header-cell-quarter">
                  差異
                </th>
                <!-- JUL -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- AUG -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- SEP -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- Q3 -->
                <th class="sub-header-cell-quarter">
                  預算
                </th>
                <th class="sub-header-cell-quarter">
                  實際
                </th>
                <th class="sub-header-cell-quarter">
                  差異
                </th>
                <!-- OCT -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- NOV -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- DEC -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- Q4 -->
                <th class="sub-header-cell-quarter">
                  預算
                </th>
                <th class="sub-header-cell-quarter">
                  實際
                </th>
                <th class="sub-header-cell-quarter">
                  差異
                </th>
                <!-- Total -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="(channel, channelIndex) in reportData"
                :key="channelIndex"
              >
                <template
                  v-for="(platform, platformIndex) in channel.platforms"
                  :key="`${channelIndex}-${platformIndex}`"
                >
                  <tr :class="{ 'row-odd': channelIndex % 2 === 0 }">
                    <td
                      v-if="platformIndex === 0"
                      :rowspan="channel.platforms.length"
                      class="channel-col"
                    >
                      {{ channel.channelName }}
                    </td>
                    <td class="platform-col">
                      {{ platform.platformName }}
                    </td>
                    
                    <!-- JAN -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.JAN || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.JAN || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.JAN)">
                      {{ formatMonthValue(platform.difference.JAN) }}
                    </td>

                    <!-- FEB -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.FEB || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.FEB || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.FEB)">
                      {{ formatMonthValue(platform.difference.FEB) }}
                    </td>

                    <!-- MAR -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.MAR || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.MAR || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.MAR)">
                      {{ formatMonthValue(platform.difference.MAR) }}
                    </td>

                    <!-- Q1 -->
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyBudget(platform, 1)) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyExpense(platform, 1)) }}
                    </td>
                    <td :class="['quarter-col', getDifferenceClass(getPlatformQuarterlyDifference(platform, 1))]">
                      {{ formatQuarterValue(getPlatformQuarterlyDifference(platform, 1)) }}
                    </td>

                    <!-- APR -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.APR || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.APR || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.APR)">
                      {{ formatMonthValue(platform.difference.APR) }}
                    </td>

                    <!-- MAY -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.MAY || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.MAY || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.MAY)">
                      {{ formatMonthValue(platform.difference.MAY) }}
                    </td>

                    <!-- JUN -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.JUN || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.JUN || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.JUN)">
                      {{ formatMonthValue(platform.difference.JUN) }}
                    </td>

                    <!-- Q2 -->
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyBudget(platform, 2)) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyExpense(platform, 2)) }}
                    </td>
                    <td :class="['quarter-col', getDifferenceClass(getPlatformQuarterlyDifference(platform, 2))]">
                      {{ formatQuarterValue(getPlatformQuarterlyDifference(platform, 2)) }}
                    </td>

                    <!-- JUL -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.JUL || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.JUL || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.JUL)">
                      {{ formatMonthValue(platform.difference.JUL) }}
                    </td>

                    <!-- AUG -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.AUG || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.AUG || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.AUG)">
                      {{ formatMonthValue(platform.difference.AUG) }}
                    </td>

                    <!-- SEP -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.SEP || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.SEP || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.SEP)">
                      {{ formatMonthValue(platform.difference.SEP) }}
                    </td>

                    <!-- Q3 -->
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyBudget(platform, 3)) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyExpense(platform, 3)) }}
                    </td>
                    <td :class="['quarter-col', getDifferenceClass(getPlatformQuarterlyDifference(platform, 3))]">
                      {{ formatQuarterValue(getPlatformQuarterlyDifference(platform, 3)) }}
                    </td>

                    <!-- OCT -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.OCT || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.OCT || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.OCT)">
                      {{ formatMonthValue(platform.difference.OCT) }}
                    </td>

                    <!-- NOV -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.NOV || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.NOV || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.NOV)">
                      {{ formatMonthValue(platform.difference.NOV) }}
                    </td>

                    <!-- DEC -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.DEC || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.DEC || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.DEC)">
                      {{ formatMonthValue(platform.difference.DEC) }}
                    </td>

                    <!-- Q4 -->
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyBudget(platform, 4)) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyExpense(platform, 4)) }}
                    </td>
                    <td :class="['quarter-col', getDifferenceClass(getPlatformQuarterlyDifference(platform, 4))]">
                      {{ formatQuarterValue(getPlatformQuarterlyDifference(platform, 4)) }}
                    </td>

                    <!-- Total -->
                    <td class="total-col">
                      {{ formatMonthValue(getPlatformBudgetTotal(platform.budget)) }}
                    </td>
                    <td class="total-col">
                      {{ formatMonthValue(getPlatformExpenseTotal(platform.expense)) }}
                    </td>
                    <td :class="['total-col', getDifferenceClass(getPlatformDifference(platform))]">
                      {{ formatMonthValue(getPlatformDifference(platform)) }}
                    </td>
                  </tr>
                </template>
              </template>

              <!-- 總計列 -->
              <tr class="monthly-total-row">
                <td
                  colspan="2"
                  class="total-label"
                >
                  月度總計
                </td>
                <!-- JAN -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('JAN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('JAN')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('JAN'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('JAN')) }}
                </td>
                <!-- FEB -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('FEB')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('FEB')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('FEB'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('FEB')) }}
                </td>
                <!-- MAR -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('MAR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('MAR')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('MAR'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('MAR')) }}
                </td>
                <!-- Q1 -->
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyBudgetTotal(1)) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyExpenseTotal(1)) }}
                </td>
                <td :class="['quarter-col', getDifferenceClass(getQuarterlyDifferenceTotal(1))]">
                  {{ formatQuarterValue(getQuarterlyDifferenceTotal(1)) }}
                </td>
                <!-- APR -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('APR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('APR')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('APR'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('APR')) }}
                </td>
                <!-- MAY -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('MAY')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('MAY')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('MAY'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('MAY')) }}
                </td>
                <!-- JUN -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('JUN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('JUN')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('JUN'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('JUN')) }}
                </td>
                <!-- Q2 -->
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyBudgetTotal(2)) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyExpenseTotal(2)) }}
                </td>
                <td :class="['quarter-col', getDifferenceClass(getQuarterlyDifferenceTotal(2))]">
                  {{ formatQuarterValue(getQuarterlyDifferenceTotal(2)) }}
                </td>
                <!-- JUL -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('JUL')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('JUL')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('JUL'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('JUL')) }}
                </td>
                <!-- AUG -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('AUG')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('AUG')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('AUG'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('AUG')) }}
                </td>
                <!-- SEP -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('SEP')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('SEP')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('SEP'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('SEP')) }}
                </td>
                <!-- Q3 -->
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyBudgetTotal(3)) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyExpenseTotal(3)) }}
                </td>
                <td :class="['quarter-col', getDifferenceClass(getQuarterlyDifferenceTotal(3))]">
                  {{ formatQuarterValue(getQuarterlyDifferenceTotal(3)) }}
                </td>
                <!-- OCT -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('OCT')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('OCT')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('OCT'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('OCT')) }}
                </td>
                <!-- NOV -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('NOV')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('NOV')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('NOV'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('NOV')) }}
                </td>
                <!-- DEC -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('DEC')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('DEC')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('DEC'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('DEC')) }}
                </td>
                <!-- Q4 -->
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyBudgetTotal(4)) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyExpenseTotal(4)) }}
                </td>
                <td :class="['quarter-col', getDifferenceClass(getQuarterlyDifferenceTotal(4))]">
                  {{ formatQuarterValue(getQuarterlyDifferenceTotal(4)) }}
                </td>
                <!-- Total -->
                <td class="total-col highlight-total">
                  {{ formatMonthValue(getGrandBudgetTotal()) }}
                </td>
                <td class="total-col highlight-total">
                  {{ formatMonthValue(getGrandExpenseTotal()) }}
                </td>
                <td :class="['total-col', 'highlight-total', getDifferenceClass(getGrandDifferenceTotal())]">
                  {{ formatMonthValue(getGrandDifferenceTotal()) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 行銷各線實際支出表 -->
        <div
          v-if="searchForm.reportType === 'lineExpense'"
          class="budget-table-title"
        >
          <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
          <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
          行銷各線實際支出表 <span class="text-light-blue-darken-2">({{ searchForm.month ? `${searchForm.month}月` : '( 請先選擇月份 )' }})</span>
        </div>

        <div class="table-container">
          <table
            v-if="searchForm.reportType === 'lineExpense'"
            class="budget-table"
          >
            <thead>
              <tr class="header-row">
                <th 
                  class="header-cell sticky-col"
                  style="width: 180px; left: 0; z-index: 2;"
                >
                  平台 / 線別
                </th>
                <th
                  v-for="line in searchForm.line"
                  :key="line"
                  class="header-cell"
                  style="width: 180px"
                >
                  {{ getLineName(line) }}
                </th>
                <th 
                  class="header-cell sticky-col"
                  style="width: 180px; right: 0; z-index: 2;"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="platform in reportData"
                :key="platform.platformName"
              >
                <td 
                  class="platform-col sticky-col"
                  style="width: 180px; left: 0; z-index: 1;"
                >
                  {{ platform.platformName }}
                </td>
                <td
                  v-for="line in searchForm.line"
                  :key="line"
                  class="month-col"
                  style="width: 180px"
                >
                  {{ formatMonthValue(platform.expenses[getLineName(line)] || 0) }}
                </td>
                <td 
                  class="total-col sticky-col"
                  style="width: 180px; right: 0; z-index: 1;"
                >
                  {{ Number(platform.total) > 0 ? formatMonthValue(platform.total) : '-' }}
                </td>
              </tr>
              <!-- 總計列 -->
              <tr class="monthly-total-row">
                <td 
                  class="sticky-col"
                  style="width: 180px; left: 0; z-index: 1;"
                >
                  總計
                </td>
                <td
                  v-for="line in searchForm.line"
                  :key="line"
                  class="month-col"
                  style="width: 180px"
                >
                  {{ formatMonthValue(reportData.reduce((sum, platform) => sum + (platform.expenses[getLineName(line)] || 0), 0)) }}
                </td>
                <td 
                  class="total-col highlight-total sticky-col"
                  style="width: 180px; right: 0; z-index: 1;"
                >
                  {{ 
                    reportData.reduce((sum, platform) => sum + (Number(platform.total) || 0), 0) > 0 
                      ? formatMonthValue(reportData.reduce((sum, platform) => sum + (Number(platform.total) || 0), 0))
                      : '-'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="searchForm.reportType === 'lineExpenseTotal'"
          class="budget-table-title"
        >
          <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
          <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
          行銷各線實際支出總表
        </div>

        <div class="table-container">
          <table
            v-if="searchForm.reportType === 'lineExpenseTotal'"
            class="budget-table line-expense-total-table"
          >
            <thead>
              <tr class="header-row">
                <th
                  rowspan="1"
                  class="header-cell"
                >
                  線別
                </th>
                <th class="header-cell">
                  JAN
                </th>
                <th class="header-cell">
                  FEB
                </th>
                <th class="header-cell">
                  MAR
                </th>
                <th class="header-cell-quarter">
                  Q1
                </th>
                <th class="header-cell">
                  APR
                </th>
                <th class="header-cell">
                  MAY
                </th>
                <th class="header-cell">
                  JUN
                </th>
                <th class="header-cell-quarter">
                  Q2
                </th>
                <th class="header-cell">
                  JUL
                </th>
                <th class="header-cell">
                  AUG
                </th>
                <th class="header-cell">
                  SEP
                </th>
                <th class="header-cell-quarter">
                  Q3
                </th>
                <th class="header-cell">
                  OCT
                </th>
                <th class="header-cell">
                  NOV
                </th>
                <th class="header-cell">
                  DEC
                </th>
                <th class="header-cell-quarter">
                  Q4
                </th>
                <th class="header-cell">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(line, index) in reportData"
                :key="line.lineName"
                :class="{ 'row-odd': index % 2 === 0 }"
              >
                <td class="channel-col">
                  {{ line.lineName }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.JAN) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.FEB) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.MAR) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterTotal(line.expenses, 1)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.APR) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.MAY) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.JUN) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterTotal(line.expenses, 2)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.JUL) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.AUG) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.SEP) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterTotal(line.expenses, 3)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.OCT) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.NOV) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(line.expenses.DEC) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterTotal(line.expenses, 4)) }}
                </td>
                <td class="total-col">
                  {{ formatMonthValue(getPlatformTotal(line.expenses)) }}
                </td>
              </tr>
              <!-- 月度總計列 -->
              <tr class="monthly-total-row">
                <td>
                  月度總計
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JAN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('FEB')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAR')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(1)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('APR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAY')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUN')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(2)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUL')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('AUG')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('SEP')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(3)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('OCT')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('NOV')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('DEC')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(4)) }}
                </td>
                <td class="total-col highlight-total">
                  {{ formatMonthValue(getGrandTotal()) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-col>
    </v-row>

    <!-- 在總表下方添加圖表容器 -->
    <v-row
      v-if="searchForm.reportType === 'lineExpenseTotal' && showReport"
      class="elevation-4 rounded-lg py-sm-8 px-1 px-sm-4 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white"
    >
      <v-col cols="12">
        <div class="d-flex justify-end mb-4 pe-4">
          <v-btn
            color="red-darken-1"
            prepend-icon="mdi-file-chart"
            :loading="isExporting"
            @click="exportChartsToPDF"
          >
            匯出圖表
          </v-btn>
        </div>
        <div class="charts-container mt-8">
          <v-row>
            <v-col
              cols="12"
              md="6"
              class="d-flex justify-center align-center"
            >
              <div class="chart-box rounded-lg py-4 px-4 bg-white">
                <ECharts
                  ref="pieChart"
                  :option="pieChartOption"
                  :init-options="{ renderer: 'canvas' }"
                  style="width: 100%; height: 400px;"
                />
              </div>
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="d-flex justify-center align-center"
            >
              <div class="chart-box rounded-lg py-4 px-4 bg-white">
                <ECharts
                  ref="barChart"
                  :option="barChartOption"
                  :init-options="{ renderer: 'canvas' }"
                  style="width: 100%; height: 400px;"
                />
              </div>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <!-- 添加下載報表對話框 -->
    <v-dialog
      v-model="showDownloadDialog"
      max-width="800"
    >
      <v-card class="rounded-lg px-4 py-4">
        <v-card-title class="card-title mb-2">
          批次下載報表
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col
              cols="6"
              class="pb-1"
            >
              <v-autocomplete
                v-model="downloadForm.theme"
                :items="themeOptions"
                label="行銷主題"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="compact"
                :error-messages="downloadThemeError"
                clearable
              />
            </v-col>
            <v-col
              cols="6"
              class="pb-1"
            >
              <v-select
                v-model="downloadForm.year"
                :items="downloadYearOptions" 
                label="年度"
                variant="outlined"
                density="compact"
                :error-messages="downloadYearError"
                clearable
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col
              cols="12"
              class="pb-0"
            >
              <div class="sub-title mb-2">
                選擇要下載的報表：
              </div>
              <v-checkbox
                v-model="downloadForm.selectedReports"
                label="行銷廣告預算表"
                density="compact"
                value="budget"
                color="purple-darken-1"
                hide-details
                class="mb-3"
              />
              <v-checkbox
                v-model="downloadForm.selectedReports"
                label="行銷實際支出表"
                density="compact"
                value="expense"
                hide-details
                color="purple-darken-1"
                class="mb-3"
              />
              <v-checkbox
                v-model="downloadForm.selectedReports"
                label="行銷預算與實際支出比較表"
                density="compact"
                value="comparison"
                hide-details
                class="mb-3"
                color="purple-darken-1"
              />
              <v-checkbox
                v-model="downloadForm.selectedReports"
                label="行銷各線實際支出表"
                density="compact"
                value="lineExpense"
                hide-details
                class="mb-3"
                color="purple-darken-1"
              />
              <v-checkbox
                v-model="downloadForm.selectedReports"
                label="行銷各線實際支出總表"
                density="compact"
                value="lineExpenseTotal"
                hide-details
                class="mb-3"
                color="purple-darken-1"
              />
              <v-checkbox
                v-model="downloadForm.selectedReports"
                label="行銷各線實際支出圖表"
                density="compact"
                value="charts"
                hide-details
                class="mb-3"
                color="purple-darken-1"
              />
            </v-col>
          </v-row>

          <!-- 當選擇行銷各線實際支出表時顯示線別和月份選擇 -->
          <v-row v-if="downloadForm.selectedReports.includes('lineExpense')">
            <v-col cols="12">
              <v-divider class="mb-4" />
              <div class="sub-title mb-3">
                選擇線別：
              </div>
              <v-autocomplete
                v-model="downloadForm.selectedLines"
                :items="lineOptions"
                label="線別"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                multiple
                select-all
              >
                <template #prepend-item>
                  <v-list-item
                    title="全選"
                    color="purple-lighten-1"
                    prepend-icon="mdi-checkbox-multiple-marked"
                    :active="downloadForm.selectedLines.length === lineOptions.length"
                    @click="selectAllDownloadLines"
                  />
                  <v-divider />
                </template>
              </v-autocomplete>
              
              <v-divider class="my-4" />
              <div class="sub-title mb-2">
                選擇月份：
              </div>
              <v-row>
                <v-col
                  cols="12"
                  class="pb-0"
                >
                  <v-checkbox
                    v-model="downloadForm.selectAllMonths"
                    label="全選"
                    color="purple-darken-1"
                    hide-details
                    density="compact"
                    @change="handleSelectAllMonths"
                  />
                </v-col>
                <v-col
                  v-for="month in monthOptions"
                  :key="month.value"
                  class="pb-0"
                  cols="2"
                >
                  <v-checkbox
                    v-model="downloadForm.selectedMonths"
                    :label="month.name"
                    :value="month.value"
                    color="purple-darken-1"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-divider class="mt-6 mb-4" />

          <v-row>
            <v-col cols="12">
              <div class="sub-title mb-2">
                選擇檔案格式：
              </div>
              <v-checkbox
                v-model="downloadForm.fileFormats"
                label="PDF"
                value="pdf"
                hide-details
                density="compact"
                color="purple-darken-1"
                :disabled="!downloadForm.selectedReports.length"
              />
              <v-checkbox
                v-model="downloadForm.fileFormats"
                label="Excel"
                value="excel"
                hide-details
                density="compact"
                color="purple-darken-1"
                :disabled="!downloadForm.selectedReports.length || (downloadForm.selectedReports.length === 1 && downloadForm.selectedReports[0] === 'charts')"
              />
              <div 
                v-if="downloadForm.selectedReports.includes('charts')"
                class="text-caption text-grey mt-2"
              >
                圖表僅支援 PDF 格式
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="showDownloadDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="isExporting"
            class="ms-2"
            @click="handleDownloadReports"
          >
            下載
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick, onUnmounted } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'
import html2pdf from 'html2pdf.js'
import * as echarts from 'echarts'
import VChart from 'vue-echarts'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// 重命名 VChart 為 ECharts
const ECharts = VChart

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '行銷費用分析 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.MANAGER]
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const router = useRouter()

// ===== 基礎狀態管理 =====
const isLoading = ref(false)
const isExporting = ref(false)
const showReport = ref(false)

// ===== 搜尋表單相關 =====
const searchForm = ref({
  year: null,
  theme: null,
  reportType: null,
  line: [],
  month: null
})

const yearError = ref('')
const themeError = ref('')
const reportTypeError = ref('')
const lineError = ref('')
const monthError = ref('')

// ===== 選項資料 =====
const yearOptions = ref([])
const themeOptions = ref([])
const reportTypeOptions = ref([
  { title: '行銷廣告預算表', value: 'budget' },
  { title: '行銷實際支出表', value: 'expense' },
  { title: '行銷預算與實際支出比較表', value: 'comparison' },
  { title: '行銷各線實際支出表', value: 'lineExpense' },
  { title: '行銷各線實際支出總表', value: 'lineExpenseTotal' },
])
const lineOptions = ref([])
const monthOptions = ref([])

// ===== 報表資料 =====
const reportData = ref([])

// ===== 方法 =====
// 載入選項資料
const loadOptions = async () => {
  try {
    const [yearResponse, themeResponse, lineResponse] = await Promise.all([
      apiAuth.get('/marketing/budgets/years'),
      apiAuth.get('/marketing/categories/options', { params: { type: 0 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 3 } }) // 抓取線別
    ])

    if (yearResponse.data.success) {
      yearOptions.value = yearResponse.data.result
    }
    if (themeResponse.data.success) {
      themeOptions.value = themeResponse.data.result
    }
    if (lineResponse.data.success) {
      lineOptions.value = lineResponse.data.result
    }

    // 設定月份選項
    monthOptions.value = Array.from({ length: 12 }, (_, i) => ({
      name: `${i + 1}月`,
      value: i + 1
    }))
  } catch (error) {
    handleError(error)
  }
}

// 監聽主題和報表類型的變化
watch([
  () => searchForm.value.theme,
  () => searchForm.value.reportType
], async ([newTheme, newReportType]) => {
  try {
    isLoading.value = true
    // 當主題或報表類型為空時，清空年度選項
    if (!newTheme || !newReportType) {
      yearOptions.value = []
      // 確保年度選擇也被清空
      searchForm.value.year = null
      return
    }

    // 據報表類型要查詢不同的 API
    let endpoint
    switch (newReportType) {
      case 'budget':
        endpoint = `/marketing/budgets/years/${newTheme}`
        break
      case 'expense':
        endpoint = `/marketing/expenses/years/${newTheme}`
        break
      case 'comparison':
        try {
          const [budgetYears, expenseYears] = await Promise.all([
            apiAuth.get(`/marketing/budgets/years/${newTheme}`),
            apiAuth.get(`/marketing/expenses/years/${newTheme}`)
          ])
          if (budgetYears.data.success && expenseYears.data.success) {
            const commonYears = budgetYears.data.result.filter(year => 
              expenseYears.data.result.includes(year)
            )
            yearOptions.value = commonYears
            if (!commonYears.includes(searchForm.value.year)) {
              searchForm.value.year = null
            }
            // 檢查是否有共同年份
            if (commonYears.length === 0) {
              createSnackbar({
                text: `「${getThemeName(newTheme)}」尚無預算與支出的對應資料`,
                snackbarProps: { color: 'warning' }
              })
            }
          }
        } catch (error) {
          handleError(error)
        }
        return
      default:
        endpoint = `/marketing/expenses/years/${newTheme}`
    }

    if (endpoint) {
      const { data } = await apiAuth.get(endpoint)
      if (data.success) {
        yearOptions.value = data.result
        // 如果當前選擇的年度不在新的選項中，清空年度選擇
        if (!data.result.includes(searchForm.value.year)) {
          searchForm.value.year = null
        }
        // 檢查是否有年份資料
        if (data.result.length === 0) {
          const reportTypeName = reportTypeOptions.value.find(option => 
            option.value === newReportType
          )?.title || ''
          createSnackbar({
            text: `「${getThemeName(newTheme)}」尚無「${reportTypeName}」相關資料`,
            snackbarProps: { color: 'warning' }
          })
        }
      }
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}, { immediate: true })

// 處理搜尋條件變更
const handleYearChange = () => {
  yearError.value = ''
  showReport.value = false
}

const handleThemeChange = () => {
  themeError.value = ''
  showReport.value = false
  // 當主題變更時，清除年度選擇
  searchForm.value.year = null
  yearError.value = ''
}

const handleReportTypeChange = () => {
  reportTypeError.value = ''
  showReport.value = false
  
  // 如果不是行銷各線實際支出表，清空線別和月份的選擇
  if (searchForm.value.reportType !== 'lineExpense') {
    searchForm.value.line = []
    searchForm.value.month = null
    lineError.value = ''
    monthError.value = ''
  }
}

const handleLineChange = () => {
  lineError.value = ''
  showReport.value = false
}

const handleMonthChange = () => {
  monthError.value = ''
  showReport.value = false
}

// 產生報表
const generateReport = async () => {
  try {
    // 驗證所有必填欄位
    let hasError = false
    
    // 清除所有錯誤訊息
    reportTypeError.value = ''
    themeError.value = ''
    yearError.value = ''
    lineError.value = ''
    monthError.value = ''

    // 基本驗證
    if (!searchForm.value.reportType) {
      reportTypeError.value = '請選擇報表類型'
      hasError = true
    }
    if (!searchForm.value.theme) {
      themeError.value = '請選擇行銷主題'
      hasError = true
    }
    if (!searchForm.value.year) {
      yearError.value = '請選擇年度'
      hasError = true
    }

    // 只有在選擇行銷各線實際支出表時才驗證線別和月份
    if (searchForm.value.reportType === 'lineExpense') {
      if (!searchForm.value.line?.length) {
        lineError.value = '請選擇線別'
        hasError = true
      }
      if (!searchForm.value.month) {
        monthError.value = '請選擇月份'
        hasError = true
      }
    }

    if (hasError) return

    isLoading.value = true
    let result
    let data

    switch (searchForm.value.reportType) {
      case 'budget':
        data = await apiAuth.get(`/marketing/budgets/${searchForm.value.year}/${searchForm.value.theme}`)
        if (data.data.success) {
          result = processBudgetData(data.data.result)
        }
        break

      case 'expense':
        try {
          const { data: expenseData } = await apiAuth.get('/marketing/expenses/monthly-stats', {
            params: {
              year: searchForm.value.year,
              theme: searchForm.value.theme
            }
          })

          if (expenseData.success && Array.isArray(expenseData.result)) {
            result = processExpenseData(expenseData.result)
          }
        } catch (error) {
          console.error('Error fetching expense data:', error)
          handleError(error)
        }
        break

      case 'comparison':
        try {
          const budgetResponse = await apiAuth.get(`/marketing/budgets/${searchForm.value.year}/${searchForm.value.theme}`)
          const expenseResponse = await apiAuth.get('/marketing/expenses/monthly-stats', {
            params: {
              year: searchForm.value.year,
              theme: searchForm.value.theme
            }
          })

          if (budgetResponse.data.success && expenseResponse.data.success) {
            const budgetData = processBudgetData(budgetResponse.data.result)
            const expenseData = processExpenseData(expenseResponse.data.result)
            result = processComparisonData(budgetData, expenseData)
          }
        } catch (error) {
          console.error('Error fetching comparison data:', error)
          handleError(error)
        }
        break

      case 'lineExpense':
        try {
          const validLines = searchForm.value.line.filter(validObjectId)
          const { data: lineExpenseData } = await apiAuth.get('/marketing/expenses/line-expenses', {
            params: {
              year: searchForm.value.year,
              theme: searchForm.value.theme,
              lines: validLines.join(','),
              month: searchForm.value.month
            }
          })

          if (lineExpenseData.success && Array.isArray(lineExpenseData.result)) {
            result = processLineExpenseData(lineExpenseData.result)
          }
        } catch (error) {
          console.error('Error fetching line expense data:', error)
          handleError(error)
        }
        break

      case 'lineExpenseTotal':
        try {
          const { data: lineExpenseTotalData } = await apiAuth.get('/marketing/expenses/line-expenses-total', {
            params: {
              year: searchForm.value.year,
              theme: searchForm.value.theme
            }
          })

          if (lineExpenseTotalData.success) {
            result = lineExpenseTotalData.result
          }
        } catch (error) {
          console.error('Error fetching line expense total data:', error)
          handleError(error)
        }
        break
    }

    if (result) {
      reportData.value = result
      showReport.value = true
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

// 處理實際支出資料
const processExpenseData = (expenses) => {
  const channelMap = new Map()
  
  // 遍歷所有費用記錄
  expenses.forEach(expense => {
    const channelId = expense.channel._id
    const platformId = expense.platform._id
    const month = new Date(expense.invoiceDate).getMonth()
    const monthKey = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][month]

    // 初始化渠道
    if (!channelMap.has(channelId)) {
      channelMap.set(channelId, {
        channelName: expense.channel.name,
        platforms: new Map()
      })
    }

    const channel = channelMap.get(channelId)
    
    // 初始化平台
    if (!channel.platforms.has(platformId)) {
      channel.platforms.set(platformId, {
        platformName: expense.platform.name,
        expense: {
          JAN: 0, FEB: 0, MAR: 0, APR: 0, MAY: 0, JUN: 0,
          JUL: 0, AUG: 0, SEP: 0, OCT: 0, NOV: 0, DEC: 0
        }
      })
    }

    // 將該筆費用加到對應月份
    const totalAmount = expense.details.reduce((sum, detail) => sum + detail.amount, 0)
    channel.platforms.get(platformId).expense[monthKey] += totalAmount
  })

  // 轉換成陣列格  
  return Array.from(channelMap.values()).map(channel => ({
    channelName: channel.channelName,
    platforms: Array.from(channel.platforms.values())
  }))
}

// 格式化月份數值
const formatMonthValue = (value) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return ''
  }
  return value.toLocaleString('en-US')
}

// 格式化季度數值
const formatQuarterValue = (value) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return '-'
  }
  return value.toLocaleString('en-US')
}

// 計算季度總額
const getQuarterTotal = (budget, quarter) => {
  const quarterMap = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }

  const total = quarterMap[quarter].reduce((sum, month) => sum + (budget[month] || 0), 0)
  return formatQuarterValue(total)
}

// 計算平台總額
const getPlatformTotal = (budget) => {
  return Object.values(budget).reduce((sum, value) => sum + (value || 0), 0)
}

// 計算月度總額
const getMonthlyTotal = (month) => {
  if (searchForm.value.reportType === 'lineExpenseTotal') {
    return formatMonthValue(getLineExpenseTotalMonthly(month))
  }

  let total = 0
  if (searchForm.value.reportType === 'expense') {
    total = reportData.value.reduce((sum, channel) => {
      return sum + channel.platforms.reduce((platformSum, platform) => {
        return platformSum + (platform.expense[month] || 0)
      }, 0)
    }, 0)
  } else {
    total = reportData.value.reduce((sum, channel) => {
      return sum + channel.platforms.reduce((platformSum, platform) => {
        return platformSum + (platform.budget[month] || 0)
      }, 0)
    }, 0)
  }
  return formatMonthValue(total)
}

// 計算季度總額
const getQuarterlyTotal = (quarter) => {
  if (searchForm.value.reportType === 'lineExpenseTotal') {
    return formatQuarterValue(getLineExpenseTotalQuarterly(quarter))
  }

  const monthMap = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }

  const total = monthMap[quarter].reduce((sum, month) => {
    const monthTotal = getMonthlyTotal(month)
    return sum + (monthTotal === '' ? 0 : parseFloat(monthTotal.replace(/,/g, '')))
  }, 0)
  
  return formatQuarterValue(total)
}

// 計算總額
const getGrandTotal = () => {
  if (searchForm.value.reportType === 'lineExpenseTotal') {
    return formatMonthValue(getLineExpenseTotalGrand())
  }

  if (searchForm.value.reportType === 'expense') {
    return reportData.value.reduce((sum, channel) => {
      return sum + channel.platforms.reduce((platformSum, platform) => {
        return platformSum + Object.values(platform.expense).reduce((total, value) => total + value, 0)
      }, 0)
    }, 0)
  }
  // 原有的預算表計算邏輯
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + getPlatformTotal(platform.budget)
    }, 0)
  }, 0)
}

// 匯出 Excel
const loadXLSX = async () => {
  if (window.XLSX) return window.XLSX
  
  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
  
  return window.XLSX
}

const exportToExcel = async () => {
  try {
    isExporting.value = true
    const XLSX = await loadXLSX()
    
    // 建立工作表，修改標題格式
    const title = `${searchForm.value.year}年度 ${getThemeName(searchForm.value.theme)} ${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}${searchForm.value.reportType === 'lineExpense' ? ` (${searchForm.value.month}月)` : ''}`
    
    const ws = XLSX.utils.aoa_to_sheet([
      [title],
      []
    ])

    // 根據報表類型設定不同的表頭和格式
    if (searchForm.value.reportType === 'comparison') {
      // 比較表的表頭
      XLSX.utils.sheet_add_aoa(ws, [
        ['廣告渠道', '平台',
          'JAN', '', '', 'FEB', '', '', 'MAR', '', '', 'Q1', '', '',
          'APR', '', '', 'MAY', '', '', 'JUN', '', '', 'Q2', '', '',
          'JUL', '', '', 'AUG', '', '', 'SEP', '', '', 'Q3', '', '',
          'OCT', '', '', 'NOV', '', '', 'DEC', '', '', 'Q4', '', '',
          'Total', '', ''],
        ['', '',
          '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異',
          '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異',
          '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異',
          '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異',
          '預算', '實際', '差異']
      ], { origin: 'A3' })

      // 設定欄寬
      ws['!cols'] = [
        { wch: 15 }, // 廣告渠道
        { wch: 15 }, // 平台
        ...Array(48).fill({ wch: 12 }) // 其他欄位
      ]

      // 設定標題合併儲存格
      ws['!merges'] = [
        // 標題合併
        { s: { r: 0, c: 0 }, e: { r: 0, c: 50 } },
        // 月份標題合併
        { s: { r: 2, c: 2 }, e: { r: 2, c: 4 } },   // JAN
        { s: { r: 2, c: 5 }, e: { r: 2, c: 7 } },   // FEB
        { s: { r: 2, c: 8 }, e: { r: 2, c: 10 } },  // MAR
        { s: { r: 2, c: 11 }, e: { r: 2, c: 13 } }, // Q1
        { s: { r: 2, c: 14 }, e: { r: 2, c: 16 } }, // APR
        { s: { r: 2, c: 17 }, e: { r: 2, c: 19 } }, // MAY
        { s: { r: 2, c: 20 }, e: { r: 2, c: 22 } }, // JUN
        { s: { r: 2, c: 23 }, e: { r: 2, c: 25 } }, // Q2
        { s: { r: 2, c: 26 }, e: { r: 2, c: 28 } }, // JUL
        { s: { r: 2, c: 29 }, e: { r: 2, c: 31 } }, // AUG
        { s: { r: 2, c: 32 }, e: { r: 2, c: 34 } }, // SEP
        { s: { r: 2, c: 35 }, e: { r: 2, c: 37 } }, // Q3
        { s: { r: 2, c: 38 }, e: { r: 2, c: 40 } }, // OCT
        { s: { r: 2, c: 41 }, e: { r: 2, c: 43 } }, // NOV
        { s: { r: 2, c: 44 }, e: { r: 2, c: 46 } }, // DEC
        { s: { r: 2, c: 47 }, e: { r: 2, c: 49 } }, // Q4
        { s: { r: 2, c: 50 }, e: { r: 2, c: 52 } }  // Total
      ]
    } else if (searchForm.value.reportType === 'lineExpense') {
      // 行銷各線實際支出表的表頭
      const headers = ['平台 / 線別']
      searchForm.value.line.forEach(lineId => {
        headers.push(getLineName(lineId))
      })
      headers.push('Total')

      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A3' })

      // 設定欄寬
      ws['!cols'] = [
        { wch: 20 }, // 平台欄位
        ...Array(searchForm.value.line.length).fill({ wch: 15 }), // 線別欄位
        { wch: 15 } // Total 欄位
      ]

      // 設定標題合併儲存格
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
      ]

      // 添加數據行
      reportData.value.forEach(platform => {
        const row = [platform.platformName]
        searchForm.value.line.forEach(lineId => {
          const value = platform.expenses[getLineName(lineId)] || 0
          row.push(value === 0 ? '' : value.toLocaleString('en-US'))
        })
        const total = platform.total || 0
        row.push(total === 0 ? '-' : total.toLocaleString('en-US'))
        XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 })
      })

      // 添加總計列
      const totalRow = ['總計']
      searchForm.value.line.forEach(lineId => {
        const lineTotal = reportData.value.reduce((sum, platform) => {
          return sum + (platform.expenses[getLineName(lineId)] || 0)
        }, 0)
        totalRow.push(lineTotal === 0 ? '' : lineTotal.toLocaleString('en-US'))
      })
      // 添加最終總計
      const finalTotal = reportData.value.reduce((sum, platform) => sum + (Number(platform.total) || 0), 0)
      totalRow.push(finalTotal === 0 ? '-' : finalTotal.toLocaleString('en-US'))
      XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: -1 })
    } else if (searchForm.value.reportType === 'lineExpenseTotal') {
      // 行銷各線實際支出總表的表頭
      XLSX.utils.sheet_add_aoa(ws, [
        ['線別', 'JAN', 'FEB', 'MAR', 'Q1', 'APR', 'MAY', 'JUN', 'Q2', 'JUL', 'AUG', 'SEP', 'Q3', 'OCT', 'NOV', 'DEC', 'Q4', 'Total']
      ], { origin: 'A2' }) // 改為 A2，移除空行

      // 設定欄寬
      ws['!cols'] = [
        { wch: 15 },  // 線別
        { wch: 12 },  // JAN
        { wch: 12 },  // FEB
        { wch: 12 },  // MAR
        { wch: 12 },  // Q1
        { wch: 12 },  // APR
        { wch: 12 },  // MAY
        { wch: 12 },  // JUN
        { wch: 12 },  // Q2
        { wch: 12 },  // JUL
        { wch: 12 },  // AUG
        { wch: 12 },  // SEP
        { wch: 12 },  // Q3
        { wch: 12 },  // OCT
        { wch: 12 },  // NOV
        { wch: 12 },  // DEC
        { wch: 12 },  // Q4
        { wch: 15 }   // Total
      ]

      // 設定標題合併儲存格
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }]

      // 添加數據行
      if (reportData.value && Array.isArray(reportData.value)) {
        reportData.value.forEach(line => {
          if (line && line.expenses) {
            const rowData = [
              line.lineName || '',
              formatMonthValue(line.expenses.JAN || 0),
              formatMonthValue(line.expenses.FEB || 0),
              formatMonthValue(line.expenses.MAR || 0),
              formatQuarterValue(getQuarterTotal(line.expenses, 1)),
              formatMonthValue(line.expenses.APR || 0),
              formatMonthValue(line.expenses.MAY || 0),
              formatMonthValue(line.expenses.JUN || 0),
              formatQuarterValue(getQuarterTotal(line.expenses, 2)),
              formatMonthValue(line.expenses.JUL || 0),
              formatMonthValue(line.expenses.AUG || 0),
              formatMonthValue(line.expenses.SEP || 0),
              formatQuarterValue(getQuarterTotal(line.expenses, 3)),
              formatMonthValue(line.expenses.OCT || 0),
              formatMonthValue(line.expenses.NOV || 0),
              formatMonthValue(line.expenses.DEC || 0),
              formatQuarterValue(getQuarterTotal(line.expenses, 4)),
              formatMonthValue(getPlatformTotal(line.expenses))
            ]
            XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: -1 })
          }
        })

        // 添加總計列
        const totalRow = [
          '月度總計',
          formatMonthValue(getLineExpenseTotalMonthly('JAN')),
          formatMonthValue(getLineExpenseTotalMonthly('FEB')),
          formatMonthValue(getLineExpenseTotalMonthly('MAR')),
          formatQuarterValue(getLineExpenseTotalQuarterly(1)),
          formatMonthValue(getLineExpenseTotalMonthly('APR')),
          formatMonthValue(getLineExpenseTotalMonthly('MAY')),
          formatMonthValue(getLineExpenseTotalMonthly('JUN')),
          formatQuarterValue(getLineExpenseTotalQuarterly(2)),
          formatMonthValue(getLineExpenseTotalMonthly('JUL')),
          formatMonthValue(getLineExpenseTotalMonthly('AUG')),
          formatMonthValue(getLineExpenseTotalMonthly('SEP')),
          formatQuarterValue(getLineExpenseTotalQuarterly(3)),
          formatMonthValue(getLineExpenseTotalMonthly('OCT')),
          formatMonthValue(getLineExpenseTotalMonthly('NOV')),
          formatMonthValue(getLineExpenseTotalMonthly('DEC')),
          formatQuarterValue(getLineExpenseTotalQuarterly(4)),
          formatMonthValue(getLineExpenseTotalGrand())
        ]
        XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: -1 })
      }

      // 下載檔案
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Report')
      // 修改檔案名稱邏輯
      const filename = searchForm.value.reportType === 'lineExpense'
        ? `${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}行銷各線實際支出表(${searchForm.value.month}月).xlsx`
        : `${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}.xlsx`
      XLSX.writeFile(wb, filename)

      return // 提前返回，不執行後面的代碼
    } else {
      // 預算表或實際支出表的表頭
      XLSX.utils.sheet_add_aoa(ws, [
        ['廣告渠道', '平台', 'JAN', 'FEB', 'MAR', 'Q1', 'APR', 'MAY', 'JUN', 'Q2', 'JUL', 'AUG', 'SEP', 'Q3', 'OCT', 'NOV', 'DEC', 'Q4', 'Total']
      ], { origin: 'A3' })

      // 預算表和實際支出表的欄寬
      ws['!cols'] = [
        { wch: 15 },  // 廣告渠道
        { wch: 15 },  // 平台
        { wch: 12 },  // JAN
        { wch: 12 },  // FEB
        { wch: 12 },  // MAR
        { wch: 12 },  // Q1
        { wch: 12 },  // APR
        { wch: 12 },  // MAY
        { wch: 12 },  // JUN
        { wch: 12 },  // Q2
        { wch: 12 },  // JUL
        { wch: 12 },  // AUG
        { wch: 12 },  // SEP
        { wch: 12 },  // Q3
        { wch: 12 },  // OCT
        { wch: 12 },  // NOV
        { wch: 12 },  // DEC
        { wch: 12 },  // Q4
        { wch: 15 }   // Total
      ]

      // 預算表和實際支出表的標題合併儲存格
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }]
    }

    ws.A1.s = { alignment: { horizontal: 'center' }, font: { bold: true, sz: 14 } }

    // 添加數據行
    let currentRow = searchForm.value.reportType === 'comparison' ? 4 : 3

    if (searchForm.value.reportType !== 'lineExpense') {
      reportData.value.forEach(channel => {
        const platformCount = channel.platforms.length
        
        channel.platforms.forEach((platform, index) => {
          let row
          if (searchForm.value.reportType === 'comparison') {
            row = [
              index === 0 ? channel.channelName : '',
              platform.platformName,
              formatExcelValue(platform.budget?.JAN),
              formatExcelValue(platform.expense?.JAN),
              formatExcelValue(platform.difference?.JAN),
              formatExcelValue(platform.budget?.FEB),
              formatExcelValue(platform.expense?.FEB),
              formatExcelValue(platform.difference?.FEB),
              formatExcelValue(platform.budget?.MAR),
              formatExcelValue(platform.expense?.MAR),
              formatExcelValue(platform.difference?.MAR),
              formatExcelQuarterValue(getPlatformQuarterlyBudget(platform, 1)),
              formatExcelQuarterValue(getPlatformQuarterlyExpense(platform, 1)),
              formatExcelQuarterValue(getPlatformQuarterlyDifference(platform, 1)),
              formatExcelValue(platform.budget?.APR),
              formatExcelValue(platform.expense?.APR),
              formatExcelValue(platform.difference?.APR),
              formatExcelValue(platform.budget?.MAY),
              formatExcelValue(platform.expense?.MAY),
              formatExcelValue(platform.difference?.MAY),
              formatExcelValue(platform.budget?.JUN),
              formatExcelValue(platform.expense?.JUN),
              formatExcelValue(platform.difference?.JUN),
              formatExcelQuarterValue(getPlatformQuarterlyBudget(platform, 2)),
              formatExcelQuarterValue(getPlatformQuarterlyExpense(platform, 2)),
              formatExcelQuarterValue(getPlatformQuarterlyDifference(platform, 2)),
              formatExcelValue(platform.budget?.JUL),
              formatExcelValue(platform.expense?.JUL),
              formatExcelValue(platform.difference?.JUL),
              formatExcelValue(platform.budget?.AUG),
              formatExcelValue(platform.expense?.AUG),
              formatExcelValue(platform.difference?.AUG),
              formatExcelValue(platform.budget?.SEP),
              formatExcelValue(platform.expense?.SEP),
              formatExcelValue(platform.difference?.SEP),
              formatExcelQuarterValue(getPlatformQuarterlyBudget(platform, 3)),
              formatExcelQuarterValue(getPlatformQuarterlyExpense(platform, 3)),
              formatExcelQuarterValue(getPlatformQuarterlyDifference(platform, 3)),
              formatExcelValue(platform.budget?.OCT),
              formatExcelValue(platform.expense?.OCT),
              formatExcelValue(platform.difference?.OCT),
              formatExcelValue(platform.budget?.NOV),
              formatExcelValue(platform.expense?.NOV),
              formatExcelValue(platform.difference?.NOV),
              formatExcelValue(platform.budget?.DEC),
              formatExcelValue(platform.expense?.DEC),
              formatExcelValue(platform.difference?.DEC),
              formatExcelQuarterValue(getPlatformQuarterlyBudget(platform, 4)),
              formatExcelQuarterValue(getPlatformQuarterlyExpense(platform, 4)),
              formatExcelQuarterValue(getPlatformQuarterlyDifference(platform, 4)),
              formatExcelQuarterValue(getPlatformBudgetTotal(platform.budget)),
              formatExcelQuarterValue(getPlatformExpenseTotal(platform.expense)),
              formatExcelQuarterValue(getPlatformDifference(platform))
            ]
          } else {
            const monthlyData = searchForm.value.reportType === 'expense' ? platform.expense : platform.budget
            row = [
              index === 0 ? channel.channelName : '',
              platform.platformName,
              formatExcelValue(monthlyData.JAN),
              formatExcelValue(monthlyData.FEB),
              formatExcelValue(monthlyData.MAR),
              formatExcelQuarterValue(getQuarterTotal(monthlyData, 1)),
              formatExcelValue(monthlyData.APR),
              formatExcelValue(monthlyData.MAY),
              formatExcelValue(monthlyData.JUN),
              formatExcelQuarterValue(getQuarterTotal(monthlyData, 2)),
              formatExcelValue(monthlyData.JUL),
              formatExcelValue(monthlyData.AUG),
              formatExcelValue(monthlyData.SEP),
              formatExcelQuarterValue(getQuarterTotal(monthlyData, 3)),
              formatExcelValue(monthlyData.OCT),
              formatExcelValue(monthlyData.NOV),
              formatExcelValue(monthlyData.DEC),
              formatExcelQuarterValue(getQuarterTotal(monthlyData, 4)),
              formatExcelQuarterValue(getPlatformTotal(monthlyData))
            ]
          }

          XLSX.utils.sheet_add_json(ws, [row], { skipHeader: true, origin: -1 })
          
          if (index === 0 && platformCount > 1) {
            ws['!merges'].push({
              s: { r: currentRow, c: 0 },
              e: { r: currentRow + platformCount - 1, c: 0 }
            })
          }
          currentRow++
        })
      })

      // 添加月度總計列
      const totalRow = searchForm.value.reportType === 'comparison'
        ? [
            '月度總計', '',
            formatExcelValue(getMonthlyBudgetTotal('JAN')),
            formatExcelValue(getMonthlyExpenseTotal('JAN')),
            formatExcelValue(getMonthlyDifferenceTotal('JAN')),
            formatExcelValue(getMonthlyBudgetTotal('FEB')),
            formatExcelValue(getMonthlyExpenseTotal('FEB')),
            formatExcelValue(getMonthlyDifferenceTotal('FEB')),
            formatExcelValue(getMonthlyBudgetTotal('MAR')),
            formatExcelValue(getMonthlyExpenseTotal('MAR')),
            formatExcelValue(getMonthlyDifferenceTotal('MAR')),
            formatExcelQuarterValue(getQuarterlyBudgetTotal(1)),
            formatExcelQuarterValue(getQuarterlyExpenseTotal(1)),
            formatExcelQuarterValue(getQuarterlyDifferenceTotal(1)),
            formatExcelValue(getMonthlyBudgetTotal('APR')),
            formatExcelValue(getMonthlyExpenseTotal('APR')),
            formatExcelValue(getMonthlyDifferenceTotal('APR')),
            formatExcelValue(getMonthlyBudgetTotal('MAY')),
            formatExcelValue(getMonthlyExpenseTotal('MAY')),
            formatExcelValue(getMonthlyDifferenceTotal('MAY')),
            formatExcelValue(getMonthlyBudgetTotal('JUN')),
            formatExcelValue(getMonthlyExpenseTotal('JUN')),
            formatExcelValue(getMonthlyDifferenceTotal('JUN')),
            formatExcelQuarterValue(getQuarterlyBudgetTotal(2)),
            formatExcelQuarterValue(getQuarterlyExpenseTotal(2)),
            formatExcelQuarterValue(getQuarterlyDifferenceTotal(2)),
            formatExcelValue(getMonthlyBudgetTotal('JUL')),
            formatExcelValue(getMonthlyExpenseTotal('JUL')),
            formatExcelValue(getMonthlyDifferenceTotal('JUL')),
            formatExcelValue(getMonthlyBudgetTotal('AUG')),
            formatExcelValue(getMonthlyExpenseTotal('AUG')),
            formatExcelValue(getMonthlyDifferenceTotal('AUG')),
            formatExcelValue(getMonthlyBudgetTotal('SEP')),
            formatExcelValue(getMonthlyExpenseTotal('SEP')),
            formatExcelValue(getMonthlyDifferenceTotal('SEP')),
            formatExcelQuarterValue(getQuarterlyBudgetTotal(3)),
            formatExcelQuarterValue(getQuarterlyExpenseTotal(3)),
            formatExcelQuarterValue(getQuarterlyDifferenceTotal(3)),
            formatExcelValue(getMonthlyBudgetTotal('OCT')),
            formatExcelValue(getMonthlyExpenseTotal('OCT')),
            formatExcelValue(getMonthlyDifferenceTotal('OCT')),
            formatExcelValue(getMonthlyBudgetTotal('NOV')),
            formatExcelValue(getMonthlyExpenseTotal('NOV')),
            formatExcelValue(getMonthlyDifferenceTotal('NOV')),
            formatExcelValue(getMonthlyBudgetTotal('DEC')),
            formatExcelValue(getMonthlyExpenseTotal('DEC')),
            formatExcelValue(getMonthlyDifferenceTotal('DEC')),
            formatExcelQuarterValue(getQuarterlyBudgetTotal(4)),
            formatExcelQuarterValue(getQuarterlyExpenseTotal(4)),
            formatExcelQuarterValue(getQuarterlyDifferenceTotal(4)),
            formatExcelQuarterValue(getGrandBudgetTotal()),
            formatExcelQuarterValue(getGrandExpenseTotal()),
            formatExcelQuarterValue(getGrandDifferenceTotal())
          ]
        : [
            '月度總計', '',
            formatExcelValue(getMonthlyTotal('JAN')),
            formatExcelValue(getMonthlyTotal('FEB')),
            formatExcelValue(getMonthlyTotal('MAR')),
            formatExcelQuarterValue(getQuarterlyTotal(1)),
            formatExcelValue(getMonthlyTotal('APR')),
            formatExcelValue(getMonthlyTotal('MAY')),
            formatExcelValue(getMonthlyTotal('JUN')),
            formatExcelQuarterValue(getQuarterlyTotal(2)),
            formatExcelValue(getMonthlyTotal('JUL')),
            formatExcelValue(getMonthlyTotal('AUG')),
            formatExcelValue(getMonthlyTotal('SEP')),
            formatExcelQuarterValue(getQuarterlyTotal(3)),
            formatExcelValue(getMonthlyTotal('OCT')),
            formatExcelValue(getMonthlyTotal('NOV')),
            formatExcelValue(getMonthlyTotal('DEC')),
            formatExcelQuarterValue(getQuarterlyTotal(4)),
            formatExcelQuarterValue(getGrandTotal())
          ]

      XLSX.utils.sheet_add_json(ws, [totalRow], { skipHeader: true, origin: -1 })

      // 合併月度總計的前兩格
      ws['!merges'].push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow, c: 1 }
      })
    }

    // 下載檔案
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, `${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}${searchForm.value.reportType === 'lineExpense' ? `(${searchForm.value.month}月)` : ''}.xlsx`)

    createSnackbar({ text: 'Excel 匯出成功', snackbarProps: { color: 'teal-lighten-1' } })
  } catch (error) {
    handleError(error)
  } finally {
    isExporting.value = false
  }
}

// 新增 Excel 格式化函數
const formatExcelValue = (value) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return ''
  }
  return value.toLocaleString('en-US')
}

const formatExcelQuarterValue = (value) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return '-'
  }
  return value.toLocaleString('en-US')
}

// 修改 container 寬度設定邏輯
const getContainerWidth = () => {
  if (searchForm.value.reportType === 'comparison') {
    return '5200px'
  } else if (searchForm.value.reportType === 'lineExpense') {
    // 基本寬度 (平台欄位 + Total欄位)
    const baseWidth = 364 // 180px * 2
    // 每個線別的寬度
    const lineWidth = 182
    // 計算總寬度
    const totalWidth = baseWidth + (searchForm.value.line.length * lineWidth)
    // 確保最小寬度為 2200px
    return `${Math.max(2200, totalWidth)}px`
  } else {
    return '2200px'
  }
}

// 匯出 PDF
const exportToPDF = async () => {
  try {
    isExporting.value = true

    // 獲取表格元素和標題
    const element = document.querySelector('.budget-table')
    if (!element) {
      throw new Error('找不到表格元素')
    }

    // 創建一個臨時容器
    const container = document.createElement('div')
    container.style.width = getContainerWidth()
    container.style.backgroundColor = 'white'
    container.style.padding = '20px'
    container.style.boxSizing = 'border-box'
    
    // 添加標題，修改標題格式
    const title = document.createElement('div')
    title.style.fontSize = '24px'
    title.style.fontWeight = '900'
    title.style.marginBottom = '24px'
    title.style.textAlign = 'center'
    title.style.color = '#000'
    title.innerHTML = `
      <div style="margin-bottom: 10px;">
        <span style="color: #F57C00;">${searchForm.value.year}</span>年度 
        <span style="color: #D81B60;">${getThemeName(searchForm.value.theme)}</span> 
        ${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}${searchForm.value.reportType === 'lineExpense' ? ` <span style="color: #0288D1;">(${searchForm.value.month}月)</span>` : ''}
      </div>
    `
    container.appendChild(title)
    
    // 複製表格並調整樣式
    const tableClone = element.cloneNode(true)
    tableClone.style.width = '100%'
    tableClone.style.fontSize = '14px'
    tableClone.style.borderCollapse = 'collapse'
    tableClone.style.fontFamily = 'Arial, sans-serif'
    tableClone.style.border = '1px solid #666'
    tableClone.style.tableLayout = 'fixed'

    // 調整表格內部樣式
    if (searchForm.value.reportType === 'comparison') {
      // 特別處理比較表的表頭
      const thead = tableClone.querySelector('thead')
      const firstRow = thead.querySelector('tr:first-child')
      const secondRow = thead.querySelector('tr:last-child')
      
      // 確保第一行的廣告渠道和平台欄位正確顯示
      const channelHeader = firstRow.querySelector('th:first-child')
      const platformHeader = firstRow.querySelector('th:nth-child(2)')
      
      if (channelHeader && platformHeader) {
        channelHeader.setAttribute('rowspan', '2')
        platformHeader.setAttribute('rowspan', '2')
        channelHeader.style.backgroundColor = '#607D8B'
        platformHeader.style.backgroundColor = '#607D8B'
        channelHeader.style.position = 'relative'
        platformHeader.style.position = 'relative'
        channelHeader.style.zIndex = '2'
        platformHeader.style.zIndex = '2'
        channelHeader.style.verticalAlign = 'middle'
        platformHeader.style.verticalAlign = 'middle'
        channelHeader.style.height = '86px'
        platformHeader.style.height = '86px'
      }

      // 調整所有 sub-header-cell 的樣式
      const subHeaderCells = secondRow.querySelectorAll('.sub-header-cell, .sub-header-cell-quarter')
      subHeaderCells.forEach(cell => {
        cell.style.backgroundColor = cell.classList.contains('sub-header-cell-quarter') ? '#00ACC1' : '#607D8B'
        cell.style.color = 'white'
        cell.style.padding = '8px'
        cell.style.fontSize = '12px'
        cell.style.fontWeight = '600'
        cell.style.whiteSpace = 'nowrap'
        cell.style.borderRight = '1px solid rgba(255, 255, 255, 0.3)'
        cell.style.borderBottom = '1px solid #666'
        cell.style.minWidth = '80px'
      })
    }

    const headerCells = tableClone.querySelectorAll('thead th')
    headerCells.forEach(cell => {
      cell.style.backgroundColor = '#607D8B'
      cell.style.color = 'white'
      cell.style.padding = '12px 8px'
      cell.style.fontSize = '16px'
      cell.style.fontWeight = 'bold'
      cell.style.borderRight = '1px solid rgba(255, 255, 255, 0.3)'
      cell.style.borderBottom = '1px solid #666'
      cell.style.whiteSpace = 'nowrap'
      cell.style.overflow = 'hidden'
      cell.style.textOverflow = 'ellipsis'
      
      if (cell.classList.contains('header-cell-quarter')) {
        cell.style.backgroundColor = '#00ACC1'
      }
    })

    // 特別處理渠道名稱單元格
    const channelCells = tableClone.querySelectorAll('td[rowspan]')
    channelCells.forEach(cell => {
      cell.style.backgroundColor = '#f8f9fa'
      cell.style.verticalAlign = 'middle'
      cell.style.fontWeight = 'bold'
      cell.style.borderRight = '1px solid #666'
      cell.style.position = 'relative'
    })

    // 修改平台欄位寬度
    const platformCells = tableClone.querySelectorAll('.platform-col')
    platformCells.forEach(cell => {
      cell.style.backgroundColor = '#f8f9fa'
      cell.style.verticalAlign = 'middle'
      cell.style.borderRight = '1px solid #666'
    })

    const bodyCells = tableClone.querySelectorAll('tbody td:not([rowspan])')
    bodyCells.forEach(cell => {
      cell.style.padding = '10px 8px'
      cell.style.fontSize = '14px'
      cell.style.borderRight = '1px solid #666'
      cell.style.borderBottom = '1px solid #666'
      cell.style.textAlign = 'center'
      cell.style.whiteSpace = 'nowrap'
      cell.style.overflow = 'hidden'
      cell.style.textOverflow = 'ellipsis'
      
      if (cell.classList.contains('quarter-col')) {
        cell.style.backgroundColor = '#FFE0B2'
        cell.style.fontWeight = 'bold'
        cell.style.minWidth = '100px'
      } else if (cell.classList.contains('total-col')) {
        cell.style.backgroundColor = '#e2e2e2'
        cell.style.fontWeight = 'bold'
        cell.style.minWidth = '140px'
      } else if (cell.classList.contains('month-col')) {
        cell.style.width = '100px'
        cell.style.backgroundColor = 'white'
      }
      
      if (cell.parentElement.classList.contains('monthly-total-row')) {
        cell.style.backgroundColor = '#e9ecef'
        cell.style.fontWeight = 'bold'
        
        // 確保月度總計列中的季度欄位保持橘色背景
        if (cell.classList.contains('quarter-col')) {
          cell.style.backgroundColor = '#FFE0B2'
        }
      }

      if (cell.classList.contains('highlight-total')) {
        cell.style.backgroundColor = '#ffd700'
      }
    })

    container.appendChild(tableClone)

    // 將容器添加到文檔中
    document.body.appendChild(container)

    // 計定 PDF 選項
    const opt = {
      margin: 5,
      filename: searchForm.value.reportType === 'lineExpense' 
        ? `${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}行銷各線實際支出表(${searchForm.value.month}月).pdf`
        : `${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}.pdf`,
      image: { type: 'jpeg', quality: 0.9 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
        onclone: function(clonedDoc) {
          // 在克隆的文檔中重新處理 rowspan
          const clonedTable = clonedDoc.querySelector('.budget-table')
          if (clonedTable) {
            const rowspanCells = clonedTable.querySelectorAll('td[rowspan]')
            rowspanCells.forEach(cell => {
              const rowspan = cell.getAttribute('rowspan')
              if (rowspan) {
                cell.style.height = `${parseInt(rowspan) * 43}px`
              }
            })
          }
        }
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape',
        compress: true,
        precision: 16,
        putOnlyUsedFonts: true
      }
    }

    try {
      await html2pdf()
        .from(container)
        .set(opt)
        .save()
      createSnackbar({ text: 'PDF 匯出成功', snackbarProps: { color: 'teal-lighten-1' } })
    } catch (error) {
      console.error('PDF 生成失敗:', error)
      throw error
    } finally {
      // 移除臨時容器
      document.body.removeChild(container)
    }
  } catch (error) {
    handleError(error)
  } finally {
    isExporting.value = false
  }
}


// 錯誤處理
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
  await loadOptions()
})

const getThemeName = (themeId) => {
  const theme = themeOptions.value.find(t => t._id === themeId)
  return theme ? theme.name : ''
}

const processBudgetData = (data) => {
  const channelGroups = {}
  
  data.items.forEach(item => {
    if (!channelGroups[item.channel._id]) {
      channelGroups[item.channel._id] = {
        channelName: item.channel.name,
        platforms: []
      }
    }
    
    channelGroups[item.channel._id].platforms.push({
      platformName: item.platform.name,
      budget: item.monthlyBudget
    })
  })

  return Object.values(channelGroups)
}

// 處理預算與實際支出比較資料
const processComparisonData = (budgetData, expenseData) => {
  const channelMap = new Map()

  // 先處理預算資料
  budgetData.forEach(channel => {
    if (!channelMap.has(channel.channelName)) {
      channelMap.set(channel.channelName, {
        channelName: channel.channelName,
        platforms: new Map()
      })
    }

    channel.platforms.forEach(platform => {
      const platformMap = channelMap.get(channel.channelName).platforms
      if (!platformMap.has(platform.platformName)) {
        platformMap.set(platform.platformName, {
          platformName: platform.platformName,
          budget: platform.budget || null,
          expense: null,
          hasBudget: true,
          hasExpense: false
        })
      }
    })
  })

  // 處理實際支出資料
  expenseData.forEach(channel => {
    if (!channelMap.has(channel.channelName)) {
      channelMap.set(channel.channelName, {
        channelName: channel.channelName,
        platforms: new Map()
      })
    }

    channel.platforms.forEach(platform => {
      const platformMap = channelMap.get(channel.channelName).platforms
      if (!platformMap.has(platform.platformName)) {
        platformMap.set(platform.platformName, {
          platformName: platform.platformName,
          budget: null,
          expense: platform.expense,
          hasBudget: false,
          hasExpense: true
        })
      } else {
        const existingPlatform = platformMap.get(platform.platformName)
        existingPlatform.expense = platform.expense
        existingPlatform.hasExpense = true
      }
    })
  })

  // 計算差異並轉換成陣列格式
  return Array.from(channelMap.values()).map(channel => ({
    channelName: channel.channelName,
    platforms: Array.from(channel.platforms.values()).map(platform => ({
      ...platform,
      difference: {
        JAN: (platform.budget?.JAN || 0) - (platform.expense?.JAN || 0),
        FEB: (platform.budget?.FEB || 0) - (platform.expense?.FEB || 0),
        MAR: (platform.budget?.MAR || 0) - (platform.expense?.MAR || 0),
        APR: (platform.budget?.APR || 0) - (platform.expense?.APR || 0),
        MAY: (platform.budget?.MAY || 0) - (platform.expense?.MAY || 0),
        JUN: (platform.budget?.JUN || 0) - (platform.expense?.JUN || 0),
        JUL: (platform.budget?.JUL || 0) - (platform.expense?.JUL || 0),
        AUG: (platform.budget?.AUG || 0) - (platform.expense?.AUG || 0),
        SEP: (platform.budget?.SEP || 0) - (platform.expense?.SEP || 0),
        OCT: (platform.budget?.OCT || 0) - (platform.expense?.OCT || 0),
        NOV: (platform.budget?.NOV || 0) - (platform.expense?.NOV || 0),
        DEC: (platform.budget?.DEC || 0) - (platform.expense?.DEC || 0)
      }
    }))
  }))
}

// 取  差異值的樣式類別
const getDifferenceClass = (value) => {
  return {
    'month-col': true,
    'difference-positive': value > 0,
    'difference-negative': value < 0
  }
}

// 計算月度預算總額
const getMonthlyBudgetTotal = (month) => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + (platform.budget?.[month] || 0)
    }, 0)
  }, 0)
}

// 計算月度實際支出總額
const getMonthlyExpenseTotal = (month) => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + (platform.expense?.[month] || 0)
    }, 0)
  }, 0)
}

// 計算月度差異總額
const getMonthlyDifferenceTotal = (month) => {
  return getMonthlyBudgetTotal(month) - getMonthlyExpenseTotal(month)
}

// 計算季度預算總額
const getQuarterlyBudgetTotal = (quarter) => {
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + getMonthlyBudgetTotal(month), 0)
}

// 計算季度實際支出總額
const getQuarterlyExpenseTotal = (quarter) => {
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + getMonthlyExpenseTotal(month), 0)
}

// 計算季度差異總額
const getQuarterlyDifferenceTotal = (quarter) => {
  return getQuarterlyBudgetTotal(quarter) - getQuarterlyExpenseTotal(quarter)
}

// 計算平台總預算
const getPlatformBudgetTotal = (budget) => {
  if (!budget) return 0
  return Object.values(budget).reduce((sum, value) => sum + (value || 0), 0)
}

// 計算平台總實際支出
const getPlatformExpenseTotal = (expense) => {
  if (!expense) return 0
  return Object.values(expense).reduce((sum, value) => sum + (value || 0), 0)
}

// 計算平台總差異
const getPlatformDifference = (platform) => {
  return getPlatformBudgetTotal(platform.budget) - getPlatformExpenseTotal(platform.expense)
}

// 計算年度總預算
const getGrandBudgetTotal = () => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + getPlatformBudgetTotal(platform.budget)
    }, 0)
  }, 0)
}

// 計算年度總實際支出
const getGrandExpenseTotal = () => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + getPlatformExpenseTotal(platform.expense)
    }, 0)
  }, 0)
}

// 計算年度總差異
const getGrandDifferenceTotal = () => {
  return getGrandBudgetTotal() - getGrandExpenseTotal()
}

// 計算單一平台的季度預算總額
const getPlatformQuarterlyBudget = (platform, quarter) => {
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + (platform.budget?.[month] || 0), 0)
}

// 計算單一平台的季度實際支出總額
const getPlatformQuarterlyExpense = (platform, quarter) => {
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + (platform.expense?.[month] || 0), 0)
}

// 計算單一平台的季度差異
const getPlatformQuarterlyDifference = (platform, quarter) => {
  return getPlatformQuarterlyBudget(platform, quarter) - getPlatformQuarterlyExpense(platform, quarter)
}

const getLineName = (lineId) => {
  if (typeof lineId === 'string') {
    const line = lineOptions.value.find(l => l._id === lineId)
    return line ? line.name : lineId
  }
  return lineId?.name || ''
}

// 定義 processLineExpenseData 函數
const processLineExpenseData = (data) => {
  // 如果沒有數據，返回一個空的平台列表
  if (!data || data.length === 0 || !Array.isArray(data)) {
    return [{
      platformName: '無資料',
      expenses: {},
      total: 0
    }]
  }
  
  // 過濾掉 Total 平台的數據，因為它是總計
  const filteredData = data.filter(item => item.platformName !== 'Total')
  
  // 如果過濾後沒有數據，也返回空的平台列表
  if (filteredData.length === 0) {
    return [{
      platformName: '無資料',
      expenses: {},
      total: 0
    }]
  }
  
  return filteredData.map(item => ({
    platformName: item.platformName,
    expenses: item.expenses || {},
    total: item.total || Object.values(item.expenses || {}).reduce((sum, value) => sum + (value || 0), 0)
  }))
}

// 確保線別 ID 是有效的 ObjectId 格式
const validObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id)

// 在 script setup 中添加 selectAllLines 函數
const selectAllLines = () => {
  if (searchForm.value.line.length === lineOptions.value.length) {
    searchForm.value.line = []
  } else {
    searchForm.value.line = lineOptions.value.map(line => line._id)
  }
  handleLineChange()
}

// 在 script setup 中添加總表專用的計算方法
const getLineExpenseTotalMonthly = (month) => {
  if (!reportData.value || searchForm.value.reportType !== 'lineExpenseTotal') return 0
  return reportData.value.reduce((sum, line) => sum + (Number(line.expenses[month]) || 0), 0)
}

const getLineExpenseTotalQuarterly = (quarter) => {
  if (!reportData.value || searchForm.value.reportType !== 'lineExpenseTotal') return 0
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + getLineExpenseTotalMonthly(month), 0)
}

const getLineExpenseTotalGrand = () => {
  if (!reportData.value || searchForm.value.reportType !== 'lineExpenseTotal') return 0
  return reportData.value.reduce((sum, line) => {
    return sum + Object.values(line.expenses).reduce((lineSum, value) => lineSum + (Number(value) || 0), 0)
  }, 0)
}

// 添加圖表相關的計算屬性
const pieChartOption = computed(() => {
  if (!reportData.value || !Array.isArray(reportData.value) || reportData.value.length === 0) {
    return {
      title: {
        text: '各線別費用佔比',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          padding: [0, 0, 20, 0]
        }
      },
      series: [{
        type: 'pie',
        data: []
      }]
    }
  }

  // 計算總金額
  const total = reportData.value.reduce((sum, line) => {
    if (!line.expenses) return sum
    return sum + Object.values(line.expenses).reduce((lineSum, value) => 
      lineSum + (Number(value) || 0), 0
    )
  }, 0)

  // 準備圓餅圖數據
  const pieData = reportData.value
    .filter(line => line.expenses)
    .map(line => {
      const lineTotal = Object.values(line.expenses).reduce((sum, value) => 
        sum + (Number(value) || 0), 0
      )
      // 找到對應的 line option 以獲取 order
      const lineOption = lineOptions.value.find(opt => opt.name === line.lineName)
      return {
        name: line.lineName || '',
        value: lineTotal,
        percentage: total > 0 ? ((lineTotal / total) * 100).toFixed(2) : '0.00',
        order: lineOption?.order || 999 // 如果找不到 order，給一個大數字
      }
    })
    .sort((a, b) => a.order - b.order) // 根據 order 排序

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}<br/>金額: ${params.value.toLocaleString('en-US')}<br/>佔比: ${params.data.percentage}%`
      }
    },
    series: [
      {
        name: '費用佔比',
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '50%'],
        roseType: false,
        itemStyle: {
          borderRadius: 3,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: {
          show: true,
          formatter: (params) => {
            return `${params.name}\n${params.value.toLocaleString('en-US')}\n${params.data.percentage}%`
          },
          fontSize: 11,
          lineHeight: 15,
          alignTo: 'edge',
          edgeDistance: '8%',
          distanceToLabelLine: 6
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 25,
          minTurnAngle: 90,
          maxSurfaceAngle: 90
        },
        labelLayout: {
          hideOverlap: false,
          moveOverlap: 'none',
          draggable: true
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: pieData,
        animationType: 'scale',
        animationEasing: 'elasticOut'
      }
    ]
  }
})

const barChartOption = computed(() => {
  if (!reportData.value || !Array.isArray(reportData.value) || reportData.value.length === 0) {
    return {

      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        type: 'bar',
        data: []
      }]
    }
  }

  // 準備長條圖數據
  const xAxisData = reportData.value
    .filter(line => line.expenses) // 確保只處理有 expenses 的數據
    .map(line => line.lineName || '')

  const seriesData = reportData.value
    .filter(line => line.expenses)
    .map(line => 
      Object.values(line.expenses).reduce((sum, value) => 
        sum + (Number(value) || 0), 0
      )
    )

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return `${params[0].name}<br/>金額: ${params[0].value.toLocaleString('en-US')}`
      }
    },
    grid: {
      left: '1%',      // 減少左邊距
      right: '2%',     // 減少右邊距
      top: '14%',
      bottom: '4%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '金額',
      nameGap: 25,     // 調整 Y 軸名稱與軸的距離
      axisLabel: {
        formatter: (value) => value.toLocaleString('en-US'),
        margin: 4      // 調整 Y 軸標籤與軸的距離
      }
    },
    series: [
      {
        name: '費用金額',
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: '#00ACC1',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => params.value.toLocaleString('en-US'),
          distance: 15,
          rotate: 20,
          fontSize: 11,
          overflow: 'break'
        },
        barWidth: '55%',
        barGap: '100%'
      }
    ]
  }
})

// 註冊必要的 ECharts 組件
// use([
//   CanvasRenderer,
//   PieChart,
//   BarChart,
//   TitleComponent,
//   TooltipComponent,
//   LegendComponent,
//   GridComponent,
//   DataZoomComponent,
//   ToolboxComponent
// ])

// 在 script setup 中添加
const pieChart = ref(null)
const barChart = ref(null)

// 監聽報表數據變化
watch(() => reportData.value, (newData) => {
  if (searchForm.value.reportType === 'lineExpenseTotal' && showReport.value && newData) {
    nextTick(() => {
      if (pieChart.value) {
        pieChart.value.resize()
      }
      if (barChart.value) {
        barChart.value.resize()
      }
    })
  }
}, { deep: true })

// 監聽 showReport 變化
watch(() => showReport.value, (newValue) => {
  if (newValue && searchForm.value.reportType === 'lineExpenseTotal') {
    nextTick(() => {
      if (pieChart.value) {
        pieChart.value.resize()
      }
      if (barChart.value) {
        barChart.value.resize()
      }
    })
  }
})

// 修改監聽器
watch([() => reportData.value, () => showReport.value], ([newData, newShowReport]) => {
  if (searchForm.value.reportType === 'lineExpenseTotal' && newShowReport && newData) {
    nextTick(async () => {
      // 等待一段時間確保 DOM 已經渲染
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (pieChart.value) {
        pieChart.value.resize()
        pieChart.value.setOption(pieChartOption.value)
      }
      if (barChart.value) {
        barChart.value.resize()
        barChart.value.setOption(barChartOption.value)
      }
    })
  }
}, { deep: true })

// 添加視窗大小變化監聽
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (searchForm.value.reportType === 'lineExpenseTotal' && showReport.value) {
    nextTick(() => {
      if (pieChart.value) {
        pieChart.value.resize()
      }
      if (barChart.value) {
        barChart.value.resize()
      }
    })
  }
}

// 匯出圖表到 PDF
const exportChartsToPDF = async () => {
  try {
    isExporting.value = true

    // 創建圓餅圖容器
    const pieContainer = document.createElement('div')
    pieContainer.style.width = '1600px'
    pieContainer.style.height = '900px'
    pieContainer.style.backgroundColor = 'white'
    pieContainer.style.padding = '20px'
    pieContainer.style.boxSizing = 'border-box'
    document.body.appendChild(pieContainer)

    // 創建長條圖容器
    const barContainer = document.createElement('div')
    barContainer.style.width = '1600px'
    barContainer.style.height = '900px'
    barContainer.style.backgroundColor = 'white'
    barContainer.style.padding = '20px'
    barContainer.style.boxSizing = 'border-box'
    document.body.appendChild(barContainer)

    // 創建新的 ECharts 實例
    const newPieChart = echarts.init(pieContainer, null, { 
      renderer: 'canvas'
    })
    const newBarChart = echarts.init(barContainer, null, { 
      renderer: 'canvas'
    })

    // 為匯出 PDF 創建特殊的圖表配置
    const exportPieOption = {
      ...pieChartOption.value,
      title: {
        ...pieChartOption.value.title,
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        ...pieChartOption.value.tooltip,
        textStyle: {
          fontSize: 16
        }
      },
      series: [{
        ...pieChartOption.value.series[0],
        label: {
          ...pieChartOption.value.series[0].label,
          fontSize: 16,
          lineHeight: 24
        },
        emphasis: {
          ...pieChartOption.value.series[0].emphasis,
          label: {
            ...pieChartOption.value.series[0].emphasis.label,
            fontSize: 16
          }
        }
      }]
    }

    const exportBarOption = {
      ...barChartOption.value,
      title: {
        ...barChartOption.value.title,
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        ...barChartOption.value.tooltip,
        textStyle: {
          fontSize: 16
        }
      },
      xAxis: {
        ...barChartOption.value.xAxis,
        axisLabel: {
          ...barChartOption.value.xAxis.axisLabel,
          fontSize: 16
        },
        nameTextStyle: {
          fontSize: 16
        }
      },
      yAxis: {
        ...barChartOption.value.yAxis,
        nameTextStyle: {
          fontSize: 16
        },
        axisLabel: {
          ...barChartOption.value.yAxis.axisLabel,
          fontSize: 16
        }
      },
      series: [{
        ...barChartOption.value.series[0],
        label: {
          ...barChartOption.value.series[0].label,
          fontSize: 16
        }
      }]
    }

    // 設置圖表選項
    newPieChart.setOption(exportPieOption)
    newBarChart.setOption(exportBarOption)

    // 等待圖表渲染完成
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      // 分別匯出兩個圖表
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      // A4 橫式尺寸為 297mm x 210mm
      // 計算置中的位置
      const pageWidth = 297
      const pageHeight = 210
      const imageWidth = 255
      const imageHeight = 142
      const x = (pageWidth - imageWidth) / 2
      const y = (pageHeight - imageHeight) / 2

      // 轉換圓餅圖為圖片並添加到第一頁
      const pieCanvasResult = await html2canvas(pieContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        onclone: function(clonedDoc) {
          const clonedContainer = clonedDoc.querySelector('div')
          if (clonedContainer) {
            clonedContainer.style.backgroundColor = 'white'
          }
        }
      })
      const pieImgData = pieCanvasResult.toDataURL('image/png', 1.0)
      doc.addImage(pieImgData, 'PNG', x, y, imageWidth, imageHeight)

      // 添加新頁面
      doc.addPage()

      // 轉換長條圖為圖片並添加到第二頁
      const barCanvasResult = await html2canvas(barContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        onclone: function(clonedDoc) {
          const clonedContainer = clonedDoc.querySelector('div')
          if (clonedContainer) {
            clonedContainer.style.backgroundColor = 'white'
          }
        }
      })
      const barImgData = barCanvasResult.toDataURL('image/png', 1.0)
      doc.addImage(barImgData, 'PNG', x, y, imageWidth, imageHeight)

      // 保存 PDF
      doc.save(`${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}行銷各線實際支出統計圖表.pdf`)
      createSnackbar({ text: 'PDF 匯出成功', snackbarProps: { color: 'teal-lighten-1' } })
    } catch (error) {
      console.error('PDF 生成失敗:', error)
      throw error
    } finally {
      // 清理
      newPieChart.dispose()
      newBarChart.dispose()
      document.body.removeChild(pieContainer)
      document.body.removeChild(barContainer)
    }
  } catch (error) {
    handleError(error)
  } finally {
    isExporting.value = false
  }
}

// 在 script setup 中添加新的狀態和方法
const showDownloadDialog = ref(false)
const downloadForm = ref({
  theme: null,
  year: null,
  selectedReports: [],
  selectedMonths: [],
  selectedLines: [],
  selectAllMonths: false,
  fileFormats: ['pdf']
})

const downloadThemeError = ref('')
const downloadYearError = ref('')

// 首先，添加一個新的 ref 來存儲下載用的年度選項
const downloadYearOptions = ref([])

// 修改 updateDownloadYearOptions 函數，使用獨立的年度選項
const updateDownloadYearOptions = async (themeId) => {
  try {
    // 分別獲取預算和實際支出的年度資料
    const [budgetRes, expenseRes] = await Promise.all([
      apiAuth.get(`/marketing/budgets/years/${themeId}`),
      apiAuth.get(`/marketing/expenses/years/${themeId}`)
    ])

    // 合併兩個來源的年度並去重
    const budgetYears = budgetRes.data.success ? budgetRes.data.result : []
    const expenseYears = expenseRes.data.success ? expenseRes.data.result : []
    const allYears = [...new Set([...budgetYears, ...expenseYears])]
    
    // 排序年度
    downloadYearOptions.value = allYears.sort((a, b) => a - b)

    // 如果當前選擇的年度不在新的選項中，清空年度選擇
    if (!downloadYearOptions.value.includes(downloadForm.value.year)) {
      downloadForm.value.year = null
    }

    // 檢查是否有年份資料
    if (downloadYearOptions.value.length === 0) {
      createSnackbar({
        text: `「${getThemeName(themeId)}」尚無任何預算或實際支出資料`,
        snackbarProps: { color: 'warning' }
      })
    } else {
      // 可選擇顯示有哪些類型的資料
      const hasBudget = budgetYears.length > 0
      const hasExpense = expenseYears.length > 0
      const message = []
      if (hasBudget) message.push('預算')
      if (hasExpense) message.push('實際支出')
      
      createSnackbar({
        text: `「${getThemeName(themeId)}」有${message.join('和')}資料`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    handleError(error)
    downloadYearOptions.value = []
    downloadForm.value.year = null
  }
}

// 修改 handleDownloadReports 函數
const handleDownloadReports = async () => {
  try {
    // 清除錯誤訊息
    downloadThemeError.value = ''
    downloadYearError.value = ''
    
    let hasError = false

    // 驗證行銷主題
    if (!downloadForm.value.theme) {
      downloadThemeError.value = '請選擇行銷主題'
      hasError = true
    }

    // 驗證年度
    if (!downloadForm.value.year) {
      downloadYearError.value = '請選擇年度'
      hasError = true
    }

    // 驗證報表類型
    if (downloadForm.value.selectedReports.length === 0) {
      createSnackbar({
        text: '請至少選擇一個報表類型',
        snackbarProps: { color: 'warning' }
      })
      hasError = true
    }

    // 驗證檔案格式 - 只有當選擇了非圖表報表時才需要驗證
    if (
      downloadForm.value.selectedReports.some(report => report !== 'charts') && 
      downloadForm.value.fileFormats.length === 0
    ) {
      createSnackbar({
        text: '請至少選擇一種檔案格式',
        snackbarProps: { color: 'warning' }
      })
      hasError = true
    }

    // 如果有選擇行銷各線實際支出表，則驗證月份和線別
    if (downloadForm.value.selectedReports.includes('lineExpense')) {
      if (downloadForm.value.selectedMonths.length === 0) {
        createSnackbar({
          text: '請至少選擇一個月份',
          snackbarProps: { color: 'warning' }
        })
        hasError = true
      }
      
      // 添加線別驗證
      if (downloadForm.value.selectedLines.length === 0) {
        createSnackbar({
          text: '請至少選擇一條線別',
          snackbarProps: { color: 'warning' }
        })
        hasError = true
      }
    }

    // 如果有任何驗證錯誤，直接返回不關閉對話框
    if (hasError) {
      return
    }

    // 以下是下載邏輯
    isExporting.value = true
    
    try {
      // 先將報表隱藏，避免渲染錯誤
      showReport.value = false
      reportData.value = []  // 清空報表數據
      
      // 設置基本查詢條件
      const tempSearchForm = {
        theme: downloadForm.value.theme,
        year: downloadForm.value.year,
        reportType: null,
        line: [],
        month: null
      }

      // 依序處理每個選擇的報表
      for (const reportType of downloadForm.value.selectedReports) {
        if (reportType === 'charts') {
          // 處理圖表下載
          tempSearchForm.reportType = 'lineExpenseTotal'
          searchForm.value = { ...tempSearchForm }
          reportData.value = []
          
          await generateReport()
          await nextTick()
          
          if (reportData.value && reportData.value.length > 0) {
            await exportChartsToPDF()
          }
          
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }
        
        tempSearchForm.reportType = reportType
        
        if (reportType === 'lineExpense') {
          tempSearchForm.line = downloadForm.value.selectedLines
          
          // 分別處理每個月份
          for (const month of downloadForm.value.selectedMonths) {
            tempSearchForm.month = month
            
            // 使用臨時的 searchForm，並確保在生成報表前清空數據
            searchForm.value = { ...tempSearchForm }
            reportData.value = []  // 重要：每次生成報表前清空數據
            
            // 等待數據加載完成
            await generateReport()
            await nextTick()
            
            // 無論是否有數據都進行匯出
            if (downloadForm.value.fileFormats.includes('pdf')) {
              await exportToPDF()
            }
            if (downloadForm.value.fileFormats.includes('excel')) {
              await exportToExcel()
            }
            
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } else {
          // 處理其他報表
          searchForm.value = { ...tempSearchForm }
          reportData.value = []  // 重要：每次生成報表前清空數據
          
          await generateReport()
          await nextTick()
          
          // 確保有數據才進行匯出
          if (reportData.value && reportData.value.length > 0) {
            if (downloadForm.value.fileFormats.includes('pdf')) {
              await exportToPDF()
            }
            if (downloadForm.value.fileFormats.includes('excel')) {
              await exportToExcel()
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      // 關閉下載對話框
      showDownloadDialog.value = false

      // 重置所有狀態
      searchForm.value = {
        year: null,
        theme: null,
        reportType: null,
        line: [],
        month: null
      }

      // 清空報表數據和隱藏報表
      showReport.value = false
      reportData.value = []

      // 等待 DOM 更新
      await nextTick()

      createSnackbar({
        text: '報表下載完成',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } finally {
      isExporting.value = false
    }
  } catch (error) {
    handleError(error)
    // 發生錯誤時也要清空數據並隱藏報表
    showReport.value = false
    reportData.value = []
  }
}

// 修改 openDownloadDialog 函數
const openDownloadDialog = () => {
  // 重置表單
  downloadForm.value = {
    theme: null,
    year: null,
    selectedReports: [],
    selectedMonths: [],
    selectedLines: [],
    selectAllMonths: false,
    fileFormats: ['pdf']
  }
  
  // 清空錯誤訊息
  downloadThemeError.value = ''
  downloadYearError.value = ''
  
  // 清空年度選項
  downloadYearOptions.value = []
  
  showDownloadDialog.value = true
}

// 添加處理全選月份的方法
const handleSelectAllMonths = () => {
  if (downloadForm.value.selectAllMonths) {
    downloadForm.value.selectedMonths = monthOptions.value.map(month => month.value)
  } else {
    downloadForm.value.selectedMonths = []
  }
}

// 添加處理全選線別的方法
const selectAllDownloadLines = () => {
  if (downloadForm.value.selectedLines.length === lineOptions.value.length) {
    downloadForm.value.selectedLines = []
  } else {
    downloadForm.value.selectedLines = lineOptions.value.map(line => line._id)
  }
}

// 監聽 selectedMonths 的變化
watch(() => downloadForm.value.selectedMonths, (newValue) => {
  downloadForm.value.selectAllMonths = newValue.length === monthOptions.value.length
}, { deep: true })

// 監聽主題變化
watch(() => downloadForm.value.theme, async (newTheme) => {
  downloadThemeError.value = ''
  downloadForm.value.year = null  // 清空年度選擇
  downloadYearOptions.value = []  // 清空年度選項
  
  if (newTheme) {
    await updateDownloadYearOptions(newTheme)
  }
})

// 監聽年度變化
watch(() => downloadForm.value.year, () => {
  downloadYearError.value = ''
})

// 監聽報表類型變化
watch(() => downloadForm.value.selectedReports, (newReports) => {
  // 如果只選擇了圖表
  if (newReports.length === 1 && newReports[0] === 'charts') {
    downloadForm.value.fileFormats = ['pdf']
  }
}, { deep: true })

</script>

<style lang="scss" scoped>
.budget-table-title {
  text-align: center;
  font-size: 24px;
  font-weight: 900 !important;
  margin-bottom: 24px;
}

.budget-table {
  width: 100%;
  border: 1px solid #666;
  border-radius: 8px;
  border-spacing: 0;
  border-collapse: separate;
  overflow: hidden;

  &.line-expense-total-table {
    :deep(thead) {
      .header-row {
        .header-cell {
          min-width: 80px !important;
          width: 80px !important;

          &:first-child {
            width: 180px !important;
            min-width: 180px !important;
          }
        }

        .header-cell-quarter {
          min-width: 80px !important;
          width: 80px !important;
        }
      }
    }

    :deep(tbody) {
      td {
        min-width: 80px !important;
        width: 80px !important;

        &:first-child {
          width: 180px !important;
          min-width: 180px !important;
        }

        &.month-col {
          min-width: 80px !important;
          width: 80px !important;
        }

        &.quarter-col {
          min-width: 80px !important;
          width: 80px !important;
        }

        &.total-col {
          min-width: 80px !important;
          width: 80px !important;
        }
      }
    }
  }

  :deep(thead) {
    .header-row {
      background-color: #607D8B;
      color: white;
      
      .header-cell {
        padding: 12px 8px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        border-right: 1px solid rgba(255, 255, 255, 0.3);
        border-bottom: 1px solid #666;
        min-width: 100px;
        vertical-align: middle;
        background-color: #607D8B;

        &:first-child {
          width: 180px;
          border-left: none;
        }
        &:nth-child(2) {
          width: 180px;
        }
        &:last-child {
          border-right: none;
        }
      }

      .header-cell-quarter {
        padding: 12px 8px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        border-right: 1px solid rgba(255, 255, 255, 0.3);
        border-bottom: 1px solid #666;
        min-width: 100px;
        vertical-align: middle;
        background-color: #00ACC1;
        
        &:last-child {
          border-right: none;
        }
      }
    }
  }

  :deep(tbody) {
    tr {
      background-color: #f8f9fa;

      td {
        padding: 4px;
        text-align: center;
        border-right: 1px solid #666;
        border-bottom: 1px solid #666;
        font-family: Arial, sans-serif;
        font-size: 14px;
        white-space: nowrap;

        &:first-child {
          border-left: none;
        }

        &:last-child {
          border-right: none;
        }

        &.month-col {
          background-color: white !important;
          min-width: 100px;
        }

        &.quarter-col {
          font-weight: 600;
          min-width: 100px;
          background-color: #FFE0B2;
        }

        &.total-col {
          background-color: #e2e2e2 !important;
          font-weight: 600;
          min-width: 140px;

          &.highlight-total {
            background-color: #ffd700 !important;
            font-weight: 700 !important;
          }
        }
      }

      &:last-child {
        td {
          border-bottom: none;


        }
      }
    }

    .monthly-total-row {
      background-color: #e9ecef !important;
      font-weight: 600;
      
      td {
        border-bottom: none;
        
        &.month-col {
          background-color: #e9ecef !important;
        }

        &.quarter-col {
          background-color: #FFE0B2 !important;
        }
      }

      &:hover {
        background-color: #e9ecef !important;
      }
    }
  }
}

.highlight-total {
  background-color: #ffd700;
  font-weight: 700;
}

.comparison-table {
  :deep(thead) {
    .header-row {
      .header-cell {
        &-quarter {
          background-color: #00ACC1 !important;
        }
      }
    }

    .sub-header-cell {
      padding: 8px;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      border-right: 1px solid rgba(255, 255, 255, 0.3);
      border-bottom: 1px solid #666;
      background-color: #607D8B;
      color: white;
      min-width: 80px;

      &-quarter {
        @extend .sub-header-cell;
        background-color: #00ACC1;
      }
    }
  }

  .difference-positive {
    color: #2E7D32;  // 綠色
    font-weight: 600;
  }

  .difference-negative {
    color: #D32F2F;  // 紅色
    font-weight: 600;
  }

  :deep(tbody) {
    tr {
      td.quarter-col {
        background-color: #FFE0B2 !important;  // 使用與原本相同的橘色

        &.difference-positive,
        &.difference-negative {
          background-color: #FFE0B2 !important;  // 使用與原本相同的橘色
        }
      }

      // 月度總計列的季度欄位
      &.monthly-total-row {
        td.quarter-col {
          background-color: #FFE0B2 !important;
        }
      }
    }
  }
}

.table-container {
  overflow-x: auto;
  margin-top: 16px;
  position: relative;
}

.sticky-buttons {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
  padding: 8px 0;
}

// .v-autocomplete  {
//   :deep(.v-field__input){
//     min-width: 100vw !important;
//     overflow: hidden;
//   }

  
// }

.charts-container {
  width: 100%;
  display: flex;
  .chart-box {
    width: 100%;
    height: 100%;
    min-height: 800px;
  }

  :deep(.echarts) {
    width: 100% !important;
    height: 100% !important;
  }
}

</style>

