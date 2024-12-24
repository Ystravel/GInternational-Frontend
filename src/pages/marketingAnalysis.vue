<template>
  <v-container max-width="2160">
    <v-row 
      class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white"
    >
      <v-col cols="12">
        <h3>行銷費用分析</h3> 
      </v-col>
      <v-col cols="12">
        <v-row>
          <v-col cols="3">
            <v-autocomplete
              label="年度"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="3">
            <v-autocomplete
              label="行銷主題"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="3">
            <v-autocomplete
              label="報表類型"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col 
            cols="3"
          >
            <v-select
              label="選擇月份"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="3">
            <v-btn
              prepend-icon="mdi-file-download"
              variant="outlined"
              color="deep-purple-darken-4"
            >
              下載報表
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
