<template>
  <div class="page-wrap">
    <div><slot name="projectEnv"></slot></div>
    <div class="control-list" v-if="showOperateCont">
      <slot name="operate"></slot>
    </div>
    <div class="content-info">
      <template v-if="searchLayout === 2">
        <div class="content-header">
          <div class="info-name">{{ tableTitle }}</div>
        </div>
        <slot name="form"></slot>
      </template>
      <div class="content-header clear" v-else>
        <div class="self-left info-name">{{ tableTitle }}</div>
        <div class="self-right"><slot name="form"></slot></div>
      </div>
      <div class="content-table"><slot name="table"></slot></div>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "WrapComponent",
  props: {
    tableTitle: {
      type: String,
      default: "全部内容",
    },
    searchLayout: {
      type: Number,
      default: 2,
    },
    showOperateCont: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
